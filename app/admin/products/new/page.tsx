"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

const DEFAULT_SIZES = [
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
];

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const [availableSizes, setAvailableSizes] =
    useState<string[]>(DEFAULT_SIZES);

  const [selectedSizes, setSelectedSizes] =
    useState<string[]>([]);

  const [newSize, setNewSize] = useState("");
  const [showAddSize, setShowAddSize] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);

  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [primaryImageIndex, setPrimaryImageIndex] =
    useState(0);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

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

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

  // Toggle size selection
  function toggleSize(size: string) {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  }

  // Add a custom size
  function addNewSize() {
    const cleanSize = newSize.trim();

    if (!cleanSize) {
      setError("Please enter a size.");
      return;
    }

    // Only numeric sizes
    if (!/^\d+$/.test(cleanSize)) {
      setError("Please enter a numeric size only.");
      return;
    }

    // Prevent duplicates
    if (
      availableSizes.some(
        (size) => size === cleanSize
      )
    ) {
      setError(`Size ${cleanSize} already exists.`);
      return;
    }

    const updatedSizes = [
      ...availableSizes,
      cleanSize,
    ].sort((a, b) => Number(a) - Number(b));

    setAvailableSizes(updatedSizes);

    // Automatically select new size
    setSelectedSizes((current) => [
      ...current,
      cleanSize,
    ]);

    setNewSize("");
    setShowAddSize(false);
    setError("");
  }

  // Reset the entire form
  function resetForm() {
    // Revoke current preview URLs
    imagePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    setName("");
    setCategoryName("");
    setPrice("");
    setDescription("");

    setFeatured(false);
    setActive(true);

    setAvailableSizes(DEFAULT_SIZES);
    setSelectedSizes([]);

    setNewSize("");
    setShowAddSize(false);

    setSelectedImages([]);
    setImagePreviews([]);
    setPrimaryImageIndex(0);

    setCategoryOpen(false);

    setError("");
  }

  // Select product images
  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    for (const file of files) {
      // Maximum 5 MB
      if (file.size > 5 * 1024 * 1024) {
        setError(
          `"${file.name}" is larger than 5 MB. Please choose a smaller image.`
        );

        event.target.value = "";
        return;
      }

      // Supported types
      if (!allowedTypes.includes(file.type)) {
        setError(
          `"${file.name}" is not supported. Only JPG, PNG and WebP images are allowed.`
        );

        event.target.value = "";
        return;
      }
    }

    // Clean up previous previews
    imagePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    setSelectedImages(files);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviews(previews);

    // First image is selected by default
    setPrimaryImageIndex(0);
  }

  // Get existing category or create a new category
  async function getOrCreateCategory(
    enteredCategoryName: string
  ): Promise<number | null> {
    const cleanName = enteredCategoryName.trim();

    if (!cleanName) {
      return null;
    }

    // Check categories already loaded
    const existingCategory = categories.find(
      (category) =>
        category.name.trim().toLowerCase() ===
        cleanName.toLowerCase()
    );

    if (existingCategory) {
      return existingCategory.id;
    }

    // Check database
    const {
      data: databaseCategory,
      error: findError,
    } = await supabase
      .from("categories")
      .select("id, name")
      .ilike("name", cleanName)
      .maybeSingle();

    if (findError) {
      console.error(
        "Error checking category:",
        findError
      );

      setError(findError.message);
      return null;
    }

    if (databaseCategory) {
      setCategories((current) => {
        const alreadyExists = current.some(
          (category) =>
            category.id === databaseCategory.id
        );

        if (alreadyExists) {
          return current;
        }

        return [
          ...current,
          databaseCategory,
        ].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });

      return databaseCategory.id;
    }

    // Create new category
    const {
      data: newCategory,
      error: createError,
    } = await supabase
      .from("categories")
      .insert({
        name: cleanName,
      })
      .select("id, name")
      .single();

    if (createError) {
      console.error(
        "Error creating category:",
        createError
      );

      setError(createError.message);
      return null;
    }

    setCategories((current) =>
      [...current, newCategory].sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      )
    );

    return newCategory.id;
  }

  // Upload images to Supabase Storage
  async function uploadProductImages(
    productId: number,
    productName: string,
    files: File[],
    primaryIndex: number
  ) {
    if (files.length === 0) {
      return;
    }

    for (
      let index = 0;
      index < files.length;
      index++
    ) {
      const file = files[index];

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const safeName =
        file.name
          .replace(/\.[^/.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") ||
        "product-image";

      const uniqueName =
        `${crypto.randomUUID()}-${safeName}.${extension}`;

      const storagePath =
        `products/${productId}/${uniqueName}`;

      // Upload to Supabase Storage
      const {
        error: uploadError,
      } = await supabase.storage
        .from("product-images")
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: publicUrlData,
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath);

      const imageUrl =
        publicUrlData.publicUrl;

      // Save image information
      const {
        error: insertError,
      } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: imageUrl,
          alt_text: productName,
          sort_order: index,
          is_primary:
            index === primaryIndex,
        });

      if (insertError) {
        throw insertError;
      }
    }
  }

  // Submit form
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setCategoryOpen(false);

    // Validate product name
    if (!name.trim()) {
      setError(
        "Please enter a product name."
      );
      return;
    }

    // Validate category
    if (!categoryName.trim()) {
      setError(
        "Please select or enter a category."
      );
      return;
    }

    // Validate price
    if (
      !price ||
      Number(price) < 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    // Validate sizes
    if (
      selectedSizes.length === 0
    ) {
      setError(
        "Please select at least one size."
      );
      return;
    }

    // Validate images
    if (
      selectedImages.length === 0
    ) {
      setError(
        "Please upload at least one product image."
      );
      return;
    }

    setSaving(true);

    // Get or create category
    const finalCategoryId =
      await getOrCreateCategory(
        categoryName
      );

    if (!finalCategoryId) {
      setSaving(false);
      return;
    }

    // Create slug
    const slug = name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        "");

    // Create product
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        category_id:
          finalCategoryId,
        price: Number(price),
        description:
          description.trim() ||
          null,
        slug,
        featured,
        active,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Error creating product:",
        error
      );

      setError(error.message);
      setSaving(false);
      return;
    }

    // Save sizes
    const sizeRows =
      selectedSizes.map(
        (size) => ({
          product_id: data.id,
          size,
        })
      );

    const {
      error: sizeError,
    } = await supabase
      .from("product_sizes")
      .insert(
        sizeRows
      );

    if (sizeError) {
      console.error(
        "Error saving sizes:",
        sizeError
      );

      setError(
        `Product was created, but the sizes could not be saved: ${sizeError.message}`
      );

      setSaving(false);
      return;
    }

    // Upload images
    try {
      await uploadProductImages(
        data.id,
        name.trim(),
        selectedImages,
        primaryImageIndex
      );
    } catch (uploadError) {
      console.error(
        "Image upload error:",
        uploadError
      );

      setError(
        uploadError instanceof Error
          ? `Product was created, but the image upload failed: ${uploadError.message}`
          : "Product was created, but the image upload failed."
      );

      setSaving(false);
      return;
    }

    // Success
    router.push("/admin/products");

    router.refresh();
  }

  // Filter categories while typing
  const filteredCategories =
    categories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(
            categoryName
              .trim()
              .toLowerCase()
          )
    );

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
            Add a new product to the
            Bhola Creations catalogue.
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="mt-10 border border-[#e7e5e0] bg-white p-6 sm:p-8"
        >

          {/* Form Header */}

          <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-5">

            <div>
              <h2 className="text-base font-medium">
                Product Details
              </h2>

              <p className="mt-1 text-xs text-[#888888]">
                Enter the information for your
                new product.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="border border-[#d8d4cc] px-4 py-2 text-xs font-medium text-[#666666] transition-colors hover:border-[#171717] hover:text-[#171717]"
            >
              Reset
            </button>

          </div>

          {/* Product Name */}

          <div className="mt-6">

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
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
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

            <div className="relative">

              <input
                id="category"
                type="text"
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(
                    event.target.value
                  );

                  setCategoryOpen(
                    true
                  );
                }}
                onFocus={() =>
                  setCategoryOpen(
                    true
                  )
                }
                onBlur={() => {
                  setTimeout(() => {
                    setCategoryOpen(
                      false
                    );
                  }, 150);
                }}
                placeholder={
                  loadingCategories
                    ? "Loading categories..."
                    : "Select or type a category"
                }
                disabled={
                  loadingCategories
                }
                autoComplete="off"
                className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
                required
              />

              {categoryOpen &&
                !loadingCategories && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto border border-[#e7e5e0] bg-white shadow-lg">

                    {filteredCategories.length >
                    0 ? (

                      filteredCategories.map(
                        (category) => (
                          <button
                            key={
                              category.id
                            }
                            type="button"
                            onMouseDown={(
                              event
                            ) => {
                              event.preventDefault();
                            }}
                            onClick={() => {
                              setCategoryName(
                                category.name
                              );

                              setCategoryOpen(
                                false
                              );
                            }}
                            className="block w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[#f8f7f4]"
                          >
                            {
                              category.name
                            }
                          </button>
                        )
                      )

                    ) : categoryName.trim() ? (

                      <div className="px-4 py-3 text-sm text-[#888888]">
                        No existing category —
                        "{categoryName.trim()}"
                        will be created.
                      </div>

                    ) : (

                      <div className="px-4 py-3 text-sm text-[#888888]">
                        No categories
                        available.
                      </div>

                    )}

                  </div>
                )}

            </div>

            <p className="mt-2 text-xs text-[#888888]">
              Select an existing category
              or type a new one. New
              categories are created
              automatically.
            </p>

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
              onChange={(event) =>
                setPrice(
                  event.target.value
                )
              }
              placeholder="3500"
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
              required
            />

          </div>

          {/* Available Sizes */}

          <div className="mt-6">

            <div className="flex items-center justify-between">

              <label className="text-sm font-medium">
                Available Sizes
              </label>

              <button
                type="button"
                onClick={() => {
                  setShowAddSize(
                    !showAddSize
                  );

                  setError("");
                }}
                className="flex items-center gap-1 text-sm font-medium text-[#b8925a] transition-colors hover:text-[#171717]"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Add Size
              </button>

            </div>

            {/* Add Size */}

            {showAddSize && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">

                <input
                  type="text"
                  inputMode="numeric"
                  value={newSize}
                  onChange={(event) =>
                    setNewSize(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      addNewSize();
                    }
                  }}
                  placeholder="Enter size e.g. 50"
                  className="w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={
                    addNewSize
                  }
                  className="border border-[#171717] px-5 py-3 text-sm font-medium transition-colors hover:bg-[#171717] hover:text-white"
                >
                  Add
                </button>

              </div>
            )}

            {/* Size Buttons */}

            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">

              {availableSizes.map(
                (size) => {

                  const selected =
                    selectedSizes.includes(
                      size
                    );

                  return (
                    <label
                      key={size}
                      className={`flex cursor-pointer items-center justify-center border px-4 py-3 text-sm transition-colors ${
                        selected
                          ? "border-[#b8925a] bg-[#b8925a] text-white"
                          : "border-[#e7e5e0] bg-[#f8f7f4] text-[#171717] hover:border-[#b8925a]"
                      }`}
                    >

                      <input
                        type="checkbox"
                        value={size}
                        checked={
                          selected
                        }
                        onChange={() =>
                          toggleSize(
                            size
                          )
                        }
                        className="sr-only"
                      />

                      {size}

                    </label>
                  );
                }
              )}

            </div>

            <p className="mt-2 text-xs text-[#888888]">
              Select all sizes available
              for this product. Use
              "+ Add Size" for sizes not
              listed above.
            </p>

          </div>

          {/* Product Images */}

          <div className="mt-6">

            <label
              htmlFor="product-images"
              className="text-sm font-medium"
            >
              Product Images
            </label>

            <div className="mt-3 border border-dashed border-[#d8d4cc] bg-[#f8f7f4] p-6">

              <label
                htmlFor="product-images"
                className="flex cursor-pointer flex-col items-center justify-center text-center"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#888888]"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line
                    x1="12"
                    y1="3"
                    x2="12"
                    y2="15"
                  />
                </svg>

                <span className="mt-3 text-sm font-medium">
                  Click to upload product
                  images
                </span>

                <span className="mt-1 text-xs text-[#888888]">
                  JPG, PNG or WebP ·
                  Maximum 5 MB each
                </span>

              </label>

              <input
                id="product-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={
                  handleImageSelect
                }
                className="hidden"
              />

            </div>

            {/* Image Previews */}

            {imagePreviews.length >
              0 && (

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

                {imagePreviews.map(
                  (
                    preview,
                    index
                  ) => {

                    const isPrimary =
                      index ===
                      primaryImageIndex;

                    return (
                      <div
                        key={
                          preview
                        }
                        className={`relative overflow-hidden border bg-[#f8f7f4] ${
                          isPrimary
                            ? "border-2 border-[#b8925a]"
                            : "border-[#e7e5e0]"
                        }`}
                      >

                        <div className="aspect-square">

                          <img
                            src={
                              preview
                            }
                            alt={`Product preview ${
                              index +
                              1
                            }`}
                            className="h-full w-full object-cover"
                          />

                        </div>

                        {isPrimary && (
                          <span className="absolute left-2 top-2 bg-[#b8925a] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                            Primary
                          </span>
                        )}

                        <div className="p-2">

                          <button
                            type="button"
                            onClick={() =>
                              setPrimaryImageIndex(
                                index
                              )
                            }
                            disabled={
                              isPrimary
                            }
                            className={`w-full px-3 py-2 text-xs font-medium transition ${
                              isPrimary
                                ? "cursor-default bg-[#171717] text-white"
                                : "border border-[#171717] bg-white text-[#171717] hover:bg-[#171717] hover:text-white"
                            }`}
                          >
                            {isPrimary
                              ? "Primary Image"
                              : "Make Primary"}
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

            <p className="mt-2 text-xs text-[#888888]">
              Click "Make Primary" on the
              image you want customers to
              see as the main product image.
            </p>

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
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the product..."
              rows={5}
              className="mt-2 w-full resize-none border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
            />

          </div>

          {/* Product Settings */}

          {/* Product Settings */}

<div className="mt-8 border-t border-[#e7e5e0] pt-6">
  <h2 className="text-sm font-medium">
    Product Settings
  </h2>

  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={featured}
        onChange={(event) =>
          setFeatured(event.target.checked)
        }
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
        onChange={(event) =>
          setActive(event.target.checked)
        }
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

          {/* Bottom Buttons */}

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
              {saving
                ? "Creating..."
                : "Create Product"}
            </button>

          </div>

        </form>

      </section>
    </main>
  );
}