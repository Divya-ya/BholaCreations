"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AccountButton from "./AccountButton";
import { supabase } from "../lib/supabase";


export default function Home() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
  const loadProducts = async () => {
    const { data: categoryData, error: categoryError } = await supabase
  .from("categories")
  .select("id, name")
  .order("name", { ascending: true });

if (categoryError) {
  console.error("Error loading categories:", categoryError);
  setCategories([]);
} else {
  setCategories(categoryData ?? []);
}
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, price, description, featured, active, category_id, created_at"
      )
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading featured products:", error);
      setProducts([]);
    } else {
      setProducts(data ?? []);
    }
  };

  loadProducts();
}, []);

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
      {/* =========================================================
          ANNOUNCEMENT BAR
      ========================================================= */}

      <div className="bg-[#171717] px-4 py-2.5 text-center text-xs tracking-wide text-white">
        Premium ready-to-wear clothing • Shop online across India
      </div>

      {/* =========================================================
          HEADER / NAVIGATION
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#e7e5e0] bg-[#f8f7f4]/95 backdrop-blur">
  <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}

          <a
            href="#"
className="relative ml-0 font-bold tracking-[0.1em] sm:ml-0 sm:tracking-[0.22em] lg:translate-x-[calc(80px-max(32px,calc((100vw-1280px)/2+32px)))]"
>
<b className="whitespace-nowrap text-[17px] sm:text-[22px] md:text-[22px] lg:text-[27px]">
  BHOLA CREATIONS
</b>
          </a>

          {/* Desktop Navigation */}

<nav
  className={`relative -top-[3px] lg:translate-x-[180px] ${
    searchOpen ? "!hidden" : "hidden lg:flex"
  } items-center gap-8 text-sm`}
