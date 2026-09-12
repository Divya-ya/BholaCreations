"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

type Shipment = {
  id: number;
  order_id: number;
  awb_number: string | null;
  bharatship_status_code: number | null;
  status: string;
  weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  shipped_at: string | null;
  delivered_at: string | null;
  last_tracking_update: string | null;
  last_tracking_message: string | null;
  notes: string | null;
};

type ShipmentUpdate = {
  id: number;
  shipment_id: number;
  status_code: number | null;
  status: string;
  comment: string | null;
  location: string | null;
  tracking_date: string | null;
  source: string;
  created_at: string;
};

type ShipmentManagerProps = {
  orderId: number;
};

type TrackingResult = {
  success: boolean;
  message?: string;
};

const initialForm = {
  awbNumber: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  notes: "",
};

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ShipmentManager({
  orderId,
}: ShipmentManagerProps) {
  const supabase = createClient();

  const [shipment, setShipment] =
    useState<Shipment | null>(null);

  const [history, setHistory] =
    useState<ShipmentUpdate[]>([]);

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [tracking, setTracking] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function fetchShipment(): Promise<Shipment | null> {
    const {
      data,
      error: loadError,
    } = await supabase
      .from("shipments")
      .select(`
        id,
        order_id,
        awb_number,
        bharatship_status_code,
        status,
        weight_kg,
        length_cm,
        width_cm,
        height_cm,
        shipped_at,
        delivered_at,
        last_tracking_update,
        last_tracking_message,
        notes
      `)
      .eq("order_id", orderId)
      .maybeSingle();

    if (loadError) {
      throw new Error(loadError.message);
    }

    if (!data) {
      return null;
    }

    return data as Shipment;
  }

  async function loadHistory(
    shipmentId: number
  ) {
    setHistoryLoading(true);

    const {
      data,
      error: historyError,
    } = await supabase
      .from("shipment_updates")
      .select(`
        id,
        shipment_id,
        status_code,
        status,
        comment,
        location,
        tracking_date,
        source,
        created_at
      `)
      .eq("shipment_id", shipmentId)
      .order("tracking_date", {
        ascending: false,
        nullsFirst: false,
      });

    if (historyError) {
      console.error(
        "Error loading shipment history:",
        historyError
      );

      setHistory([]);
    } else {
      setHistory(
        (data ?? []) as ShipmentUpdate[]
      );
    }

    setHistoryLoading(false);
  }

  async function loadShipment() {
    try {
      setError("");

      const loadedShipment =
        await fetchShipment();

      if (!loadedShipment) {
        setShipment(null);
        setHistory([]);
        setForm(initialForm);
        return null;
      }

      setShipment(
        loadedShipment
      );

      setForm({
        awbNumber:
          loadedShipment.awb_number ?? "",
        weightKg:
          loadedShipment.weight_kg !== null
            ? String(
                loadedShipment.weight_kg
              )
            : "",
        lengthCm:
          loadedShipment.length_cm !== null
            ? String(
                loadedShipment.length_cm
              )
            : "",
        widthCm:
          loadedShipment.width_cm !== null
            ? String(
                loadedShipment.width_cm
              )
            : "",
        heightCm:
          loadedShipment.height_cm !== null
            ? String(
                loadedShipment.height_cm
              )
            : "",
        notes:
          loadedShipment.notes ?? "",
      });

      await loadHistory(
        loadedShipment.id
      );

      return loadedShipment;
    } catch (loadError) {
      console.error(
        "Error loading shipment:",
        loadError
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load shipment."
      );

      return null;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError("");

      const loadedShipment =
        await loadShipment();

      if (
        cancelled ||
        !loadedShipment ||
        !loadedShipment.awb_number
      ) {
        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 150)
      );

      if (cancelled) {
        return;
      }

      await syncBharatShipStatus(
        loadedShipment.awb_number,
        loadedShipment.id,
        false
      );

      if (!cancelled) {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };

    // We intentionally run this once when
    // this shipment component loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm() {
    const awb =
      form.awbNumber.trim();

    if (!awb) {
      return "Please enter the AWB number.";
    }

    if (!/^\d+$/.test(awb)) {
      return "AWB number must contain only numbers.";
    }

    if (
      !form.weightKg ||
      Number(form.weightKg) <= 0
    ) {
      return "Please enter the package weight.";
    }

    if (
      !form.lengthCm ||
      Number(form.lengthCm) <= 0
    ) {
      return "Please enter the package length.";
    }

    if (
      !form.widthCm ||
      Number(form.widthCm) <= 0
    ) {
      return "Please enter the package width.";
    }

    if (
      !form.heightCm ||
      Number(form.heightCm) <= 0
    ) {
      return "Please enter the package height.";
    }

    return "";
  }

  async function saveShipment() {
    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const shipmentData = {
        order_id: orderId,
        awb_number:
          form.awbNumber.trim(),
        status:
          shipment?.status ?? "pending",
        weight_kg:
          Number(form.weightKg),
        length_cm:
          Number(form.lengthCm),
        width_cm:
          Number(form.widthCm),
        height_cm:
          Number(form.heightCm),
        notes:
          form.notes.trim() || null,
        updated_at:
          new Date().toISOString(),
      };

      let result;

      if (shipment) {
        result = await supabase
          .from("shipments")
          .update(shipmentData)
          .eq("id", shipment.id)
          .eq("order_id", orderId)
          .select(`
            id,
            order_id,
            awb_number,
            bharatship_status_code,
            status,
            weight_kg,
            length_cm,
            width_cm,
            height_cm,
            shipped_at,
            delivered_at,
            last_tracking_update,
            last_tracking_message,
            notes
          `)
          .single();
      } else {
        result = await supabase
          .from("shipments")
          .insert(shipmentData)
          .select(`
            id,
            order_id,
            awb_number,
            bharatship_status_code,
            status,
            weight_kg,
            length_cm,
            width_cm,
            height_cm,
            shipped_at,
            delivered_at,
            last_tracking_update,
            last_tracking_message,
            notes
          `)
          .single();
      }

      if (result.error) {
        throw new Error(
          result.error.message
        );
      }

      const savedShipment =
        result.data as Shipment;

      setShipment(
        savedShipment
      );

      await loadHistory(
        savedShipment.id
      );

      setEditing(false);

      setSuccess(
        shipment
          ? "Shipment information updated."
          : "Shipment created successfully."
      );
    } catch (saveError) {
      console.error(
        "Error saving shipment:",
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save shipment."
      );
    } finally {
      setSaving(false);
    }
  }

  async function syncBharatShipStatus(
    awb: string,
    shipmentId: number,
    showMessage = true
  ) {
    if (!awb || !shipmentId) {
      return;
    }

    setTracking(true);

    if (showMessage) {
      setError("");
      setSuccess("");
    }

    try {
      const response =
        await fetch(
          "/api/bharatship/track",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              awb,
              shipmentId,
              orderId,
            }),
          }
        );

      const result =
        (await response.json()) as TrackingResult;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to fetch BharatShip tracking."
        );
      }

      const refreshedShipment =
        await fetchShipment();

      if (refreshedShipment) {
        setShipment(
          refreshedShipment
        );

        setForm({
          awbNumber:
            refreshedShipment.awb_number ??
            "",
          weightKg:
            refreshedShipment.weight_kg !==
            null
              ? String(
                  refreshedShipment.weight_kg
                )
              : "",
          lengthCm:
            refreshedShipment.length_cm !==
            null
              ? String(
                  refreshedShipment.length_cm
                )
              : "",
          widthCm:
            refreshedShipment.width_cm !==
            null
              ? String(
                  refreshedShipment.width_cm
                )
              : "",
          heightCm:
            refreshedShipment.height_cm !==
            null
              ? String(
                  refreshedShipment.height_cm
                )
              : "",
          notes:
            refreshedShipment.notes ??
            "",
        });

        await loadHistory(
          refreshedShipment.id
        );
      }

      if (showMessage) {
        setSuccess(
          "BharatShip status and tracking history updated successfully."
        );
      }
    } catch (trackingError) {
      console.error(
        "BharatShip tracking error:",
        trackingError
      );

      if (showMessage) {
        setError(
          trackingError instanceof Error
            ? trackingError.message
            : "Unable to fetch BharatShip tracking."
        );
      } else {
        console.error(
          "Automatic BharatShip sync failed."
        );
      }
    } finally {
      setTracking(false);
    }
  }

  async function handleManualSync() {
    if (
      !shipment?.awb_number ||
      tracking
    ) {
      return;
    }

    await syncBharatShipStatus(
      shipment.awb_number,
      shipment.id,
      true
    );
  }

  function startEditing() {
    setError("");
    setSuccess("");
    setEditing(true);
  }

  if (loading) {
    return (
      <div className="mt-5 border border-[#e7e5e0] bg-white p-5">
        <p className="text-sm text-[#666666]">
          Loading shipment...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 border border-[#e7e5e0] bg-white p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold">
            Shipment
          </h4>

          <p className="mt-1 text-xs text-[#888888]">
            BharatShip tracking and package
            information
          </p>
        </div>

        {shipment &&
          !editing && (
            <button
              type="button"
              onClick={
                startEditing
              }
              className="border border-[#171717] px-4 py-2 text-xs font-medium transition hover:bg-[#171717] hover:text-white"
            >
              Edit Shipment
            </button>
          )}
      </div>

      {/* Add / Edit Shipment */}
      {!shipment ||
      editing ? (
        <div className="mt-5">
          {!shipment && (
            <div className="mb-5 border border-[#e7e5e0] bg-[#faf9f7] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#b08d57]">
                Add Shipment
              </p>

              <p className="mt-2 text-xs leading-5 text-[#666666]">
                Create the shipment
                manually in
                BharatShip first.
                Then enter its AWB
                and the actual packed
                parcel information
                here.
              </p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* AWB */}
            <div className="sm:col-span-2">
              <label
                htmlFor={`awb-${orderId}`}
                className="text-xs font-medium"
              >
                AWB Number
              </label>

              <input
                id={`awb-${orderId}`}
                type="text"
                inputMode="numeric"
                value={
                  form.awbNumber
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "awbNumber",
                    event.target.value
                  )
                }
                placeholder="Example: 42830210106820"
                className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-3 py-2.5 text-sm outline-none focus:border-[#b8925a]"
              />

              <p className="mt-1 text-[11px] text-[#888888]">
                Enter the AWB
                generated by
                BharatShip.
              </p>
            </div>

            {/* Weight */}
            <div>
              <label
                htmlFor={`weight-${orderId}`}
                className="text-xs font-medium"
              >
                Actual Weight (kg)
              </label>

              <input
                id={`weight-${orderId}`}
                type="number"
                min="0.001"
                step="0.001"
                value={
                  form.weightKg
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "weightKg",
                    event.target.value
                  )
                }
                placeholder="Example: 1.500"
                className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-3 py-2.5 text-sm outline-none focus:border-[#b8925a]"
              />
            </div>

            {/* Length */}
            <div>
              <label
                htmlFor={`length-${orderId}`}
                className="text-xs font-medium"
              >
                Length (cm)
              </label>

              <input
                id={`length-${orderId}`}
                type="number"
                min="0.01"
                step="0.01"
                value={
                  form.lengthCm
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "lengthCm",
                    event.target.value
                  )
                }
                placeholder="Example: 35"
                className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-3 py-2.5 text-sm outline-none focus:border-[#b8925a]"
              />
            </div>

            {/* Width */}
            <div>
              <label
                htmlFor={`width-${orderId}`}
                className="text-xs font-medium"
              >
                Width (cm)
              </label>

              <input
                id={`width-${orderId}`}
                type="number"
                min="0.01"
                step="0.01"
                value={
                  form.widthCm
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "widthCm",
                    event.target.value
                  )
                }
                placeholder="Example: 28"
                className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-3 py-2.5 text-sm outline-none focus:border-[#b8925a]"
              />
            </div>

            {/* Height */}
            <div>
              <label
                htmlFor={`height-${orderId}`}
                className="text-xs font-medium"
              >
                Height (cm)
              </label>

              <input
                id={`height-${orderId}`}
                type="number"
                min="0.01"
                step="0.01"
                value={
                  form.heightCm
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "heightCm",
                    event.target.value
                  )
                }
                placeholder="Example: 8"
                className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-3 py-2.5 text-sm outline-none focus:border-[#b8925a]"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label
                htmlFor={`notes-${orderId}`}
                className="text-xs font-medium"
              >
                Shipment Notes
              </label>

              <textarea
                id={`notes-${orderId}`}
                rows={3}
                value={
                  form.notes
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Optional internal notes"
                className="mt-2 w-full resize-none border border-[#e7e5e0] bg-[#f8f7f4] px-3 py-2.5 text-sm outline-none focus:border-[#b8925a]"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            {shipment && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError("");
                  setSuccess("");
                }}
                className="border border-[#e7e5e0] px-4 py-2.5 text-xs font-medium transition hover:bg-[#f8f7f4]"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={
                saveShipment
              }
              disabled={saving}
              className="bg-[#b8925a] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#a67f49] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Shipment"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Shipment Summary */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#888888]">
                BharatShip Status
              </p>

              <p className="mt-1 text-sm font-medium capitalize">
                {shipment.status
                  ? shipment.status.replaceAll(
                      "_",
                      " "
                    )
                  : "Pending"}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#888888]">
                AWB Number
              </p>

              <p className="mt-1 text-sm font-medium">
                {shipment.awb_number ||
                  "Not added"}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#888888]">
                Weight
              </p>

              <p className="mt-1 text-sm font-medium">
                {shipment.weight_kg !==
                null
                  ? `${shipment.weight_kg} kg`
                  : "—"}
              </p>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#888888]">
                Dimensions
              </p>

              <p className="mt-1 text-sm font-medium">
                {shipment.length_cm !==
                  null &&
                shipment.width_cm !==
                  null &&
                shipment.height_cm !==
                  null
                  ? `${shipment.length_cm} × ${shipment.width_cm} × ${shipment.height_cm} cm`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Small Sync Button */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={
                handleManualSync
              }
              disabled={
                tracking ||
                !shipment.awb_number
              }
              title="Sync latest BharatShip update"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e7e5e0] bg-white px-3 py-1.5 text-[11px] font-medium text-[#555555] shadow-sm transition hover:border-[#b8925a] hover:bg-[#faf9f7] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={
                  tracking
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              {tracking
                ? "Syncing"
                : "Sync"}
            </button>

            {!shipment.awb_number && (
              <button
                type="button"
                onClick={
                  startEditing
                }
                className="border border-[#171717] px-5 py-2.5 text-xs font-medium transition hover:bg-[#f8f7f4]"
              >
                Add AWB
              </button>
            )}
          </div>

          {/* Latest Tracking Update */}
          {shipment.last_tracking_update && (
            <div className="mt-5 border-t border-[#e7e5e0] pt-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#888888]">
                Last Tracking Update
              </p>

              <p className="mt-1 text-sm">
                {formatDate(
                  shipment.last_tracking_update
                )}
              </p>
            </div>
          )}

          {shipment.last_tracking_message && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#888888]">
                Latest Tracking Message
              </p>

              <p className="mt-1 text-sm text-[#666666]">
                {
                  shipment.last_tracking_message
                }
              </p>
            </div>
          )}

          {/* Collapsible Tracking History */}
          <div className="mt-7 border-t border-[#e7e5e0] pt-6">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-[#e7e5e0] bg-[#faf9f7] px-4 py-4 transition hover:bg-[#f4f2ed]">
                <div>
                  <h5 className="text-sm font-semibold">
                    Tracking History
                  </h5>

                  <p className="mt-1 text-xs text-[#888888]">
                    View the complete
                    BharatShip tracking
                    timeline.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {history.length >
                    0 && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] text-[#666666]">
                      {
                        history.length
                      }{" "}
                      updates
                    </span>
                  )}

                  <span className="text-lg text-[#666666] transition-transform group-open:rotate-180">
                    ⌄
                  </span>
                </div>
              </summary>

              <div className="pt-5">
                {historyLoading ? (
                  <div className="text-sm text-[#666666]">
                    Loading tracking
                    history...
                  </div>
                ) : history.length ===
                  0 ? (
                  <div className="border border-[#e7e5e0] bg-[#faf9f7] p-4 text-xs text-[#666666]">
                    No tracking history
                    available yet. Click{" "}
                    <strong>
                      Sync
                    </strong>{" "}
                    to retrieve it.
                  </div>
                ) : (
                  <div className="relative ml-2 border-l border-[#d8d5ce] pl-6">
                    {history.map(
                      (
                        event,
                        index
                      ) => (
                        <div
                          key={`${event.id}-${event.tracking_date}-${index}`}
                          className="relative pb-7 last:pb-0"
                        >
                          <span
                            className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1 ring-[#d8d5ce] ${
                              index === 0
                                ? "bg-[#b8925a]"
                                : "bg-[#d8d5ce]"
                            }`}
                          />

                          <div className="rounded-lg border border-[#e7e5e0] bg-white p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <p className="text-sm font-medium">
                                {
                                  event.status
                                }
                              </p>

                              <p className="text-[11px] text-[#888888] sm:text-right">
                                {formatDate(
                                  event.tracking_date ||
                                    event.created_at
                                )}
                              </p>
                            </div>

                            {event.comment && (
                              <p className="mt-3 text-xs leading-5 text-[#666666]">
                                {
                                  event.comment
                                }
                              </p>
                            )}

                            {event.location && (
                              <p className="mt-2 text-xs text-[#888888]">
                                Location:{" "}
                                {
                                  event.location
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </details>
          </div>

          {/* Notes */}
          {shipment.notes && (
            <div className="mt-5 border-t border-[#e7e5e0] pt-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#888888]">
                Notes
              </p>

              <p className="mt-1 text-sm text-[#666666]">
                {shipment.notes}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
              {success}
            </div>
          )}
        </>
      )}
    </div>
  );
}