import OrderStatus from "./OrderStatus";
import ShipmentManager from "./ShipmentManager";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

type OrderItem = {
  id: number;
  product_name: string;
  size: string;
  design_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type Customer = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
};

type Order = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  shipping_charge: number;
  discount: number;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  created_at: string;
  customers: Customer[] | Customer | null;
  order_items: OrderItem[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-[#f5efe5] text-[#9a7338]";

    case "confirmed":
      return "bg-blue-50 text-blue-700";

    case "processing":
      return "bg-purple-50 text-purple-700";

    case "shipped":
      return "bg-indigo-50 text-indigo-700";

    case "delivered":
      return "bg-green-50 text-green-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function paymentClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-50 text-green-700";

    case "failed":
      return "bg-red-50 text-red-700";

    case "refunded":
      return "bg-purple-50 text-purple-700";

    default:
      return "bg-[#f5efe5] text-[#9a7338]";
  }
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // --------------------------------
  // Check logged-in user
  // --------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // --------------------------------
  // Check admin
  // --------------------------------

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminUser) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-20 text-[#171717]">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold">Access Denied</h1>

          <p className="mt-3 text-sm text-[#666666]">
            You do not have permission to access the admin panel.
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------
  // Load orders
  // --------------------------------

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      payment_status,
      payment_method,
      subtotal,
      shipping_charge,
      discount,
      total_amount,
      shipping_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_state,
      shipping_pincode,
      shipping_country,
      created_at,

      customers (
        id,
        full_name,
        email,
        phone
      ),

      order_items (
        id,
        product_name,
        size,
        design_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);

    return (
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-20 text-[#171717]">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-semibold">
            Unable to load orders
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  const orderList = (orders || []) as Order[];

  // --------------------------------
  // Statistics
  // --------------------------------

  const totalOrders = orderList.length;

  const pendingOrders = orderList.filter(
    (order) => order.status === "pending"
  ).length;

  const processingOrders = orderList.filter(
    (order) => order.status === "processing"
  ).length;

  const deliveredOrders = orderList.filter(
    (order) => order.status === "delivered"
  ).length;

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Header */}

        <div className="border-b border-[#e7e5e0] pb-8">
          <a
            href="/admin"
            className="text-sm text-[#666666] transition hover:text-[#171717]"
          >
            ← Back to Dashboard
          </a>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b08d57]">
                Bhola Creations Admin
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Orders
              </h1>

              <p className="mt-2 text-sm text-[#666666]">
                View and manage customer orders.
              </p>
            </div>

            <a
              href="/admin"
              className="text-sm text-[#666666] hover:text-[#171717]"
            >
              Admin Dashboard
            </a>
          </div>
        </div>

        {/* Statistics */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-[#e7e5e0] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-[#888888]">
              Total Orders
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e5e0] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-[#888888]">
              Pending
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e5e0] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-[#888888]">
              Processing
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {processingOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e5e0] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-[#888888]">
              Delivered
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {deliveredOrders}
            </p>
          </div>

        </div>

        {/* Orders */}

        <div className="mt-8 space-y-5">

          {orderList.length === 0 ? (
            <div className="rounded-2xl border border-[#e7e5e0] bg-white px-6 py-16 text-center">

              <h2 className="text-xl font-semibold">
                No orders yet
              </h2>

              <p className="mt-2 text-sm text-[#666666]">
                Customer orders will appear here.
              </p>

            </div>
          ) : (
            orderList.map((order) => {

              const customer = Array.isArray(order.customers)
                ? order.customers[0]
                : order.customers;

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#e7e5e0] bg-white"
                >

                  {/* Order header */}

                  <div className="border-b border-[#e7e5e0] p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-[#888888]">
                          Order
                        </p>

                        <h2 className="mt-1 text-xl font-semibold">
                          #{order.order_number}
                        </h2>

                        <p className="mt-2 text-xs text-[#888888]">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${statusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${paymentClass(
                            order.payment_status
                          )}`}
                        >
                          Payment: {order.payment_status}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* Order body */}

                  <div className="grid gap-8 p-6 lg:grid-cols-[1fr_300px]">

                    {/* Items */}

                    <div>

                      <h3 className="text-sm font-semibold">
                        Items
                      </h3>

                      <div className="mt-4 divide-y divide-[#e7e5e0]">

                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                          >

                            <div>
                              <p className="text-sm font-medium">
                                {item.product_name}
                              </p>

                              <p className="mt-1 text-xs text-[#666666]">
                                Size: {item.size}
                              </p>

                              {item.design_name && (
                                <p className="mt-1 text-xs text-[#666666]">
                                  Design: {item.design_name}
                                </p>
                              )}

                              <p className="mt-1 text-xs text-[#666666]">
                                Quantity: {item.quantity}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">

                              <p className="text-sm font-medium">
                                ₹
                                {Number(item.total_price).toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              <p className="mt-1 text-xs text-[#888888]">
                                ₹
                                {Number(item.unit_price).toLocaleString(
                                  "en-IN"
                                )}{" "}
                                each
                              </p>

                            </div>

                          </div>
                        ))}

                      </div>

                    </div>

                    {/* Customer + totals */}

                    <div className="space-y-6">

                      {/* Customer */}

                      <div>

                        <h3 className="text-sm font-semibold">
                          Customer
                        </h3>

                        <div className="mt-3 text-sm">

                          <p>
                            {customer?.full_name ||
                              order.shipping_name}
                          </p>

                          <p className="mt-1 text-[#666666]">
                            {customer?.email || "—"}
                          </p>

                          <p className="mt-1 text-[#666666]">
                            {customer?.phone ||
                              order.shipping_phone}
                          </p>

                        </div>

                      </div>

                      {/* Shipping */}

                      <div>

                        <h3 className="text-sm font-semibold">
                          Shipping Address
                        </h3>

                        <div className="mt-3 text-sm leading-6 text-[#666666]">

                          <p>
                            {order.shipping_name}
                          </p>

                          <p>
                            {order.shipping_address_line1}
                          </p>

                          {order.shipping_address_line2 && (
                            <p>
                              {order.shipping_address_line2}
                            </p>
                          )}

                          <p>
                            {order.shipping_city},{" "}
                            {order.shipping_state}
                          </p>

                          <p>
                            {order.shipping_pincode}
                          </p>

                          <p>
                            {order.shipping_country}
                          </p>

                        </div>

                      </div>

                      {/* Total */}

                      <div className="border-t border-[#e7e5e0] pt-5">

                        <div className="flex justify-between text-sm">
                          <span className="text-[#666666]">
                            Subtotal
                          </span>

                          <span>
                            ₹
                            {Number(order.subtotal).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-[#666666]">
                            Shipping
                          </span>

                          <span>
                            ₹
                            {Number(
                              order.shipping_charge
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {Number(order.discount) > 0 && (
                          <div className="mt-2 flex justify-between text-sm">
                            <span className="text-[#666666]">
                              Discount
                            </span>

                            <span>
                              -₹
                              {Number(order.discount).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 flex justify-between border-t border-[#e7e5e0] pt-4 font-semibold">

                          <span>
                            Total
                          </span>

                          <span>
                            ₹
                            {Number(
                              order.total_amount
                            ).toLocaleString("en-IN")}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* --------------------------------
                      Order Management
                      -------------------------------- */}

                  <div className="border-t border-[#e7e5e0] bg-[#faf9f7] p-6">

                    <h3 className="text-sm font-semibold">
                      Manage Order
                    </h3>

                    <p className="mt-1 text-xs text-[#888888]">
                      Update the order and payment status.
                    </p>

                    <div className="mt-4 max-w-md">
                      <OrderStatus
                        orderId={order.id}
                        initialStatus={order.status}
                        initialPaymentStatus={order.payment_status}
                      />
                    </div>

                  </div>
                  <ShipmentManager orderId={order.id} />
                </div>
              );
            })
          )}

        </div>

      </div>
    </main>
  );
}