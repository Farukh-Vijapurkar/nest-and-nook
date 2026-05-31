"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Bookings",
      href: "/bookings",
      icon: BookOpen,
    },
    {
      name: "Guests",
      href: "/guests",
      icon: Users,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: CalendarDays,
    },
    {
      name: "Expenses",
      href: "/expenses",
      icon: Receipt,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-72 min-h-screen bg-[#0F0F10] border-r border-[#1F1F1F] text-white flex flex-col">

      {/* Logo */}
      <div className="p-8 border-b border-[#1F1F1F]">

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Nest & Nook
        </h1>

        <p className="text-[#C6A664] text-sm mt-2">
          Luxury Property Management
        </p>

      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">

        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                mb-2
                transition-all
                duration-200
                ${
                  active
                    ? `
                      bg-[#C6A664]/10
                      border
                      border-[#C6A664]/20
                      text-[#C6A664]
                    `
                    : `
                      text-zinc-300
                      hover:bg-white/5
                      hover:text-white
                    `
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1F1F1F]">

        <button
          onClick={handleLogout}
          className="
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            w-full
            bg-[#18181B]
            border
            border-[#27272A]
            text-zinc-300
            hover:bg-[#232326]
            hover:text-[#C6A664]
            transition
          "
        >
          <LogOut size={18} />
          <span>
            Logout
          </span>
        </button>

        <div className="mt-5 text-xs text-zinc-500">
          Nest & Nook PMS v1.0
        </div>

      </div>

    </aside>
  );
}