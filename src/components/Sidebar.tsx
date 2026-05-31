"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Receipt,
  Users,
  LogOut,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 text-white flex flex-col">

      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Nest & Nook
        </h1>

        <p className="text-sm text-zinc-400 mt-1">
          Property Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-4 flex-1">

        <Link
          href="/"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition mb-2"
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/bookings"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition mb-2"
        >
          <BookOpen size={20} />
          <span>Bookings</span>
        </Link>

        <Link
          href="/guests"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition mb-2"
        >
          <Users size={20} />
          <span>Guests</span>
        </Link>

        <Link
          href="/calendar"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition mb-2"
        >
          <CalendarDays size={20} />
          <span>Calendar</span>
        </Link>

        <Link
          href="/expenses"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition mb-2"
        >
          <Receipt size={20} />
          <span>Expenses</span>
        </Link>

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-900/30 transition w-full text-left"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

        <div className="mt-4 text-xs text-zinc-500">
          Nest & Nook PMS v1.0
        </div>

      </div>

    </aside>
  );
}