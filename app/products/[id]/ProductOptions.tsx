"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductSize = {
  id: number;
  size: string;
};

type ProductDesign = {
  id: number;
  name: string;
};

type InventoryItem = {
  id: number;
  size_id: number;
  design_id: number | null;
  stock_quantity: number;
};

type CartItem = {
  productId: number;
  sizeId: number;
  size: string;
  designId: number | null;
  designName: string | null;
  quantity: number;
};

type ProductOptionsProps = {
  productId: number;
  sizes: ProductSize[];
  designs: ProductDesign[];
  inventory: InventoryItem[];
};

export default function ProductOptions({
  productId,
  sizes,
  designs,
  inventory,
}: ProductOptionsProps) {
  const router = useRouter();

  const [selectedSize, setSelectedSize] =
    useState<number | null>(null);

  const [selectedDesign, setSelectedDesign] =
    useState<number | null>(
      designs.length > 0 ? designs[0].id : null
    );

  const [quantity, setQuantity] = useState(1);

  const [adding, setAdding] = useState(false);

  function getStock(
    sizeId: number,
    designId: number | null
  ) {
    const item = inventory.find(
      (entry) =>
        entry.size_id === sizeId &&
        entry.design_id === designId
    );

    return item?.stock_quantity ?? 0;
  }

  function isAvailable(sizeId: number) {
    return (
      getStock(
        sizeId,
        designs.length > 0 ? selectedDesign : null
      ) > 0
    );
  }

  const selectedStock =
    selectedSize !== null
      ? getStock(
          selectedSize,
          designs.length > 0 ? selectedDesign : null
        )
      : 0;

  function addToCart() {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }

    if (designs.length > 0 && !selectedDesign) {
      alert("Please select a design.");
      return;
    }

    if (selectedStock <= 0) {
      alert("This variant is out of stock.");
      return;
    }

    if (quantity > selectedStock) {
      alert(
        `Only ${selectedStock} item${
          selectedStock !== 1 ? "s" : ""
        } available.`
      );
      return;
    }

    setAdding(true);

    const selectedSizeData = sizes.find(
      (size) => size.id === selectedSize
    );

    const selectedDesignData = designs.find(
      (design) => design.id === selectedDesign
    );

    if (!selectedSizeData) {
      setAdding(false);
      return;
    }

    const newItem: CartItem = {
      productId,
      sizeId: selectedSize,
      size: selectedSizeData.size,
      designId:
        designs.length > 0
          ? selectedDesign
          : null,
      designName:
        designs.length > 0
          ? selectedDesignData?.name || null
          : null,
      quantity,
    };

    try {
      const existingCart =
        localStorage.getItem("bholenath-cart");

      const cart: CartItem[] = existingCart
        ? JSON.parse(existingCart)
        : [];

      const existingItemIndex = cart.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.sizeId === newItem.sizeId &&
          item.designId === newItem.designId
      );

      if (existingItemIndex >= 0) {
        const newQuantity =
          cart[existingItemIndex].quantity +
          newItem.quantity;

        if (newQuantity > selectedStock) {
          alert(
            `You already have ${cart[existingItemIndex].quantity} in your cart. Only ${selectedStock} available.`
          );

          setAdding(false);
          return;
        }

        cart[existingItemIndex] = {
          ...cart[existingItemIndex],
          quantity: newQuantity,
        };
      } else {
        cart.push(newItem);
      }

      localStorage.setItem(
        "bholenath-cart",
        JSON.stringify(cart)
      );

      router.push("/cart");
    } catch (error) {
      console.error("Unable to add item to cart:", error);
      alert("Unable to add this product to cart.");
      setAdding(false);
    }
  }

  return (
    <div className="mt-8">

      {/* Design */}
      {designs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold">
            Select Design
          </h2>

          <div className="mt-3 flex flex-wrap gap-3">
            {designs.map((design) => (
              <button
                key={design.id}
                type="button"
                onClick={() => {
                  setSelectedDesign(design.id);
                  setSelectedSize(null);
                  setQuantity(1);
                }}
                className={`rounded-full border px-5 py-2.5 text-sm transition ${
                  selectedDesign === design.id
                    ? "border-[#b08d57] bg-[#b08d57] text-white"
                    : "border-[#dcd9d2] bg-white hover:border-[#b08d57]"
                }`}
              >
                {design.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      <div className="mt-8">

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Select Size
          </h2>

          <a
            href="/#size"
            className="text-xs text-[#b08d57] underline underline-offset-4"
          >
            Find My Size
          </a>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {sizes.map((size) => {
            const available = isAvailable(size.id);

            return (
              <button
                key={size.id}
                type="button"
                disabled={!available}
                onClick={() => {
                  setSelectedSize(size.id);
                  setQuantity(1);
                }}
                className={`min-w-16 rounded-lg border px-4 py-3 text-sm transition ${
                  !available
                    ? "cursor-not-allowed border-[#e7e5e0] bg-[#f3f1ed] text-[#aaa] line-through"
                    : selectedSize === size.id
                    ? "border-[#b08d57] bg-[#b08d57] text-white"
                    : "border-[#dcd9d2] bg-white hover:border-[#b08d57]"
                }`}
              >
                {size.size}
              </button>
            );
          })}
        </div>

        {selectedSize !== null &&
          selectedStock > 0 && (
            <p className="mt-3 text-xs text-[#666666]">
              {selectedStock} item
              {selectedStock !== 1 ? "s" : ""} available
            </p>
          )}
      </div>

      {/* Quantity */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold">
          Quantity
        </h2>

        <div className="mt-3 flex w-fit items-center rounded-lg border border-[#dcd9d2] bg-white">

          <button
            type="button"
            onClick={() =>
              setQuantity((current) =>
                Math.max(1, current - 1)
              )
            }
            className="px-4 py-3 text-lg"
          >
            −
          </button>

          <span className="min-w-10 text-center text-sm">
            {quantity}
          </span>

          <button
            type="button"
            disabled={
              selectedStock === 0 ||
              quantity >= selectedStock
            }
            onClick={() =>
              setQuantity((current) =>
                Math.min(
                  selectedStock,
                  current + 1
                )
              )
            }
            className="px-4 py-3 text-lg disabled:cursor-not-allowed disabled:text-[#aaa]"
          >
            +
          </button>

        </div>
      </div>

      {/* Add to Cart */}
      <button
        type="button"
        onClick={addToCart}
        disabled={
          selectedSize === null ||
          selectedStock <= 0 ||
          adding
        }
        className="mt-8 w-full rounded-full bg-[#b08d57] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#9d7c4d] disabled:cursor-not-allowed disabled:bg-[#c9c4bb]"
      >
        {adding
          ? "Adding..."
          : selectedSize !== null &&
            selectedStock > 0
          ? "Add to Cart"
          : "Select an Available Size"}
      </button>

      <p className="mt-3 text-center text-xs text-[#888888]">
        Free shipping details will be added during checkout.
      </p>

    </div>
  );
}