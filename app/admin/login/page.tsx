"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 text-[#171717]">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="text-center">

          <a
            href="/"
            className="text-2xl font-semibold tracking-[0.22em]"
          >
            BHOLA CREATIONS
          </a>

          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#b8925a]">
            Admin Portal
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Welcome back
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            Sign in to manage your Bhola Creations store.
          </p>

        </div>


        {/* Login Form */}

        <form
          onSubmit={handleLogin}
          className="mt-10 border border-[#e7e5e0] bg-white p-8"
        >

          {/* Email */}

          <div>

            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
            />

          </div>


          {/* Password */}

          <div className="mt-6">

            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
            />

          </div>


          {/* Error */}

          {error && (
            <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}


          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full bg-[#b8925a] px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-[#a67f49] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>


        {/* Back */}

        <div className="mt-6 text-center">

          <a
            href="/"
            className="text-sm text-[#666666] underline underline-offset-4 transition-colors hover:text-[#b8925a]"
          >
            ← Back to Bhola Creations
          </a>

        </div>

      </div>

    </main>
  );
}