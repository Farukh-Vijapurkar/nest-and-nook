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
      accent: "#C28A2E",
      iconBg: "#F3EBDD",
    },
    {
      title: "Bookings",
      value: bookings,
      subtitle: "Confirmed Bookings",
      icon: CalendarDays,
      accent: "#4F8A65",
      iconBg: "#EAF3EC",
    },
    {
      title: "Guests",
      value: guests,
      subtitle: "Guests Hosted",
      icon: Users,
      accent: "#6B7280",
      iconBg: "#EEF0F2",
    },
    {
      title: "Profit",
      value: `₹${profit.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: "After Expenses",
      icon: TrendingUp,
      accent: "#173F35",
      iconBg: "#E7F0EC",
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="rounded-3xl border border-[#E7E0D5] shadow-[0_6px_25px_rgba(60,45,25,0.06)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(60,45,25,0.09)] transition-all duration-300 bg-white overflow-hidden"
          >
            <CardContent className="p-6">
              <div
                className="h-1 -mx-6 -mt-6 mb-6"
                style={{ backgroundColor: card.accent }}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#77766F]">
                    {card.title}
                  </p>

                  <h2 className="text-3xl md:text-4xl font-bold mt-3 text-[#173F35] truncate">
                    {card.value}
                  </h2>

                  <p className="text-xs text-[#9A968C] mt-2">
                    {card.subtitle}
                  </p>
                </div>

                <div
                  className="h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <Icon
                    style={{ color: card.accent }}
                    size={24}
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