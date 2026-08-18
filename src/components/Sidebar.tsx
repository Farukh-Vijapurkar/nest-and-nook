"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Receipt,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

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

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="
          hidden
          lg:flex
          fixed
          left-0
          top-0
          bottom-0
          w-72
          bg-[#0F0F10]
          border-r
          border-[#1F1F1F]
          text-white
          flex-col
          shrink-0
          z-40
        "
      >

        {/* Logo */}

        <div className="p-8 border-b border-[#1F1F1F]">

          <div className="flex items-center gap-3">

            <div
              className="
                h-11
                w-11
                rounded-2xl
                bg-[#C6A664]/10
                border
                border-[#C6A664]/20
                flex
                items-center
                justify-center
              "
            >
              <Home
                size={22}
                className="text-[#C6A664]"
              />
            </div>

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                Nest & Nook
              </h1>

              <p className="text-[#C6A664] text-xs mt-1">
                Property Management
              </p>

            </div>

          </div>

        </div>


        {/* Navigation */}

        <nav className="flex-1 p-4 overflow-y-auto">

          <p
            className="
              px-4
              mb-4
              text-[10px]
              uppercase
              tracking-[0.18em]
              font-semibold
              text-zinc-600
            "
          >
            Main Menu
          </p>

          {menuItems.map((item) => {

            const Icon = item.icon;

            const active =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  group
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3.5
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
                        shadow-[0_4px_20px_rgba(198,166,100,0.06)]
                      `
                      : `
                        border
                        border-transparent
                        text-zinc-400
                        hover:bg-white/5
                        hover:text-white
                      `
                  }
                `}
              >

                <Icon
                  size={20}
                  className={
                    active
                      ? "text-[#C6A664]"
                      : "text-zinc-500 group-hover:text-zinc-300"
                  }
                />

                <span className="font-medium">
                  {item.name}
                </span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C6A664]" />
                )}

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
              text-zinc-400
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

          <div className="mt-5 px-1 text-xs text-zinc-600">
            Nest & Nook PMS v1.0
          </div>

        </div>

      </aside>


      {/* =====================================================
          MOBILE TOP BAR
      ===================================================== */}

      <header
        className="
          lg:hidden
          sticky
          top-0
          z-40
          h-16
          bg-[#0F0F10]
          border-b
          border-[#1F1F1F]
          text-white
          flex
          items-center
          justify-between
          px-4
          shadow-lg
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              h-9
              w-9
              rounded-xl
              bg-[#C6A664]/10
              border
              border-[#C6A664]/20
              flex
              items-center
              justify-center
            "
          >
            <Home
              size={18}
              className="text-[#C6A664]"
            />
          </div>

          <div>

            <h1 className="font-bold text-lg leading-tight">
              Nest & Nook
            </h1>

            <p className="text-[10px] text-[#C6A664] tracking-wide">
              PMS
            </p>

          </div>

        </div>


        <button
          type="button"
          aria-label="Open navigation"
          onClick={() =>
            setMobileOpen(true)
          }
          className="
            h-10
            w-10
            rounded-xl
            border
            border-[#2A2A2C]
            bg-[#18181B]
            flex
            items-center
            justify-center
            text-zinc-300
            hover:text-[#C6A664]
            transition
          "
        >
          <Menu size={22} />
        </button>

      </header>


      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <div
          className="
            lg:hidden
            fixed
            inset-0
            z-50
            bg-black/60
            backdrop-blur-sm
          "
          onClick={closeMobileMenu}
        />
      )}


      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      <aside
        className={`
          lg:hidden
          fixed
          top-0
          left-0
          bottom-0
          z-[60]
          w-[82%]
          max-w-[320px]
          bg-[#0F0F10]
          border-r
          border-[#1F1F1F]
          text-white
          flex
          flex-col
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* Mobile Drawer Header */}

        <div className="p-5 border-b border-[#1F1F1F]">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div
                className="
                  h-10
                  w-10
                  rounded-xl
                  bg-[#C6A664]/10
                  border
                  border-[#C6A664]/20
                  flex
                  items-center
                  justify-center
                "
              >
                <Home
                  size={20}
                  className="text-[#C6A664]"
                />
              </div>

              <div>

                <h1 className="text-xl font-bold">
                  Nest & Nook
                </h1>

                <p className="text-[#C6A664] text-xs">
                  Luxury Property Management
                </p>

              </div>

            </div>


            <button
              type="button"
              aria-label="Close navigation"
              onClick={closeMobileMenu}
              className="
                h-9
                w-9
                rounded-xl
                bg-[#18181B]
                border
                border-[#27272A]
                flex
                items-center
                justify-center
                text-zinc-400
                hover:text-white
              "
            >
              <X size={20} />
            </button>

          </div>

        </div>


        {/* Mobile Navigation */}

        <nav className="flex-1 p-4 overflow-y-auto">

          <p
            className="
              px-4
              mb-4
              text-[10px]
              uppercase
              tracking-[0.18em]
              font-semibold
              text-zinc-600
            "
          >
            Main Menu
          </p>

          {menuItems.map((item) => {

            const Icon = item.icon;

            const active =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex
                  items-center
                  gap-4
                  px-4
                  py-4
                  rounded-xl
                  mb-2
                  transition
                  ${
                    active
                      ? `
                        bg-[#C6A664]/10
                        border
                        border-[#C6A664]/20
                        text-[#C6A664]
                      `
                      : `
                        border
                        border-transparent
                        text-zinc-400
                        hover:bg-white/5
                        hover:text-white
                      `
                  }
                `}
              >

                <Icon size={21} />

                <span className="font-medium text-[15px]">
                  {item.name}
                </span>

                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#C6A664]" />
                )}

              </Link>
            );

          })}

        </nav>


        {/* Mobile Footer */}

        <div className="p-4 border-t border-[#1F1F1F]">

          <button
            onClick={handleLogout}
            className="
              flex
              items-center
              justify-center
              gap-3
              px-4
              py-3.5
              rounded-xl
              w-full
              bg-[#18181B]
              border
              border-[#27272A]
              text-zinc-400
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

          <p className="text-center text-[10px] text-zinc-600 mt-4">
            Nest & Nook PMS v1.0
          </p>

        </div>

      </aside>
    </>
  );
}