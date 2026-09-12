import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  // Check login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check admin permission
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 text-[#171717]">
        <div className="w-full max-w-md border border-[#e7e5e0] bg-white p-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#b8925a]">
            Bhola Creations
          </p>

          <h1 className="mt-4 text-2xl font-semibold">
            Access denied
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            You do not have permission to manage products.
          </p>

          <a
            href="/admin"
            className="mt-6 inline-block border border-[#171717] px-6 py-3 text-sm font-medium transition hover:bg-[#171717] hover:text-white"
          >
            Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  // Get products from Supabase
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      featured,
      active,
      created_at,
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading admin products:", error);

    return (
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-20 text-[#171717]">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-semibold">
            Unable to load products
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            Please refresh the page and try again.
          </p>
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
              href="/admin"
              className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
            >
              Dashboard
            </a>

            <a
              href="/"
              className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
            >
              View Store →
            </a>

          </div>

        </div>

      </header>


      {/* Page */}

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        {/* Heading */}

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

          <div>

            <p className="text-xs uppercase tracking-[0.25em] text-[#b8925a]">
              Catalogue
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Products
            </h1>

            <p className="mt-3 text-sm text-[#666666]">
              Manage the products displayed on your Bhola Creations store.
            </p>

          </div>


          <a
            href="/admin/products/new"
            className="inline-flex items-center justify-center bg-[#b8925a] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#a67f49]"
          >
            + Add Product
          </a>

        </div>


        {/* Product count */}

        <div className="mt-10 border-y border-[#e7e5e0] py-4">

          <p className="text-sm text-[#666666]">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"} in catalogue
          </p>

        </div>


        {/* Products */}

        <div className="mt-8 overflow-hidden border border-[#e7e5e0] bg-white">

          {/* Desktop table header */}

          <div className="hidden grid-cols-[90px_1fr_160px_130px_120px_100px] border-b border-[#e7e5e0] bg-[#faf9f7] px-5 py-4 text-xs uppercase tracking-wider text-[#888888] lg:grid">

            <div>Image</div>
            <div>Product</div>
            <div>Category</div>
            <div>Price</div>
            <div>Status</div>
            <div>Action</div>

          </div>


          {products.map((product) => {

            const category = Array.isArray(product.categories)
              ? product.categories[0]
              : product.categories;

            const images = Array.isArray(product.product_images)
              ? product.product_images
              : [];

            const primaryImage =
              images.find((image) => image.is_primary) ??
              images.sort(
                (a, b) => a.sort_order - b.sort_order
              )[0];

            return (
              <div
                key={product.id}
                className="border-b border-[#e7e5e0] last:border-b-0"
              >

                {/* Desktop */}

                <div className="hidden grid-cols-[90px_1fr_160px_130px_120px_100px] items-center gap-4 px-5 py-5 lg:grid">

                  {/* Image */}

                  <div className="h-20 w-16 overflow-hidden bg-[#e5e2dc]">

                    {primaryImage ? (
                      <img
                        src={primaryImage.image_url}
                        alt={primaryImage.alt_text ?? product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[#999999]">
                        No image
                      </div>
                    )}

                  </div>


                  {/* Product */}

                  <div>

                    <p className="font-medium">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      /{product.slug}
                    </p>

                    {product.featured && (
                      <span className="mt-2 inline-block text-[10px] uppercase tracking-wider text-[#b8925a]">
                        Featured
                      </span>
                    )}

                  </div>


                  {/* Category */}

                  <div className="text-sm text-[#666666]">
                    {category?.name ?? "—"}
                  </div>


                  {/* Price */}

                  <div className="text-sm font-medium">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </div>


                  {/* Status */}

                  <div>

                    <span
                      className={
                        product.active
                          ? "inline-block bg-[#eef7ef] px-3 py-1 text-xs text-green-700"
                          : "inline-block bg-[#f7eeee] px-3 py-1 text-xs text-red-700"
                      }
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>

                  </div>


                  {/* Action */}

                  <div>

                    <a
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm underline underline-offset-4 transition-colors hover:text-[#b8925a]"
                    >
                      Edit
                    </a>

                  </div>

                </div>


                {/* Mobile / Tablet */}

                <div className="flex gap-5 p-5 lg:hidden">

                  <div className="h-28 w-24 shrink-0 overflow-hidden bg-[#e5e2dc]">

                    {primaryImage ? (
                      <img
                        src={primaryImage.image_url}
                        alt={primaryImage.alt_text ?? product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#999999]">
                        No image
                      </div>
                    )}

                  </div>


                  <div className="min-w-0 flex-1">

                    <p className="text-xs uppercase tracking-wider text-[#888888]">
                      {category?.name ?? "—"}
                    </p>

                    <h2 className="mt-2 font-medium">
                      {product.name}
                    </h2>

                    <p className="mt-2 font-medium">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>

                    <div className="mt-3 flex items-center gap-3">

                      <span
                        className={
                          product.active
                            ? "bg-[#eef7ef] px-3 py-1 text-xs text-green-700"
                            : "bg-[#f7eeee] px-3 py-1 text-xs text-red-700"
                        }
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>

                      {product.featured && (
                        <span className="text-xs text-[#b08d57]">
                          Featured
                        </span>
                      )}

                    </div>

                    <a
                      href={`/admin/products/${product.id}/edit`}
                      className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-[#b8925a]"
                    >
                      Edit product →
                    </a>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </section>

    </main>
  );
}