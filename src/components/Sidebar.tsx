"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Receipt,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800 text-white flex flex-col">

      {/* Logo Section */}
      <div className="p-8 border-b border-slate-800">
        <h1 className="text-3xl font-bold">
          Nest & Nook
        </h1>

        <p className="text-slate-400 text-sm mt-2">
          Property Management System
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition mb-2"
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/bookings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition mb-2"
        >
          <BookOpen size={20} />
          <span>Bookings</span>
        </Link>

        <Link
          href="/guests"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition mb-2"
        >
          <Users size={20} />
          <span>Guests</span>
        </Link>

        <Link
          href="/calendar"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition mb-2"
        >
          <CalendarDays size={20} />
          <span>Calendar</span>
        </Link>

        <Link
          href="/expenses"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition mb-2"
        >
          <Receipt size={20} />
          <span>Expenses</span>
        </Link>

        <Link
          href="/reports"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition mb-2"
        >
          <BarChart3 size={20} />
          <span>Reports</span>
        </Link>

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full bg-red-500/10 hover:bg-red-500/20 text-red-300 transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        <div className="mt-4 text-xs text-slate-500">
          Nest & Nook PMS v1.0
        </div>

      </div>

    </aside>
  );
}