"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setSubmitting(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Login successful.");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email: emailInput,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Account created. Please check your email if email confirmation is enabled."
        );
      }
    }

    setSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/account`,
      },
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail(null);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
        <p className="text-sm text-[#666666]">Loading...</p>
      </main>
    );
  }

  // =========================
  // LOGGED-IN USER
  // =========================

  if (email) {
    const firstLetter = email.charAt(0).toUpperCase();

    return (
      <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
        <header className="border-b border-[#e7e5e0] bg-white">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            <a
              href="/"
              className="text-xl font-semibold tracking-[0.22em] sm:text-2xl"
            >
              BHOLA CREATIONS
            </a>

            <a
              href="/"
              className="text-sm transition-colors hover:text-[#b08d57]"
            >
              Continue Shopping
            </a>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <div className="border border-[#e7e5e0] bg-white p-8 sm:p-12">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#171717] text-xl font-semibold text-white">
                  {firstLetter}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#b08d57]">
                    My Account
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold">
                    Welcome back
                  </h1>

                  <p className="mt-1 text-sm text-[#666666]">{email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="border border-[#171717] px-6 py-3 text-sm font-medium transition-colors hover:bg-[#171717] hover:text-white"
              >
                Logout
              </button>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <a
                href="/orders"
                className="border border-[#e7e5e0] p-6 transition-all hover:-translate-y-1 hover:border-[#b08d57]"
              >
                <h2 className="font-medium">My Orders</h2>
                <p className="mt-2 text-sm leading-6 text-[#666666]">
                  View your orders and track deliveries.
                </p>
              </a>

              <div className="border border-[#e7e5e0] p-6">
                <h2 className="font-medium">My Profile</h2>
                <p className="mt-2 text-sm leading-6 text-[#666666]">
                  Manage your personal information.
                </p>
              </div>

              <div className="border border-[#e7e5e0] p-6">
                <h2 className="font-medium">Addresses</h2>
                <p className="mt-2 text-sm leading-6 text-[#666666]">
                  Manage your saved delivery addresses.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // =========================
  // GUEST USER
  // =========================

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
      <header className="border-b border-[#e7e5e0] bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <a
            href="/"
            className="text-xl font-semibold tracking-[0.22em] sm:text-2xl"
          >
            BHOLA CREATIONS
          </a>

          <a
            href="/"
            className="text-sm transition-colors hover:text-[#b08d57]"
          >
            Continue Shopping
          </a>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center px-6 py-16">
        <div className="w-full border border-[#e7e5e0] bg-white p-8 sm:p-10">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
              Bhola Creations
            </p>

            <h1 className="mt-4 text-3xl font-semibold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#666666]">
              {mode === "login"
                ? "Sign in to view your orders and account details."
                : "Create an account to make shopping easier."}
            </p>
          </div>

          {/* =========================
              GOOGLE LOGIN
          ========================= */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="mt-8 flex w-full items-center justify-center gap-3 border border-[#d9d6d0] bg-white px-4 py-3.5 text-sm font-medium text-[#171717] transition-colors hover:bg-[#f8f7f4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.4Z"
              />

              <path
                fill="#34A853"
                d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.75 9.75 0 0 0 12 21.75Z"
              />

              <path
                fill="#FBBC05"
                d="M6.53 13.85a5.86 5.86 0 0 1 0-3.7V7.63H3.28a9.75 9.75 0 0 0 0 8.74l3.25-2.52Z"
              />

              <path
                fill="#EA4335"
                d="M12 6.12c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.25 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.38l3.25 2.52C7.3 7.84 9.46 6.12 12 6.12Z"
              />
            </svg>

            Continue with Google
          </button>

          {/* =========================
              DIVIDER
          ========================= */}

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e7e5e0]" />

            <span className="text-xs uppercase tracking-[0.15em] text-[#999999]">
              or continue with email
            </span>

            <div className="h-px flex-1 bg-[#e7e5e0]" />
          </div>

          {/* =========================
              EMAIL / PASSWORD
          ========================= */}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email address
              </label>

              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-[#d9d6d0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#b08d57]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full border border-[#d9d6d0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#b08d57]"
              />
            </div>

            {message && (
              <p className="text-sm leading-6 text-[#666666]">{message}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#171717] px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="mt-7 border-t border-[#e7e5e0] pt-6 text-center">
            <p className="text-sm text-[#666666]">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>

            <button
              type="button"
              onClick={() =>
                setMode(mode === "login" ? "signup" : "login")
              }
              className="mt-2 text-sm font-medium text-[#b08d57] underline underline-offset-4"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}