"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

type Product = {
  id: number;
  name: string;
  category_id: number;
  categories:
    | { id: number; name: string }[]
    | { id: number; name: string }
    | null;
};

type Size = {
  id: number;
  product_id: number;
  size: string;
};

type Design = {
  id: number;
  product_id: number;
  name: string;
};

type InventoryItem = {
  id: number;
  product_id: number;
  size_id: number;
  design_id: number | null;
  stock_quantity: number;
};

export default function InventoryPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        category_id,
        categories (
          id,
          name
        )
      `)
      .eq("active", true)
      .order("name");

    if (error) {
      console.error(error);
      setMessage("Unable to load products.");
      setLoading(false);
      return;
    }

    setProducts((data as Product[]) || []);

    if (data && data.length > 0) {
      setSelectedProduct(data[0].id);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (selectedProduct) {
      loadInventoryData(selectedProduct);
    }
  }, [selectedProduct]);

  async function loadInventoryData(productId: number) {
    setMessage("");

    const [sizesResult, designsResult, inventoryResult] =
      await Promise.all([
        supabase
          .from("product_sizes")
          .select("id, product_id, size")
          .eq("product_id", productId)
          .order("size"),

        supabase
          .from("product_designs")
          .select("id, product_id, name")
          .eq("product_id", productId)
          .order("name"),

        supabase
          .from("inventory")
          .select(
            "id, product_id, size_id, design_id, stock_quantity"
          )
          .eq("product_id", productId),
      ]);

    if (sizesResult.error) {
      console.error(sizesResult.error);
      setMessage("Unable to load sizes.");
      return;
    }

    if (designsResult.error) {
      console.error(designsResult.error);
      setMessage("Unable to load designs.");
      return;
    }

    if (inventoryResult.error) {
          console.error("INVENTORY ERROR:", inventoryResult.error);
          setMessage(
    `Unable to load inventory: ${inventoryResult.error.message}`
  );
      return;
    }

    setSizes(sizesResult.data || []);
    setDesigns(designsResult.data || []);
    setInventory(inventoryResult.data || []);
  }

  function getStock(sizeId: number, designId: number | null) {
    const item = inventory.find(
      (entry) =>
        entry.size_id === sizeId &&
        entry.design_id === designId
    );

    return item?.stock_quantity ?? 0;
  }

  function updateStock(
    sizeId: number,
    designId: number | null,
    value: string
  ) {
    const quantity = Math.max(0, Number(value) || 0);

    setInventory((current) => {
      const existing = current.find(
        (entry) =>
          entry.size_id === sizeId &&
          entry.design_id === designId
      );

      if (existing) {
        return current.map((entry) =>
          entry.id === existing.id
            ? {
                ...entry,
                stock_quantity: quantity,
              }
            : entry
        );
      }

      return [
        ...current,
        {
          id: 0,
          product_id: selectedProduct!,
          size_id: sizeId,
          design_id: designId,
          stock_quantity: quantity,
        },
      ];
    });
  }

  async function saveInventory() {
    if (!selectedProduct) return;

    setSaving(true);
    setMessage("");

    try {
      for (const item of inventory) {
        if (item.product_id !== selectedProduct) continue;

        const { error } = await supabase
          .from("inventory")
          .upsert(
            {
              product_id: selectedProduct,
              size_id: item.size_id,
              design_id: item.design_id,
              stock_quantity: item.stock_quantity,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "product_id,size_id,design_id",
            }
          );

        if (error) {
          throw error;
        }
      }

      await loadInventoryData(selectedProduct);

      setMessage("Inventory saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save inventory.");
    } finally {
      setSaving(false);
    }
  }

  const selectedProductData = products.find(
    (product) => product.id === selectedProduct
  );

  const categoryName = selectedProductData
    ? Array.isArray(selectedProductData.categories)
      ? selectedProductData.categories[0]?.name
      : selectedProductData.categories?.name
    : "";

  const hasDesigns = designs.length > 0;

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[#e7e5e0] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a
              href="/admin"
              className="text-sm text-[#666666] hover:text-[#171717]"
            >
              ← Back to Dashboard
            </a>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Inventory
            </h1>

            <p className="mt-2 text-sm text-[#666666]">
              Manage stock by product, size and design.
            </p>
          </div>

          <button
            onClick={saveInventory}
            disabled={saving || !selectedProduct}
            className="rounded-full bg-[#b08d57] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#9d7c4d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Inventory"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-6 rounded-xl border border-[#e7e5e0] bg-white px-5 py-4 text-sm">
            {message}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-[#666666]">
            Loading products...
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">

            {/* Product selector */}
            <aside className="rounded-2xl border border-[#e7e5e0] bg-white p-4">
              <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#888888]">
                Products
              </p>

              <div className="space-y-1">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                      selectedProduct === product.id
                        ? "bg-[#f3eee6] font-medium text-[#171717]"
                        : "text-[#666666] hover:bg-[#f8f7f4] hover:text-[#171717]"
                    }`}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </aside>

            {/* Inventory */}
            <section className="rounded-2xl border border-[#e7e5e0] bg-white p-6">

              {selectedProductData && (
                <>
                  <div className="border-b border-[#e7e5e0] pb-5">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#b08d57]">
                      {categoryName}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      {selectedProductData.name}
                    </h2>
                  </div>

                  {sizes.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[#666666]">
                      No sizes have been added to this product yet.
                    </div>
                  ) : hasDesigns ? (
                    /* Design + Size inventory */
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full min-w-[600px] text-sm">
                        <thead>
                          <tr className="border-b border-[#e7e5e0] text-left">
                            <th className="px-4 py-4 font-medium">
                              Size
                            </th>

                            {designs.map((design) => (
                              <th
                                key={design.id}
                                className="px-4 py-4 font-medium"
                              >
                                {design.name}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {sizes.map((size) => (
                            <tr
                              key={size.id}
                              className="border-b border-[#e7e5e0] last:border-0"
                            >
                              <td className="px-4 py-4 font-medium">
                                {size.size}
                              </td>

                              {designs.map((design) => (
                                <td
                                  key={design.id}
                                  className="px-4 py-3"
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    value={getStock(
                                      size.id,
                                      design.id
                                    )}
                                    onChange={(e) =>
                                      updateStock(
                                        size.id,
                                        design.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-24 rounded-lg border border-[#dcd9d2] bg-white px-3 py-2 text-center outline-none focus:border-[#b08d57]"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Normal product inventory */
                    <div className="mt-6">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sizes.map((size) => (
                          <div
                            key={size.id}
                            className="flex items-center justify-between rounded-xl border border-[#e7e5e0] px-4 py-4"
                          >
                            <span className="font-medium">
                              Size {size.size}
                            </span>

                            <input
                              type="number"
                              min="0"
                              value={getStock(size.id, null)}
                              onChange={(e) =>
                                updateStock(
                                  size.id,
                                  null,
                                  e.target.value
                                )
                              }
                              className="w-24 rounded-lg border border-[#dcd9d2] bg-white px-3 py-2 text-center outline-none focus:border-[#b08d57]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 border-t border-[#e7e5e0] pt-5">
                    <p className="text-xs text-[#888888]">
                      Enter <strong>0</strong> when a size or design is
                      currently out of stock.
                    </p>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}