"use client";

import { useState } from "react";
import { createClient } from "@/lib/client";

type OrderStatusProps = {
  orderId: number;
  initialStatus: string;
  initialPaymentStatus: string;
};

export default function OrderStatus({
  orderId,
  initialStatus,
  initialPaymentStatus,
}: OrderStatusProps) {
  const supabase = createClient();

  const [status, setStatus] =
    useState(initialStatus);

  const [paymentStatus, setPaymentStatus] =
    useState(initialPaymentStatus);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function saveChanges(
    newStatus: string,
    newPaymentStatus: string
  ) {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error(error);

      setMessage(
        "Unable to update order."
      );

      setSaving(false);
      return;
    }

    setStatus(newStatus);
    setPaymentStatus(newPaymentStatus);

    setMessage("Saved");

    setSaving(false);

    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  function handleStatusChange(
    newStatus: string
  ) {
    setStatus(newStatus);

    saveChanges(
      newStatus,
      paymentStatus
    );
  }

  function handlePaymentChange(
    newPaymentStatus: string
  ) {
    setPaymentStatus(
      newPaymentStatus
    );

    saveChanges(
      status,
      newPaymentStatus
    );
  }

  return (
    <div className="space-y-4">

      {/* Order Status */}
      <div>
        <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#888888]">
          Order Status
        </label>

        <select
          value={status}
          disabled={saving}
          onChange={(e) =>
            handleStatusChange(
              e.target.value
            )
          }
          className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-3 py-2.5 text-sm capitalize outline-none focus:border-[#b08d57]"
        >
          <option value="pending">
            Pending
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="shipped">
            Shipped
          </option>

          <option value="delivered">
            Delivered
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>
      </div>

      {/* Payment Status */}
      <div>
        <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#888888]">
          Payment Status
        </label>

        <select
          value={paymentStatus}
          disabled={saving}
          onChange={(e) =>
            handlePaymentChange(
              e.target.value
            )
          }
          className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-3 py-2.5 text-sm capitalize outline-none focus:border-[#b08d57]"
        >
          <option value="pending">
            Pending
          </option>

          <option value="paid">
            Paid
          </option>

          <option value="failed">
            Failed
          </option>

          <option value="refunded">
            Refunded
          </option>
        </select>
      </div>

      {saving && (
        <p className="text-xs text-[#888888]">
          Saving...
        </p>
      )}

      {message && (
        <p className="text-xs text-green-700">
          {message}
        </p>
      )}

    </div>
  );
}