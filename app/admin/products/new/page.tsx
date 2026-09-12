"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Error loading categories:", error);
        setError("Unable to load categories.");
      } else {
        setCategories(data ?? []);
      }

      setLoadingCategories(false);
    }

    loadCategories();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSaving(true);

    // Create URL-friendly slug automatically
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        category_id: Number(categoryId),
        price: Number(price),
        description: description.trim() || null,
        slug,
        featured,
        active,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating product:", error);
      setError(error.message);
      setSaving(false);
      return;
    }

    // Product created successfully
    router.push(`/admin/products/${data.id}/edit`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">

      {/* Header */}

      <header className="border-b border-[#e7e5e0] bg-white">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          <div>
            <a
              href="/admin"
              className="text-xl font-semibold tracking-[0.22em]"
            >
              BHOLA CREATIONS
            </a>

            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#b8925a]">
              Admin Portal
            </p>
          </div>

          <div className="flex items-center gap-6">

            <a
              href="/admin/products"
              className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
            >
              Products
            </a>

            <a
              href="/admin"
              className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
            >
              Dashboard
            </a>

          </div>

        </div>

      </header>


      {/* Page */}

      <section className="mx-auto max-w-4xl px-6 py-12 lg:px-8">

        {/* Heading */}

        <div>

          <a
            href="/admin/products"
            className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
          >
            ← Back to Products
          </a>

          <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#b8925a]">
            Catalogue
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Add Product
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            Add a new product to the Bhola Creations catalogue.
          </p>

        </div>


        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="mt-10 border border-[#e7e5e0] bg-white p-6 sm:p-8"
        >

          {/* Product Name */}

          <div>

            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Product Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Premium White Sherwani"
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
              required
            />

          </div>


          {/* Category */}

          <div className="mt-6">

            <label
              htmlFor="category"
              className="text-sm font-medium"
            >
              Category
            </label>

            <select
              id="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={loadingCategories}
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
              required
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

          </div>


          {/* Price */}

          <div className="mt-6">

            <label
              htmlFor="price"
              className="text-sm font-medium"
            >
              Price (₹)
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="3500"
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
              required
            />

          </div>


          {/* Description */}

          <div className="mt-6">

            <label
              htmlFor="description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the product..."
              rows={5}
              className="mt-2 w-full resize-none border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
            />

          </div>


          {/* Options */}

          <div className="mt-8 border-t border-[#e7e5e0] pt-6">

            <h2 className="text-sm font-medium">
              Product Settings
            </h2>

            <div className="mt-5 space-y-4">

              <label className="flex items-center gap-3 text-sm">

                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) => setFeatured(event.target.checked)}
                  className="h-4 w-4"
                />

                <span>
                  Featured product
                </span>

              </label>


              <label className="flex items-center gap-3 text-sm">

                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="h-4 w-4"
                />

                <span>
                  Active — show this product in the store
                </span>

              </label>

            </div>

          </div>


          {/* Error */}

          {error && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* Buttons */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <a
              href="/admin/products"
              className="border border-[#e7e5e0] px-6 py-3 text-center text-sm font-medium transition hover:border-[#171717]"
            >
              Cancel
            </a>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#b8925a] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#a67f49] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Product"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}