>
            <a
              href="#"
              className="transition-colors hover:text-[#b08d57]"
            >
              Home
            </a>

            <a
              href="/products?category=coats"
              className="transition-colors hover:text-[#b08d57]"
            >
              Coats
            </a>

            <a
              href="/products?category=pants"
              className="transition-colors hover:text-[#b08d57]"
            >
              Pants
            </a>

            <a
              href="/products?category=suits"
              className="transition-colors hover:text-[#b08d57]"
            >
              Suits
            </a>

            <a
              href="#size"
              className="transition-colors hover:text-[#b08d57]"
            >
              Find My Size
            </a>
          </nav>

          {/* Header Icons */}

          <div className="relative z-[100] -top-[3px] ml-4 flex min-w-0 flex-1 items-center justify-end gap-5 sm:ml-auto sm:gap-6">
            {/* Search */}

            <div
  className={`flex min-w-0 items-center transition-all duration-300 ${
  searchOpen
    ? "min-w-0 flex-1 sm:flex-none sm:w-[300px] md:w-[380px] lg:w-[600px] xl:w-[800px]"
    : "w-6"
}`}
>
              {!searchOpen ? (
                <button
  type="button"
  aria-label="Search"
  onClick={() => setSearchOpen(true)}
  className="relative z-20 flex h-8 w-8 touch-manipulation items-center justify-center transition-colors hover:text-[#b08d57]"
>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </button>
              ) : (
                <div className="flex w-full items-center border-b border-[#171717]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3 shrink-0 text-[#666666]"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
  type="text"
  autoFocus
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(
        `/products?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  }}
  placeholder="Search our collection..."
  className="min-w-0 flex-1 bg-transparent py-2 text-sm font-light outline-none placeholder:text-[#999999]"
/>

                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="ml-3 text-xl font-light leading-none text-[#777777] transition-colors hover:text-[#171717]"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Account */}

            <div className={searchOpen ? "hidden sm:block" : "block"}>
              <AccountButton />
            </div>

            {/* Shopping Bag */}

            <div className={searchOpen ? "hidden sm:block" : "block"}>
              <a
                href="/cart"
                aria-label="Shopping bag"
                className="relative transition-colors hover:text-[#b08d57]"
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative -top-[3px]"
              >
                <path d="M6 8h12l1 13H5L6 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />

              </svg>

              {/* Cart Count */}

              <span className="absolute -right-3 -top-2 flex h-5 w-4 items-center justify-center rounded-full bg-[#b08d57] text-[10px] font-medium text-white">
                0
              </span>
              </a>
            </div>

            {/* Mobile Menu */}

            <button
              aria-label="Menu"
              className="hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative h-[calc(100svh-112px)] w-full overflow-hidden bg-[#dedbd4]">
        {/* Hero Visual - Full screen on mobile AND desktop */}

        <div className="absolute inset-0 overflow-hidden bg-[#dedbd4]">
          {/* Mobile Hero Image - unchanged */}

          <Image
            src="/products/frontpage2.jpg"
            alt="Bhola Creations Fashion Collection"
            fill
            className="block object-cover object-center lg:hidden"
            priority
            sizes="(max-width: 1023px) 100vw, 0px"
          />

          {/* Desktop Hero Image - landscape image */}

          <Image
            src="/products/landscape_frontpageV3.jpg"
            alt="Bhola Creations Fashion Collection"
            fill
            className="hidden object-cover object-center lg:block"
            priority
            sizes="(min-width: 1024px) 100vw, 0px"
          />

          {/* Mobile overlay - unchanged */}

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent lg:hidden" />

          {/* Desktop overlay for text readability */}

          <div className="absolute inset-0 hidden bg-gradient-to-r from-black/55 via-black/20 to-transparent lg:block" />
        </div>

        {/* Hero Text
            Mobile positioning is kept unchanged.
            Desktop: text overlays the landscape image. */}

        <div className="absolute inset-x-0 top-1/4 z-10 flex flex-col justify-start px-6 pt-0 pb-6 sm:pb-8 lg:inset-x-auto lg:bottom-16 lg:left-0 lg:top-auto lg:w-1/2 lg:bg-transparent lg:px-20 lg:py-0">
          <div className="max-w-xl">
            <h1 className="max-w-[clamp(150px,70vw,280px)] text-4xl font-semibold leading-tight tracking-[0.05em] text-white sm:text-4xl lg:max-w-[520px] lg:text-6xl lg:text-white xl:text-7xl">
              Dress with Confidence.
            </h1>

            <p className="mt-5 max-w-[180px] text-xs leading-6 text-white/90 sm:max-w-lg sm:text-sm sm:leading-6 lg:max-w-lg lg:text-base lg:text-white/90">
              Discover modern ready-to-wear coats, pants and suits designed for
              a sharp, confident look.
            </p>

            {/* Hero Buttons */}

            <div className="mt-5 w-[195px] sm:mt-6 lg:mt-8 lg:w-[360px]">
              <a
                href="#products"
                className="inline-flex h-11 w-full items-center justify-center bg-[#B8925A] px-6 text-sm font-medium !text-white transition-all duration-300 hover:bg-[#A67F49] focus:outline-none focus:ring-2 focus:ring-[#B8925A] focus:ring-offset-2 sm:h-11 sm:px-6 sm:text-sm lg:h-auto lg:w-full lg:px-12 lg:py-4 lg:text-base"
              >
                <span className="!text-white">Shop Now</span>

                <span className="ml-3 text-base font-light !text-white lg:text-lg">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Mobile only */}

        <a
          href="#products"
          className="absolute bottom-3 left-1/2 z-10 flex w-11/12 -translate-x-1/2 flex-row items-center justify-center gap-2 rounded-full border border-[#B8925A]/70 bg-[#B8925A]/25 px-8 py-2 text-white transition-colors hover:bg-[#B8925A]/35 cursor-pointer lg:hidden"
        >
          <span className="text-xs font-medium uppercase tracking-[0.1em]">
            Explore Collection
          </span>

          <div className="flex h-5 w-5 items-center justify-center">
            ↓
          </div>
        </a>
      </section>

      {/* =========================================================
          CATEGORY SECTION
      ========================================================= */}

      <section className="border-y border-[#e7e5e0] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
              Explore
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Shop by category
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`/products?category=${category.id}`}
                className="group border border-[#e7e5e0] bg-[#f8f7f4] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#b08d57] sm:p-8"
              >
                <div className="mb-10 flex h-56 items-center justify-center bg-[#e5e2dc]">
                  <span className="text-sm uppercase tracking-[0.25em] text-[#666666]">
                    {category.name}
                  </span>
                </div>

                <h3 className="text-xl font-medium">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#666666]">
                  {category.description}
                </p>

                <span className="mt-5 inline-block text-sm font-medium transition-colors group-hover:text-[#b08d57]">
                  Explore →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}

      <section
        id="products"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
              Our selection
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured collection
            </h2>
          </div>

          <a
            href="/products"
            className="hidden text-sm font-medium underline underline-offset-4 transition-colors hover:text-[#b08d57] sm:block"
          >
            View all
          </a>
        </div>

        <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.name}
              className="group"
            >
              {/* Product Image */}

              <div className="relative aspect-[3/4] overflow-hidden bg-[#e5e2dc]">
                <div className="flex h-full items-center justify-center transition duration-500 group-hover:scale-105">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-52 w-32 bg-[#202020] shadow-lg" />

                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#666666]">
                      Product image
                    </span>
                  </div>
                </div>

                <span className="absolute left-4 top-4 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
                  New
                </span>
              </div>

              {/* Product Details */}

              <div className="pt-5">
                <p className="text-xs uppercase tracking-wider text-[#888888]">
                  Product
                </p>

                <h3 className="mt-2 font-medium">
                  {product.name}
                </h3>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="font-medium">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <span className="text-xs text-[#777777]">
                    Ready to wear
                  </span>
                </div>

                <a
                  href="/products"
                  className="mt-5 block w-full border border-[#171717] py-3 text-center text-sm font-medium transition-all hover:bg-[#171717] hover:text-white"
                >
                  View Product
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile View All */}

        <div className="mt-10 text-center sm:hidden">
          <a
            href="/products"
            className="text-sm font-medium underline underline-offset-4"
          >
            View all products
          </a>
        </div>
      </section>

      {/* =========================================================
          FIND MY SIZE
      ========================================================= */}

      <section
        id="size"
        className="bg-[#171717] text-white"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
              Perfect fit starts here
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Not sure which size is right for you?
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-white/60">
              Our size guide will help you find the right ready-to-wear
              size based on your measurements.
            </p>

            <button
              className="mt-8 bg-white px-7 py-4 text-sm font-medium text-[#171717] transition-all hover:bg-[#b08d57] hover:text-white"
            >
              Find My Size →
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="border border-white/10 p-7">
              <p className="text-3xl font-semibold">
                01
              </p>

              <h3 className="mt-8 font-medium">
                Enter measurements
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/50">
                Tell us a few basic measurements.
              </p>
            </div>

            <div className="border border-white/10 p-7">
              <p className="text-3xl font-semibold">
                02
              </p>

              <h3 className="mt-8 font-medium">
                Get your size
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/50">
                We'll recommend the most suitable size.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY BHOLA CREATIONS
      ========================================================= */}

      <section className="bg-[#f8f7f4]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
              Why Bhola Creations
            </p>

            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Made for the way you dress
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="border-t border-[#e7e5e0] pt-6">
              <span className="text-2xl">
                ✦
              </span>

              <h3 className="mt-5 font-medium">
                Premium selection
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#666666]">
                Carefully selected styles for a modern wardrobe.
              </p>
            </div>

            <div className="border-t border-[#e7e5e0] pt-6">
              <span className="text-2xl">
                ◈
              </span>

              <h3 className="mt-5 font-medium">
                Easy sizing
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#666666]">
                Find your suitable ready-to-wear size with ease.
              </p>
            </div>

            <div className="border-t border-[#e7e5e0] pt-6">
              <span className="text-2xl">
                ✓
              </span>

              <h3 className="mt-5 font-medium">
                Simple shopping
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#666666]">
                Browse, select your size and order online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}

      <section className="border-t border-[#e7e5e0] bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
            Stay connected
          </p>

          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Get the latest from Bhola Creations
          </h2>

          <p className="mt-4 text-sm leading-6 text-[#666666]">
            Be the first to know about new collections and special offers.
          </p>

          <div className="mx-auto mt-8 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="min-w-0 flex-1 border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#b08d57]"
            />

            <button
              className="bg-[#171717] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#333333]"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-[#171717] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}

            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold tracking-[0.2em]">
                BHOLA CREATIONS
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
                Modern ready-to-wear coats, pants and suits
                designed for confident everyday dressing.
              </p>
            </div>

            {/* Shop */}

            <div>
              <h3 className="text-sm font-medium">
                Shop
              </h3>

              <div className="mt-5 space-y-3 text-sm text-white/50">
                <a
                  href="#coats"
                  className="block transition-colors hover:text-white"
                >
                  Coats
                </a>

                <a
                  href="/products?category=pants"
                  className="block transition-colors hover:text-white"
                >
                  Pants
                </a>

                <a
                    href="/products?category=suits"
                  className="block transition-colors hover:text-white"
                >
                  Suits
                </a>
              </div>
            </div>

            {/* Help */}

            <div>
              <h3 className="text-sm font-medium">
                Help
              </h3>

              <div className="mt-5 space-y-3 text-sm text-white/50">
                <a
                  href="#size"
                  className="block transition-colors hover:text-white"
                >
                  Size Guide
                </a>

                <a
                  href="#"
                  className="block transition-colors hover:text-white"
                >
                  Contact
                </a>

                <a
                  href="#"
                  className="block transition-colors hover:text-white"
                >
                  Shipping
                </a>

                <a
                  href="#"
                  className="block transition-colors hover:text-white"
                >
                  Returns
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}

          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/40">
            © 2026 Bhola Creations. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}