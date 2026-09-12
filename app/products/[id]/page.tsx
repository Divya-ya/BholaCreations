import { createClient } from "@/lib/server";
import ProductOptions from "./ProductOptions";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProductImage = {
  id: number;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

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

function ProductNotFound() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-20 text-[#171717]">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold">
          Product not found
        </h1>

        <a
          href="/products"
          className="mt-6 inline-block text-sm underline underline-offset-4"
        >
          ← Back to products
        </a>
      </div>
    </main>
  );
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return <ProductNotFound />;
  }

  const supabase = await createClient();

  const [
    productResult,
    sizesResult,
    designsResult,
    inventoryResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        description,
        featured,
        active,
        categories (
          id,
          name
        ),
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `)
      .eq("id", productId)
      .eq("active", true)
      .single(),

    supabase
      .from("product_sizes")
      .select("id, size")
      .eq("product_id", productId)
      .order("size"),

    supabase
      .from("product_designs")
      .select("id, name")
      .eq("product_id", productId)
      .order("name"),

    supabase
      .from("inventory")
      .select(
        "id, size_id, design_id, stock_quantity"
      )
      .eq("product_id", productId),
  ]);

  if (productResult.error || !productResult.data) {
    return <ProductNotFound />;
  }

  const product = productResult.data;

  const category = Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories;

  const images = (
    (product.product_images || []) as ProductImage[]
  ).sort((a, b) => {
    if (a.is_primary && !b.is_primary) {
      return -1;
    }

    if (!a.is_primary && b.is_primary) {
      return 1;
    }

    return a.sort_order - b.sort_order;
  });

  const sizes = (sizesResult.data || []) as ProductSize[];

  const designs = (designsResult.data || []) as ProductDesign[];

  const inventory = (
    inventoryResult.data || []
  ) as InventoryItem[];

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

          <a
            href="/products"
            className="text-sm text-[#666666] transition hover:text-[#171717]"
          >
            Collection
          </a>
        </div>
      </header>

      {/* Product Section */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">

        {/* Back */}
        <a
          href="/products"
          className="text-sm text-[#666666] transition hover:text-[#171717]"
        >
          ← Back to Collection
        </a>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">

          {/* Product Images */}
          <div>

            <div className="aspect-[3/4] overflow-hidden bg-[#e5e2dc]">

              {images.length > 0 ? (
                <img
                  src={images[0].image_url}
                  alt={
                    images[0].alt_text ||
                    product.name
                  }
                  className="h-full w-full object-contain p-6"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#888888]">
                  No image available
                </div>
              )}

            </div>

            {/* Additional Images */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">

                {images.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square overflow-hidden bg-[#e5e2dc]"
                  >
                    <img
                      src={image.image_url}
                      alt={
                        image.alt_text ||
                        product.name
                      }
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                ))}

              </div>
            )}

          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">

            {/* Category */}
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b08d57]">
              {category?.name || "Collection"}
            </p>

            {/* Product Name */}
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            {/* Price */}
            <p className="mt-5 text-2xl font-medium">
              ₹
              {Number(product.price).toLocaleString(
                "en-IN"
              )}
            </p>

            {/* Description */}
            {product.description && (
              <p className="mt-6 max-w-xl text-base leading-7 text-[#666666]">
                {product.description}
              </p>
            )}

            {/* Size / Design / Inventory */}
            <ProductOptions
              productId={productId}
              sizes={sizes}
              designs={designs}
              inventory={inventory}
            />

            {/* Product Details */}
            <div className="mt-10 border-t border-[#e7e5e0] pt-6">

              <h2 className="text-sm font-semibold">
                Product Details
              </h2>

              <ul className="mt-4 space-y-2 text-sm text-[#666666]">
                <li>
                  • Premium ready-to-wear construction
                </li>

                <li>
                  • Multiple sizes available
                </li>

                <li>
                  • Designed for a refined formal look
                </li>

                <li>
                  • Suitable for weddings and special occasions
                </li>
              </ul>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}