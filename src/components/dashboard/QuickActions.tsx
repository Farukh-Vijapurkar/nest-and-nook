"use client";

import Link from "next/link";
import {
  Plus,
  Wallet,
  CalendarOff,
  FileSpreadsheet,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function QuickActions() {

  const actions = [
    {
      title: "New Booking",
      description: "Create a new reservation",
      icon: Plus,
      href: "/bookings",
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Add Expense",
      description: "Record a property expense",
      icon: Wallet,
      href: "/expenses",
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Block Dates",
      description: "Mark dates unavailable",
      icon: CalendarOff,
      href: "/calendar",
      bg: "bg-orange-100",
      color: "text-orange-600",
    },
    {
      title: "Reports",
      description: "View revenue & analytics",
      icon: FileSpreadsheet,
      href: "/reports",
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  return (

    <Card className="rounded-3xl border-0 shadow-sm">

      <CardContent className="p-8">

        <div className="mb-8">

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <p className="text-zinc-500 mt-1">
            Frequently used shortcuts
          </p>

        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

          {actions.map((action) => {

            const Icon = action.icon;

            return (

              <Link
                key={action.title}
                href={action.href}
              >

                <div
                  className="
                    rounded-3xl
                    border
                    bg-white
                    p-6
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    cursor-pointer
                  "
                >

                  <div
                    className={`
                      h-14
                      w-14
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      ${action.bg}
                    `}
                  >

                    <Icon
                      className={action.color}
                      size={28}
                    />

                  </div>

                  <h3 className="mt-6 font-bold text-lg">

                    {action.title}

                  </h3>

                  <p className="text-sm text-zinc-500 mt-2">

                    {action.description}

                  </p>

                </div>

              </Link>

            );

          })}

        </div>

      </CardContent>

    </Card>

  );
}