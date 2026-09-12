"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  featured: boolean;
  active: boolean;
  category_id: number;

  weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
};

type ProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // Package information
  const [weightKg, setWeightKg] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [
        { data: productData, error: productError },
        { data: categoryData, error: categoryError },
        { data: imageData, error: imageError },
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            `
              id,
              name,
              slug,
              price,
              description,
              featured,
              active,
              category_id,
              weight_kg,
              length_cm,
              width_cm,
              height_cm
            `
          )
          .eq("id", productId)
          .maybeSingle(),

        supabase
          .from("categories")
          .select("id, name")
          .order("name"),

        supabase
          .from("product_images")
          .select(
            "id, product_id, image_url, alt_text, sort_order, is_primary"
          )
          .eq("product_id", productId)
          .order("sort_order"),
      ]);

      if (productError) {
        console.error("Error loading product:", productError);
        setError("Unable to load product.");
        setLoading(false);
        return;
      }

      if (!productData) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      if (categoryError) {
        console.error("Error loading categories:", categoryError);
        setError("Unable to load categories.");
        setLoading(false);
        return;
      }

      if (imageError) {
        console.error("Error loading images:", imageError);
        setError("Unable to load product images.");
        setLoading(false);
        return;
      }

      setProduct(productData);
      setCategories(categoryData ?? []);
      setImages(imageData ?? []);

      setName(productData.name);
      setCategoryId(String(productData.category_id));
      setPrice(String(productData.price));
      setDescription(productData.description ?? "");

      // Load package information
      setWeightKg(
        productData.weight_kg !== null
          ? String(productData.weight_kg)
          : ""
      );

      setLengthCm(
        productData.length_cm !== null
          ? String(productData.length_cm)
          : ""
      );

      setWidthCm(
        productData.width_cm !== null
          ? String(productData.width_cm)
          : ""
      );

      setHeightCm(
        productData.height_cm !== null
          ? String(productData.height_cm)
          : ""
      );

      setFeatured(productData.featured);
      setActive(productData.active);

      setLoading(false);
    }

    if (Number.isFinite(productId)) {
      loadData();
    } else {
      setError("Invalid product ID.");
      setLoading(false);
    }
  }, [productId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

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

    // Validate package information if entered
    if (weightKg && Number(weightKg) <= 0) {
      setError("Package weight must be greater than 0.");
      return;
    }

    if (lengthCm && Number(lengthCm) <= 0) {
      setError("Package length must be greater than 0.");
      return;
    }

    if (widthCm && Number(widthCm) <= 0) {
      setError("Package width must be greater than 0.");
      return;
    }

    if (heightCm && Number(heightCm) <= 0) {
      setError("Package height must be greater than 0.");
      return;
    }

    setSaving(true);

    const newSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        category_id: Number(categoryId),
        price: Number(price),
        description: description.trim() || null,
        slug: newSlug,

        // Package information
        weight_kg: weightKg ? Number(weightKg) : null,
        length_cm: lengthCm ? Number(lengthCm) : null,
        width_cm: widthCm ? Number(widthCm) : null,
        height_cm: heightCm ? Number(heightCm) : null,

        featured,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select(
        `
          id,
          name,
          slug,
          price,
          description,
          featured,
          active,
          category_id,
          weight_kg,
          length_cm,
          width_cm,
          height_cm
        `
      )
      .single();

    if (error) {
      console.error("Error updating product:", error);
      setError(error.message);
      setSaving(false);
      return;
    }

    setProduct(data);
    setSuccess("Product updated successfully.");
    setSaving(false);

    router.refresh();
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    // Only allow supported image formats
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeName =
        file.name
          .replace(/\.[^/.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "product-image";

      const uniqueName = `${crypto.randomUUID()}-${safeName}.${extension}`;

      const storagePath = `products/${productId}/${uniqueName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath);

      const imageUrl = publicUrlData.publicUrl;

      // If this is the first image, automatically make it primary
      const isFirstImage = images.length === 0;

      if (isFirstImage) {
        const { error: insertError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            image_url: imageUrl,
            alt_text: name,
            sort_order: 0,
            is_primary: true,
          });

        if (insertError) {
          throw insertError;
        }
      } else {
        const nextSortOrder =
          Math.max(
            ...images.map((image) => image.sort_order),
            0
          ) + 1;

        const { error: insertError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            image_url: imageUrl,
            alt_text: name,
            sort_order: nextSortOrder,
            is_primary: false,
          });

        if (insertError) {
          throw insertError;
        }
      }

      // Reload images
      const { data: updatedImages, error: reloadError } =
        await supabase
          .from("product_images")
          .select(
            "id, product_id, image_url, alt_text, sort_order, is_primary"
          )
          .eq("product_id", productId)
          .order("sort_order");

      if (reloadError) {
        throw reloadError;
      }

      setImages(updatedImages ?? []);
      setSuccess("Image uploaded successfully.");
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function makePrimary(imageId: number) {
    setError("");
    setSuccess("");

    const { error: resetError } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    const { error } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId)
      .eq("product_id", productId);

    if (error) {
      setError(error.message);
      return;
    }

    setImages((currentImages) =>
      currentImages.map((image) => ({
        ...image,
        is_primary: image.id === imageId,
      }))
    );

    setSuccess("Primary image updated.");
  }

  async function deleteImage(image: ProductImage) {
    setError("");
    setSuccess("");

    if (image.is_primary) {
      setError(
        "Set another image as primary before deleting this image."
      );
      return;
    }

    const storagePrefix =
      "/storage/v1/object/public/product-images/";

    const storagePath = image.image_url.includes(storagePrefix)
      ? image.image_url.split(storagePrefix)[1]
      : null;

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([decodeURIComponent(storagePath)]);

      if (storageError) {
        console.error(
          "Storage delete error:",
          storageError
        );
      }
    }

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id)
      .eq("product_id", productId);

    if (error) {
      setError(error.message);
      return;
    }

    setImages((currentImages) =>
      currentImages.filter(
        (currentImage) => currentImage.id !== image.id
      )
    );

    setSuccess("Image deleted.");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] text-[#171717]">
        <p className="text-sm text-[#666666]">
          Loading product...
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-20 text-[#171717]">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold">
            Product not found
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            {error ||
              "The requested product could not be found."}
          </p>

          <a
            href="/admin/products"
            className="mt-6 inline-block border border-[#171717] px-6 py-3 text-sm font-medium transition hover:bg-[#171717] hover:text-white"
          >
            ← Back to Products
          </a>
        </div>
      </main>
    );
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
              className="text-sm text-[#666666] hover:text-[#b8925a]"
            >
              Products
            </a>

            <a
              href="/admin"
              className="text-sm text-[#666666] hover:text-[#b8925a]"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Page */}

      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <a
          href="/admin/products"
          className="text-sm text-[#666666] hover:text-[#b8925a]"
        >
          ← Back to Products
        </a>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#b8925a]">
            Catalogue
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Edit Product
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            Update the information for {product.name}.
          </p>
        </div>

        {/* Product Information */}

        <form
          onSubmit={handleSubmit}
          className="mt-10 border border-[#e7e5e0] bg-white p-6 sm:p-8"
        >
          <h2 className="text-lg font-medium">
            Product Information
          </h2>

          {/* Name */}

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
                setName(event.target.value)
              }
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
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
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
              required
            >
              <option value="">
                Select category
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
              onChange={(event) =>
                setPrice(event.target.value)
              }
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
              required
            />
          </div>

          {/* Package Information */}

          <div className="mt-10 border-t border-[#e7e5e0] pt-8">
            <h2 className="text-lg font-medium">
              Package Information
            </h2>

            <p className="mt-1 text-sm text-[#666666]">
              Enter the packed product dimensions. These will
              be used later when creating Delhivery shipments.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Weight */}

              <div>
                <label
                  htmlFor="weight"
                  className="text-sm font-medium"
                >
                  Package Weight (kg)
                </label>

                <input
                  id="weight"
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="Example: 1.200"
                  value={weightKg}
                  onChange={(event) =>
                    setWeightKg(event.target.value)
                  }
                  className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
                />

                <p className="mt-1 text-xs text-[#888888]">
                  Weight of the packed parcel
                </p>
              </div>

              {/* Length */}

              <div>
                <label
                  htmlFor="length"
                  className="text-sm font-medium"
                >
                  Package Length (cm)
                </label>

                <input
                  id="length"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Example: 35"
                  value={lengthCm}
                  onChange={(event) =>
                    setLengthCm(event.target.value)
                  }
                  className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
                />
              </div>

              {/* Width */}

              <div>
                <label
                  htmlFor="width"
                  className="text-sm font-medium"
                >
                  Package Width (cm)
                </label>

                <input
                  id="width"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Example: 28"
                  value={widthCm}
                  onChange={(event) =>
                    setWidthCm(event.target.value)
                  }
                  className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
                />
              </div>

              {/* Height */}

              <div>
                <label
                  htmlFor="height"
                  className="text-sm font-medium"
                >
                  Package Height (cm)
                </label>

                <input
                  id="height"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Example: 8"
                  value={heightCm}
                  onChange={(event) =>
                    setHeightCm(event.target.value)
                  }
                  className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
                />
              </div>
            </div>
          </div>

          {/* Description */}

          <div className="mt-8">
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
                setDescription(event.target.value)
              }
              rows={5}
              className="mt-2 w-full resize-none border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none focus:border-[#b8925a]"
            />
          </div>

          {/* Settings */}

          <div className="mt-8 border-t border-[#e7e5e0] pt-6">
            <h2 className="text-sm font-medium">
              Product Settings
            </h2>

            <div className="mt-5 space-y-4">
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

          {/* Images */}

          <div className="mt-10 border-t border-[#e7e5e0] pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">
                  Product Images
                </h2>

                <p className="mt-1 text-sm text-[#666666]">
                  Upload multiple images and choose one as
                  the primary image.
                </p>
              </div>

              <label
                className={`cursor-pointer bg-[#b8925a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a67f49] ${
                  uploading
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
              >
                {uploading
                  ? "Uploading..."
                  : "+ Upload Image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Grid */}

            {images.length === 0 ? (
              <div className="mt-6 border border-dashed border-[#d8d5ce] p-10 text-center">
                <p className="text-sm text-[#666666]">
                  No images uploaded yet.
                </p>

                <p className="mt-2 text-xs text-[#999999]">
                  JPG, PNG or WebP • Maximum 5 MB
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden border border-[#e7e5e0] bg-white"
                  >
                    <div className="aspect-[3/4] bg-[#e5e2dc]">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || product.name}
                        className="h-full w-full object-contain p-4"
                      />
                    </div>

                    <div className="p-4">
                      {image.is_primary && (
                        <span className="inline-block bg-[#b8925a] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                          Primary Image
                        </span>
                      )}

                      <div className="mt-4 flex gap-2">
                        {!image.is_primary && (
                          <button
                            type="button"
                            onClick={() =>
                              makePrimary(image.id)
                            }
                            className="flex-1 border border-[#171717] px-3 py-2 text-xs font-medium transition hover:bg-[#171717] hover:text-white"
                          >
                            Make Primary
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteImage(image)
                          }
                          disabled={image.is_primary}
                          className="border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}

          {error && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Save */}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#b8925a] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#a67f49] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}