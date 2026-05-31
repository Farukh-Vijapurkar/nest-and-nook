"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    e?: React.FormEvent
  ) {
    e?.preventDefault();

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left Branding Panel */}

      <div
        className="
          hidden
          lg:flex
          flex-col
          justify-center
          px-20
          bg-[#0F0F10]
          text-white
          border-r
          border-[#1F1F1F]
        "
      >

        <div>

          <p className="text-[#C6A664] uppercase tracking-[0.3em] text-sm">
            Luxury Property Management
          </p>

          <h1 className="mt-6 text-6xl font-bold tracking-tight">
            Nest & Nook
          </h1>

          <p className="mt-8 text-zinc-400 text-lg leading-relaxed max-w-lg">
            Manage bookings, guests, reports,
            expenses and operations from a
            single premium hospitality platform.
          </p>

        </div>

      </div>

      {/* Right Login Panel */}

      <div className="flex items-center justify-center bg-white p-8">

        <div className="w-full max-w-md">

          <div className="mb-10">

            <h2 className="text-4xl font-semibold tracking-tight">
              Welcome Back
            </h2>

            <p className="text-zinc-500 mt-2">
              Sign in to access Nest & Nook PMS
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <div>

              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="
                  w-full
                  rounded-xl
                  border
                  border-zinc-300
                  px-4
                  py-3
                  outline-none
                  focus:border-[#C6A664]
                "
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-zinc-300
                  px-4
                  py-3
                  outline-none
                  focus:border-[#C6A664]
                "
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-[#0F0F10]
                text-white
                py-3
                font-medium
                hover:bg-[#1A1A1A]
                transition
              "
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

          </form>

          <div className="mt-10 text-center text-sm text-zinc-500">
            Nest & Nook PMS v1.0
          </div>

        </div>

      </div>

    </div>
  );
}