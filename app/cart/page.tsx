"use client";

import { useEffect, useState } from "react";
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
  description: string | null;
  product_images:
    | {
        image_url: string;
        is_primary: boolean;
        sort_order: number;
      }[]
    | null;
};

type CartProduct = CartItem & {
  product: Product | null;
};

export default function CartPage() {
  const supabase = createClient();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);

    const storedCart = localStorage.getItem("bholenath-cart");

    if (!storedCart) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const parsedCart = JSON.parse(storedCart);

      setCartItems(parsedCart);

      const productIds = [
        ...new Set(
          parsedCart.map(
            (item: CartItem) => item.productId
          )
        ),
      ];

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          description,
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
        setLoading(false);
        return;
      }

      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error("Cart loading error:", error);
      setCartItems([]);
    }

    setLoading(false);
  }

  function saveCart(updatedCart: CartItem[]) {
    localStorage.setItem(
      "bholenath-cart",
      JSON.stringify(updatedCart)
    );

    setCartItems(updatedCart);
  }

  function updateQuantity(
    productId: number,
    sizeId: number,
    designId: number | null,
    quantity: number
  ) {
    if (quantity < 1) {
      removeItem(
        productId,
        sizeId,
        designId
      );
      return;
    }

    const updatedCart = cartItems.map((item) => {
      if (
        item.productId === productId &&
        item.sizeId === sizeId &&
        item.designId === designId
      ) {
        return {
          ...item,
          quantity,
        };
      }

      return item;
    });

    saveCart(updatedCart);
  }

  function removeItem(
    productId: number,
    sizeId: number,
    designId: number | null
  ) {
    const updatedCart = cartItems.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.sizeId === sizeId &&
          item.designId === designId
        )
    );

    saveCart(updatedCart);
  }

  function getProduct(productId: number) {
    return products.find(
      (product) => product.id === productId
    );
  }

  function getPrimaryImage(product: Product) {
    if (!product.product_images?.length) {
      return null;
    }

    const sortedImages = [...product.product_images].sort(
      (a, b) => {
        if (a.is_primary && !b.is_primary) {
          return -1;
        }

        if (!a.is_primary && b.is_primary) {
          return 1;
        }

        return a.sort_order - b.sort_order;
      }
    );

    return sortedImages[0]?.image_url || null;
  }

  const cartProducts: CartProduct[] = cartItems.map(
    (item) => ({
      ...item,
      product: getProduct(item.productId) || null,
    })
  );

  const subtotal = cartProducts.reduce(
    (total, item) => {
      if (!item.product) return total;

      return (
        total +
        Number(item.product.price) * item.quantity
      );
    },
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm text-[#666666]">
            Loading cart...
          </p>
        </div>
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

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a
              href="/"
              className="transition hover:text-[#b08d57]"
            >
              Home
            </a>

            <a
              href="/products"
              className="transition hover:text-[#b08d57]"
            >
              Collection
            </a>

            <a
              href="/#size"
              className="transition hover:text-[#b08d57]"
            >
              Find My Size
            </a>
          </nav>

          <span className="text-sm font-medium">
            Cart
          </span>

        </div>
      </header>

      {/* Cart */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">

        <div className="border-b border-[#e7e5e0] pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b08d57]">
            Your Selection
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Shopping Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="py-20 text-center">

            <h2 className="text-2xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mt-3 text-sm text-[#666666]">
              Discover something from the Bhola Creations
              collection.
            </p>

            <a
              href="/products"
              className="mt-8 inline-block rounded-full bg-[#b08d57] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#9d7c4d]"
            >
              Shop Collection
            </a>

          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">

            {/* Items */}
            <div className="space-y-6">

              {cartProducts.map((item) => {
                const product = item.product;

                if (!product) {
                  return null;
                }

                const image = getPrimaryImage(product);

                return (
                  <div
                    key={`${item.productId}-${item.sizeId}-${item.designId}`}
                    className="flex gap-5 border-b border-[#e7e5e0] pb-6"
                  >

                    {/* Image */}
                    <div className="h-32 w-24 shrink-0 overflow-hidden bg-[#e5e2dc] sm:h-40 sm:w-32">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#888888]">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col">

                      <div className="flex justify-between gap-4">

                        <div>
                          <a
                            href={`/products/${product.id}`}
                            className="font-medium hover:text-[#b08d57]"
                          >
                            {product.name}
                          </a>

                          <p className="mt-2 text-sm text-[#666666]">
                            Size: {item.size}
                          </p>

                          {item.designName && (
                            <p className="mt-1 text-sm text-[#666666]">
                              Design: {item.designName}
                            </p>
                          )}
                        </div>

                        <p className="shrink-0 font-medium">
                          ₹
                          {(
                            Number(product.price) *
                            item.quantity
                          ).toLocaleString("en-IN")}
                        </p>

                      </div>

                      {/* Quantity */}
                      <div className="mt-auto flex items-center justify-between pt-5">

                        <div className="flex items-center rounded-lg border border-[#dcd9d2] bg-white">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.sizeId,
                                item.designId,
                                item.quantity - 1
                              )
                            }
                            className="px-3 py-2"
                          >
                            −
                          </button>

                          <span className="min-w-8 text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.sizeId,
                                item.designId,
                                item.quantity + 1
                              )
                            }
                            className="px-3 py-2"
                          >
                            +
                          </button>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.productId,
                              item.sizeId,
                              item.designId
                            )
                          }
                          className="text-xs text-[#888888] underline underline-offset-4 hover:text-[#171717]"
                        >
                          Remove
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>

            {/* Summary */}
            <aside className="h-fit rounded-2xl border border-[#e7e5e0] bg-white p-6">

              <h2 className="text-lg font-semibold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-[#666666]">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#666666]">
                    Shipping
                  </span>

                  <span>
                    Calculated at checkout
                  </span>
                </div>

              </div>

              <div className="mt-6 border-t border-[#e7e5e0] pt-6">

                <div className="flex justify-between text-base font-semibold">
                  <span>
                    Total
                  </span>

                  <span>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

              </div>

              <a
  href="/checkout"
  className="mt-6 block w-full rounded-full bg-[#b08d57] px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-[#9d7c4d]"
>
  Proceed to Checkout
</a>

              <a
                href="/products"
                className="mt-4 block text-center text-sm text-[#666666] underline underline-offset-4 hover:text-[#171717]"
              >
                Continue Shopping
              </a>

            </aside>

          </div>
        )}

      </section>
    </main>
  );
}