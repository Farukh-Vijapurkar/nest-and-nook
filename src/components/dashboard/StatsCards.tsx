"use client";

import {
  IndianRupee,
  CalendarDays,
  Users,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface Props {
  revenue: number;
  bookings: number;
  guests: number;
  profit: number;
}

export default function StatsCards({
  revenue,
  bookings,
  guests,
  profit,
}: Props) {
  const cards = [
    {
      title: "Revenue",
      value: `₹${revenue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: "Current Month",
      icon: IndianRupee,
    },
    {
      title: "Bookings",
      value: bookings,
      subtitle: "Confirmed Bookings",
      icon: CalendarDays,
    },
    {
      title: "Guests",
      value: guests,
      subtitle: "Guests Hosted",
      icon: Users,
    },
    {
      title: "Profit",
      value: `₹${profit.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: "After Expenses",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">

      {cards.map((card) => {

        const Icon = card.icon;

        return (

          <Card
            key={card.title}
            className="
              rounded-3xl
              border-0
              shadow-sm
              hover:shadow-lg
              transition-all
              duration-300
              bg-white
            "
          >

            <CardContent className="p-7">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-zinc-500">
                    {card.title}
                  </p>

                  <h2 className="text-4xl font-bold mt-4 text-zinc-900">
                    {card.value}
                  </h2>

                  <p className="text-sm text-zinc-400 mt-3">
                    {card.subtitle}
                  </p>

                </div>

                <div
                  className="
                    h-14
                    w-14
                    rounded-2xl
                    bg-[#F8F4EB]
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Icon
                    className="text-[#C8A96A]"
                    size={28}
                  />

                </div>

              </div>

            </CardContent>

          </Card>

        );
      })}

    </div>
  );
}