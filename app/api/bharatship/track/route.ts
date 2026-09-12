import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { getBharatShipToken } from "@/lib/bharatship";

const BHARATSHIP_TRACKING_URL =
  "https://app.bharatship.com/api/v1/tracking-order";

type TrackingHistoryItem = {
  shipment_status?: number;
  tracking_date?: string;
  location?: string | null;
  log_desc?: string | null;
  awb?: string;
  status_title?: string;
};

type TrackingResponse = {
  status?: boolean;
  message?: string;
  data?: {
    summary?: {
      awb?: string;
      shipment_status?: number;
      pickup_date?: string | null;
      delivered_date?: string | null;
    };
    history?: TrackingHistoryItem[];
  };
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // -----------------------------------------------------
    // 1. Check login
    // -----------------------------------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------------------
    // 2. Check admin
    // -----------------------------------------------------

    const { data: adminUser, error: adminError } =
      await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

    if (adminError) {
      console.error(
        "Admin verification error:",
        adminError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify administrator access.",
        },
        { status: 500 }
      );
    }

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------------------
    // 3. Read request
    // -----------------------------------------------------

    const body = await request.json();

    const awb =
      typeof body.awb === "string"
        ? body.awb.trim()
        : "";

    const shipmentId =
      typeof body.shipmentId === "number"
        ? body.shipmentId
        : null;

    const orderId =
      typeof body.orderId === "number"
        ? body.orderId
        : null;

    if (!awb) {
      return NextResponse.json(
        {
          success: false,
          message: "AWB number is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(awb)) {
      return NextResponse.json(
        {
          success: false,
          message: "AWB number must contain only numbers.",
        },
        { status: 400 }
      );
    }

    if (shipmentId === null || orderId === null) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipment ID and order ID are required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 4. Confirm shipment belongs to order
    // -----------------------------------------------------

    const { data: shipment, error: shipmentError } =
      await supabase
        .from("shipments")
        .select(`
          id,
          order_id,
          status,
          bharatship_status_code,
          awb_number
        `)
        .eq("id", shipmentId)
        .eq("order_id", orderId)
        .maybeSingle();

    if (shipmentError) {
      console.error(
        "Shipment lookup error:",
        shipmentError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to find the shipment.",
        },
        { status: 500 }
      );
    }

    if (!shipment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipment not found or does not belong to this order.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 5. Get BharatShip token
    // -----------------------------------------------------

    const token = await getBharatShipToken();

    // -----------------------------------------------------
    // 6. Call BharatShip Tracking API
    // -----------------------------------------------------

    const trackingResponse = await fetch(
      BHARATSHIP_TRACKING_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          awb,
        }),
        cache: "no-store",
      }
    );

    const trackingData =
      (await trackingResponse.json()) as TrackingResponse;

    if (!trackingResponse.ok || !trackingData.status) {
      console.error(
        "BharatShip tracking failed:",
        trackingData
      );

      return NextResponse.json(
        {
          success: false,
          message:
            trackingData.message ||
            "BharatShip tracking request failed.",
        },
        {
          status:
            trackingResponse.status || 500,
        }
      );
    }

    const summary = trackingData.data?.summary;

    const history =
      trackingData.data?.history ?? [];

    // -----------------------------------------------------
    // 7. Sort tracking history oldest → newest
    // -----------------------------------------------------

    const sortedHistory = [...history].sort(
      (a, b) => {
        const dateA = a.tracking_date
          ? new Date(a.tracking_date).getTime()
          : 0;

        const dateB = b.tracking_date
          ? new Date(b.tracking_date).getTime()
          : 0;

        return dateA - dateB;
      }
    );

    const latestEvent =
      sortedHistory[sortedHistory.length - 1] ?? null;

    const statusCode =
      summary?.shipment_status ??
      latestEvent?.shipment_status ??
      null;

    const statusTitle =
      latestEvent?.status_title ||
      trackingData.message ||
      (statusCode !== null
        ? `Status ${statusCode}`
        : "Unknown");

    const latestTrackingDate =
      latestEvent?.tracking_date || null;

    const latestMessage =
      latestEvent?.log_desc ||
      trackingData.message ||
      null;

    // -----------------------------------------------------
    // 8. Update main shipment
    // -----------------------------------------------------

    const shipmentUpdate = {
      awb_number: awb,
      status: statusTitle,
      bharatship_status_code: statusCode,
      last_tracking_update:
        latestTrackingDate,
      last_tracking_message:
        latestMessage,
      shipped_at:
        summary?.pickup_date || null,
      delivered_at:
        summary?.delivered_date || null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } =
      await supabase
        .from("shipments")
        .update(shipmentUpdate)
        .eq("id", shipmentId)
        .eq("order_id", orderId);

    if (updateError) {
      console.error(
        "Shipment update error:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Tracking was fetched, but the shipment could not be updated.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // 9. Save FULL BharatShip tracking history
    // -----------------------------------------------------

    for (const event of sortedHistory) {
      if (
        event.shipment_status === undefined ||
        !event.tracking_date
      ) {
        continue;
      }

      const trackingDate =
        new Date(event.tracking_date);

      if (Number.isNaN(trackingDate.getTime())) {
        continue;
      }

      const eventStatus =
        event.status_title ||
        `Status ${event.shipment_status}`;

      const eventComment =
        event.log_desc || null;

      const eventLocation =
        event.location || null;

      // Check whether this exact BharatShip event
      // already exists for this shipment.
      const { data: existingEvent } =
        await supabase
          .from("shipment_updates")
          .select("id")
          .eq("shipment_id", shipmentId)
          .eq(
            "status_code",
            event.shipment_status
          )
          .eq(
            "tracking_date",
            trackingDate.toISOString()
          )
          .maybeSingle();

      if (existingEvent) {
        continue;
      }

      const { error: historyInsertError } =
        await supabase
          .from("shipment_updates")
          .insert({
            shipment_id: shipmentId,
            status_code: event.shipment_status,
            status: eventStatus,
            comment: eventComment,
            location: eventLocation,
            tracking_date:
              trackingDate.toISOString(),
            source: "system",
          });

      if (historyInsertError) {
        console.error(
          "Tracking history insert error:",
          historyInsertError
        );
      }
    }

    // -----------------------------------------------------
    // 10. Return result
    // -----------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "BharatShip tracking retrieved successfully.",
      status: statusTitle,
      statusCode,
      latestTrackingDate,
      latestMessage,
      historyCount: sortedHistory.length,
      data: trackingData,
    });
  } catch (error) {
    console.error(
      "BharatShip tracking route error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected BharatShip tracking error.",
      },
      { status: 500 }
    );
  }
}