"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/client";

type CartItem = {
  productId: number;
  sizeId: number;
  size: string;
  designId: number | null;
  designName: string | null;
  quantity: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
  product_images:
    | {
        image_url: string;
        is_primary: boolean;
        sort_order: number;
      }[]
    | null;
};

type CheckoutItem = CartItem & {
  product: Product | null;
};

export default function CheckoutPage() {
  const supabase = createClient();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    loadCheckout();
  }, []);

  async function loadCheckout() {
    setLoading(true);
    setErrorMessage("");

    const storedCart =
      localStorage.getItem("bholenath-cart");

    if (!storedCart) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const parsedCart: CartItem[] =
        JSON.parse(storedCart);

      if (!parsedCart.length) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      setCartItems(parsedCart);

      const productIds = [
        ...new Set(
          parsedCart.map(
            (item) => item.productId
          )
        ),
      ];

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          product_images (
            image_url,
            is_primary,
            sort_order
          )
        `)
        .in("id", productIds)
        .eq("active", true);

      if (error) {
        console.error(error);
        setErrorMessage(
          "Unable to load your cart."
        );
        setLoading(false);
        return;
      }

      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error(error);

      setCartItems([]);

      setErrorMessage(
        "Unable to read your cart."
      );
    }

    setLoading(false);
  }

  function getProduct(productId: number) {
    return products.find(
      (product) => product.id === productId
    );
  }

  const checkoutItems: CheckoutItem[] =
    cartItems.map((item) => ({
      ...item,
      product:
        getProduct(item.productId) || null,
    }));

  const subtotal = checkoutItems.reduce(
    (total, item) => {
      if (!item.product) {
        return total;
      }

      return (
        total +
        Number(item.product.price) *
          item.quantity
      );
    },
    0
  );

  async function placeOrder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!cartItems.length) {
      setErrorMessage(
        "Your cart is empty."
      );
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage(
        "Please enter your full name."
      );
      return;
    }

    if (!email.trim()) {
      setErrorMessage(
        "Please enter your email."
      );
      return;
    }

    if (!phone.trim()) {
      setErrorMessage(
        "Please enter your phone number."
      );
      return;
    }

    if (!addressLine1.trim()) {
      setErrorMessage(
        "Please enter your address."
      );
      return;
    }

    if (!city.trim()) {
      setErrorMessage(
        "Please enter your city."
      );
      return;
    }

    if (!state.trim()) {
      setErrorMessage(
        "Please enter your state."
      );
      return;
    }

    if (!pincode.trim()) {
      setErrorMessage(
        "Please enter your PIN code."
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setErrorMessage(
        "Please enter a valid 6-digit PIN code."
      );
      return;
    }

    setPlacingOrder(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "create_guest_order",
          {
            p_full_name: fullName.trim(),

            p_email: email.trim(),

            p_phone: phone.trim(),

            p_address_line1:
              addressLine1.trim(),

            p_address_line2:
              addressLine2.trim(),

            p_city: city.trim(),

            p_state: state.trim(),

            p_pincode: pincode.trim(),

            p_items: cartItems.map(
              (item) => ({
                product_id:
                  item.productId,

                size_id:
                  item.sizeId,

                design_id:
                  item.designId,

                quantity:
                  item.quantity,
              })
            ),
          }
        );

      if (error) {
        console.error(
          "Order creation error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to place your order."
        );

        setPlacingOrder(false);

        return;
      }

      const order = Array.isArray(data)
        ? data[0]
        : data;

      localStorage.removeItem(
        "bholenath-cart"
      );

      setCartItems([]);

      setSuccessMessage(
        `Order placed successfully! Your order number is ${order?.order_number || "being generated"}.`
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Something went wrong while placing your order."
      );
    }

    setPlacingOrder(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm text-[#666666]">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  if (successMessage) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">

        <header className="border-b border-[#e7e5e0]">
          <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
            <a
              href="/"
              className="text-xl font-semibold tracking-[0.18em]"
            >
              BHOLA CREATIONS
            </a>
          </div>
        </header>

        <section className="mx-auto max-w-2xl px-6 py-24 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#b08d57] text-2xl text-white">
            ✓
          </div>

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-[#b08d57]">
            Thank You
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Order Confirmed
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#666666]">
            {successMessage}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <a
              href="/products"
              className="rounded-full bg-[#b08d57] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#9d7c4d]"
            >
              Continue Shopping
            </a>

            <a
              href="/"
              className="rounded-full border border-[#dcd9d2] bg-white px-7 py-3 text-sm font-medium transition hover:border-[#b08d57]"
            >
              Back to Home
            </a>

          </div>

        </section>
      </main>
    );
  }

  if (!cartItems.length) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">

        <header className="border-b border-[#e7e5e0]">
          <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
            <a
              href="/"
              className="text-xl font-semibold tracking-[0.18em]"
            >
              BHOLA CREATIONS
            </a>
          </div>
        </header>

        <section className="mx-auto max-w-2xl px-6 py-24 text-center">

          <h1 className="text-3xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            Add something from the collection before
            proceeding to checkout.
          </p>

          <a
            href="/products"
            className="mt-8 inline-block rounded-full bg-[#b08d57] px-7 py-3 text-sm font-medium text-white"
          >
            Shop Collection
          </a>

        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">

      {/* Header */}
      <header className="border-b border-[#e7e5e0] bg-[#f8f7f4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

          <a
            href="/"
            className="text-xl font-semibold tracking-[0.18em]"
          >
            BHOLA CREATIONS
          </a>

          <a
            href="/cart"
            className="text-sm text-[#666666] hover:text-[#171717]"
          >
            ← Cart
          </a>

        </div>
      </header>

      {/* Checkout */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">

        <div className="border-b border-[#e7e5e0] pb-8">

          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b08d57]">
            Complete Your Order
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Checkout
          </h1>

        </div>

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={placeOrder}
          className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]"
        >

          {/* Customer Details */}
          <div className="space-y-8">

            <div className="rounded-2xl border border-[#e7e5e0] bg-white p-6">

              <h2 className="text-lg font-semibold">
                Contact Information
              </h2>

              <div className="mt-6 grid gap-5">

                <div>
                  <label className="text-sm font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="10-digit mobile number"
                    className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
                  />
                </div>

              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl border border-[#e7e5e0] bg-white p-6">

              <h2 className="text-lg font-semibold">
                Shipping Address
              </h2>

              <div className="mt-6 grid gap-5">

                <div>
                  <label className="text-sm font-medium">
                    Address
                  </label>

                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) =>
                      setAddressLine1(e.target.value)
                    }
                    placeholder="House number, street, area"
                    className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Address Line 2
                    <span className="ml-2 text-xs font-normal text-[#888888]">
                      Optional
                    </span>
                  </label>

                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) =>
                      setAddressLine2(e.target.value)
                    }
                    placeholder="Apartment, landmark, etc."
                    className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="text-sm font-medium">
                      City
                    </label>

                    <input
                      type="text"
                      value={city}
                      onChange={(e) =>
                        setCity(e.target.value)
                      }
                      placeholder="City"
                      className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      State
                    </label>

                    <input
                      type="text"
                      value={state}
                      onChange={(e) =>
                        setState(e.target.value)
                      }
                      placeholder="State"
                      className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
                    />
                  </div>

                </div>

                <div>
                  <label className="text-sm font-medium">
                    PIN Code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) =>
                      setPincode(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="6-digit PIN code"
                    className="mt-2 w-full rounded-lg border border-[#dcd9d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
                  />
                </div>

              </div>
            </div>

          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl border border-[#e7e5e0] bg-white p-6">

            <h2 className="text-lg font-semibold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-5">

              {checkoutItems.map((item) => {

                if (!item.product) {
                  return null;
                }

                const image =
                  item.product.product_images
                    ?.sort((a, b) => {
                      if (
                        a.is_primary &&
                        !b.is_primary
                      ) {
                        return -1;
                      }

                      if (
                        !a.is_primary &&
                        b.is_primary
                      ) {
                        return 1;
                      }

                      return (
                        a.sort_order -
                        b.sort_order
                      );
                    })[0]?.image_url;

                return (
                  <div
                    key={`${item.productId}-${item.sizeId}-${item.designId}`}
                    className="flex gap-4"
                  >

                    <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#e5e2dc]">

                      {image ? (
                        <img
                          src={image}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-[#888888]">
                          No image
                        </div>
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs text-[#666666]">
                        Size: {item.size}
                      </p>

                      {item.designName && (
                        <p className="mt-1 text-xs text-[#666666]">
                          Design: {item.designName}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-[#666666]">
                        Quantity: {item.quantity}
                      </p>

                    </div>

                    <p className="shrink-0 text-sm font-medium">
                      ₹
                      {(
                        Number(item.product.price) *
                        item.quantity
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>
                );
              })}

            </div>

            <div className="mt-6 border-t border-[#e7e5e0] pt-6">

              <div className="flex justify-between text-sm">
                <span className="text-[#666666]">
                  Subtotal
                </span>

                <span>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-[#666666]">
                  Shipping
                </span>

                <span>
                  ₹0
                </span>
              </div>

              <div className="mt-5 flex justify-between border-t border-[#e7e5e0] pt-5 text-base font-semibold">
                <span>
                  Total
                </span>

                <span>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="mt-6 w-full rounded-full bg-[#b08d57] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#9d7c4d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-[#888888]">
              Payment will be added in the next step.
              Your order will currently be created as
              pending.
            </p>

          </aside>

        </form>

      </section>
    </main>
  );
}