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

  async function handleLogin() {
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
    <div className="min-h-screen flex items-center justify-center">

      <div className="w-full max-w-md border border-zinc-800 rounded-xl p-6">

        <h1 className="text-3xl font-bold mb-6">
          Nest & Nook Login
        </h1>

        <div className="flex flex-col gap-4">

          <input
            className="border p-3 rounded bg-transparent"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            className="border p-3 rounded bg-transparent"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-white text-black p-3 rounded font-semibold"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </div>

      </div>

    </div>
  );
}