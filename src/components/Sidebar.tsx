"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Receipt,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 text-white">

      <div className="p-6">

        <h1 className="text-2xl font-bold">
          Nest & Nook
        </h1>

        <p className="text-sm text-zinc-400 mt-1">
          Property Management
        </p>

      </div>

      <nav className="px-4">

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
          href="/calendar"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition mb-2"
        >
          <CalendarDays size={20} />
          <span>Calendar</span>
        </Link>

        <Link
          href="/expenses"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition"
        >
          <Receipt size={20} />
          <span>Expenses</span>
        </Link>

      </nav>

      <div className="absolute bottom-6 left-6 text-xs text-zinc-500">
        Nest & Nook PMS v1.0
      </div>

    </aside>
  );
}