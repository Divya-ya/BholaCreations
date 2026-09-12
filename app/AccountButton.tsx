"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AccountButton() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get the current logged-in user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
    };

    getUser();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // User is logged in
  if (email) {
    const firstLetter = email.charAt(0).toUpperCase();

    return (
      <button
        onClick={() => router.push("/account")}
        aria-label={`Account ${email}`}
        title={email}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#171717] text-xs font-semibold text-white transition-colors hover:bg-[#b08d57]"
      >
        {firstLetter}
      </button>
    );
  }

  // Guest user
  return (
    <button
      onClick={() => router.push("/account")}
      aria-label="Account"
      className="transition-colors hover:text-[#b08d57]"
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
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
      </svg>
    </button>
  );
}