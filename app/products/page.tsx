import { getProducts } from "@/lib/products";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
  search?: string;
  category?: string;
}>;
}) {
  const { search, category } = await searchParams;
  const products = await getProducts(search, category);

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">

      {/* Header */}
      <header className="border-b border-[#e7e5e0] bg-[#f8f7f4]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          <a
            href="/"
            className="text-2xl font-semibold tracking-[0.2em]"
          >
            BHOLA CREATIONS
          </a>

          <nav className="flex items-center gap-6 text-sm">
            <a
              href="/"
              className="hover:text-[#b08d57]"
            >
              Home
            </a>

            <a
              href="/products"
              className="font-medium text-[#b08d57]"
            >
              Shop
            </a>

            <button>
              🛒
            </button>
          </nav>

        </div>
      </header>

      {/* Page Heading */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
          Bhola Creations Collection
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Shop all products
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[#666666]">
          Explore our collection of ready-to-wear coats, pants, suits and
          sherwanis.
        </p>

      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="flex flex-wrap gap-3 border-b border-[#e7e5e0] pb-6">

          <button className="bg-[#171717] px-5 py-2.5 text-sm text-white">
            All
          </button>

          <button className="border border-[#e7e5e0] bg-white px-5 py-2.5 text-sm hover:border-[#b08d57]">
            Coats
          </button>

          <button className="border border-[#e7e5e0] bg-white px-5 py-2.5 text-sm hover:border-[#b08d57]">
            Pants
          </button>

          <button className="border border-[#e7e5e0] bg-white px-5 py-2.5 text-sm hover:border-[#b08d57]">
            Suits
          </button>

          <button className="border border-[#e7e5e0] bg-white px-5 py-2.5 text-sm hover:border-[#b08d57]">
            Sherwani
          </button>

        </div>

      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">

          {products.map((product) => {

            const primaryImage =
              product.images?.find((image) => image.is_primary)?.image_url ??
              product.images?.[0]?.image_url;

            const categoryName =
              product.category?.[0]?.name ?? "Collection";

            return (
              <article
                key={product.id}
                className="group"
              >

                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#e5e2dc]">

                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={
                        product.images?.find(
                          (image) => image.is_primary
                        )?.alt_text ?? product.name
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center transition duration-500 group-hover:scale-105">

                      <div className="text-center">

                        <div className="mx-auto mb-4 h-56 w-32 bg-[#202020] shadow-lg" />

                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#666666]">
                          Product image
                        </span>

                      </div>

                    </div>
                  )}

                  <span className="absolute left-4 top-4 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
                    New
                  </span>

                </div>

                {/* Details */}
                <div className="pt-5">

                  <p className="text-xs uppercase tracking-wider text-[#888888]">
                    {categoryName}
                  </p>

                  <h2 className="mt-2 font-medium">
                    {product.name}
                  </h2>

                  <p className="mt-2 font-medium">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-xs text-[#777777]">
                    Sizes:{" "}
                    {product.sizes
                      ?.map((size) => size.size)
                      .join(" • ")}
                  </p>

                  <a
                    href={`/products/${product.id}`}
                    className="mt-5 block w-full border border-[#171717] py-3 text-center text-sm font-medium transition hover:bg-[#171717] hover:text-white"
                  >
                    View Product
                  </a>

                </div>

              </article>
            );
          })}

        </div>

      </section>

    </main>
  );
}