import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Check login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check admin permission
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !adminUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 text-[#171717]">
        <div className="w-full max-w-md border border-[#e7e5e0] bg-white p-8 text-center">

          <p className="text-xs uppercase tracking-[0.25em] text-[#b8925a]">
            Bhola Creations
          </p>

          <h1 className="mt-4 text-2xl font-semibold">
            Access denied
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#666666]">
            You do not have permission to access the Admin Portal.
          </p>

          <a
            href="/"
            className="mt-6 inline-block border border-[#171717] px-6 py-3 text-sm font-medium transition hover:bg-[#171717] hover:text-white"
          >
            Back to Store
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
            <p className="text-xl font-semibold tracking-[0.22em]">
              BHOLA CREATIONS
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#b8925a]">
              Admin Portal
            </p>
          </div>

          <a
            href="/"
            className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
          >
            View Store →
          </a>

        </div>

      </header>


      {/* Dashboard */}

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-[#b8925a]">
            Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            Manage your Bhola Creations store from one place.
          </p>

        </div>


        {/* Management Cards */}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Products */}

          <a
            href="/admin/products"
            className="group border border-[#e7e5e0] bg-white p-6 transition hover:border-[#b8925a]"
          >

            <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">
              Catalogue
            </p>

            <h2 className="mt-3 text-xl font-medium">
              Products
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#666666]">
              Add, edit and manage your products.
            </p>

            <p className="mt-6 text-sm font-medium transition group-hover:text-[#b8925a]">
              Manage products →
            </p>

          </a>


          {/* Inventory */}

          <a
            href="/admin/inventory"
            className="group border border-[#e7e5e0] bg-white p-6 transition hover:border-[#b8925a]"
          >

            <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">
              Stock
            </p>

            <h2 className="mt-3 text-xl font-medium">
              Inventory
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#666666]">
              Manage sizes, designs and stock.
            </p>

            <p className="mt-6 text-sm font-medium transition group-hover:text-[#b8925a]">
              Manage inventory →
            </p>

          </a>


          {/* Orders */}

          <div className="border border-[#e7e5e0] bg-white p-6">

            <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">
              Sales
            </p>

            <h2 className="mt-3 text-xl font-medium">
              Orders
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#666666]">
              Order management will be added later.
            </p>

          </div>


          {/* Settings */}

          <div className="border border-[#e7e5e0] bg-white p-6">

            <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">
              Store
            </p>

            <h2 className="mt-3 text-xl font-medium">
              Settings
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#666666]">
              Store settings will be added later.
            </p>

          </div>

        </div>


        {/* Quick Overview */}

        <div className="mt-12 border-t border-[#e7e5e0] pt-10">

          <h2 className="text-lg font-medium">
            Quick overview
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">

            <div className="border border-[#e7e5e0] bg-white p-6">

              <p className="text-sm text-[#666666]">
                Products
              </p>

              <p className="mt-2 text-3xl font-semibold">
                9
              </p>

            </div>


            <div className="border border-[#e7e5e0] bg-white p-6">

              <p className="text-sm text-[#666666]">
                Categories
              </p>

              <p className="mt-2 text-3xl font-semibold">
                4
              </p>

            </div>


            <div className="border border-[#e7e5e0] bg-white p-6">

              <p className="text-sm text-[#666666]">
                Admin Status
              </p>

              <p className="mt-2 text-lg font-medium text-[#b8925a]">
                Active
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}