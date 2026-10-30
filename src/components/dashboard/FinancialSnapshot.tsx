"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  IndianRupee,
  Wallet,
  TrendingUp,
  Receipt,
} from "lucide-react";

interface Props {
  todayRevenue: number;
  monthRevenue: number;
  expenses: number;
  profit: number;
  bookings: number;
}

export default function FinancialSnapshot({
  todayRevenue,
  monthRevenue,
  expenses,
  profit,
  bookings,
}: Props) {

  const averageBooking =
    bookings > 0
      ? monthRevenue / bookings
      : 0;

  const stats = [
    {
      title: "Today's Revenue",
      value: todayRevenue,
      icon: Wallet,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: monthRevenue,
      icon: IndianRupee,
      color: "bg-[#F8F4EB] text-[#C8A96A]",
    },
    {
      title: "Expenses",
      value: expenses,
      icon: Receipt,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Profit",
      value: profit,
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <Card className="rounded-3xl border-0 shadow-sm">

      <CardContent className="p-8">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-2xl font-bold">
              Financial Snapshot
            </h2>

            <p className="text-zinc-500">
              Current month's performance
            </p>

          </div>

        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

          {stats.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="
                  rounded-2xl
                  border
                  p-6
                  bg-white
                "
              >

                <div
                  className={`
                    h-12
                    w-12
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    ${item.color}
                  `}
                >

                  <Icon size={24} />

                </div>

                <p className="mt-5 text-zinc-500">
                  {item.title}
                </p>

                <h3 className="text-3xl font-bold mt-2">

                  ₹{item.value.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}

                </h3>

              </div>

            );

          })}

        </div>

        <div
          className="
            mt-8
            rounded-2xl
            bg-[#F8F4EB]
            p-6
            flex
            justify-between
            items-center
          "
        >

          <div>

            <p className="text-zinc-500">
              Average Booking Value
            </p>

            <h2 className="text-3xl font-bold mt-2">

              ₹{averageBooking.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}

            </h2>

          </div>

          <TrendingUp
            className="text-[#C8A96A]"
            size={42}
          />

        </div>

      </CardContent>

    </Card>
  );
}