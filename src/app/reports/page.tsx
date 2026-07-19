"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  calculateRevenue,
  calculateExpenses,
  calculateProfit,
  calculateBookingCount,
  calculateAverageDailyRevenue,
} from "@/lib/reportUtils";

export default function ReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("*");

    const { data: expenseData } = await supabase
      .from("expenses")
      .select("*");

    setBookings(bookingData || []);
    setExpenses(expenseData || []);
  }

  const revenue = calculateRevenue(
    bookings,
    fromDate,
    toDate
  );

  const totalExpenses = calculateExpenses(
    expenses,
    fromDate,
    toDate
  );

  const profit = calculateProfit(
    revenue,
    totalExpenses
  );

  const bookingCount = calculateBookingCount(
    bookings,
    fromDate,
    toDate
  );

  const averageDailyRevenue =
    calculateAverageDailyRevenue(
      bookings,
      fromDate,
      toDate
    );

  const chartData = [
    {
      name: "Revenue",
      amount: revenue,
    },
    {
      name: "Expenses",
      amount: totalExpenses,
    },
    {
      name: "Profit",
      amount: profit,
    },
  ];

  return (
    <div className="p-10 space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          Reports
        </h1>

        <p className="text-muted-foreground mt-2">
          Business performance overview
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm font-medium">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(e.target.value)
                }
                className="w-full border rounded-lg p-2 mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(e.target.value)
                }
                className="w-full border rounded-lg p-2 mt-2"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-5 gap-6">

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Revenue
            </p>

            <h2 className="text-3xl font-bold mt-2">
              ₹{revenue.toLocaleString("en-IN")}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Expenses
            </p>

            <h2 className="text-3xl font-bold mt-2">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Profit
            </p>

            <h2 className="text-3xl font-bold mt-2">
              ₹{profit.toLocaleString("en-IN")}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Bookings
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {bookingCount}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Avg Daily Revenue
            </p>

            <h2 className="text-3xl font-bold mt-2">
              ₹{averageDailyRevenue.toFixed(0)}
            </h2>
          </CardContent>
        </Card>

      </div>

      <Card>

        <CardHeader>
          <CardTitle>
            Financial Overview
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="h-[400px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart data={chartData}>

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="amount"
                  fill="#3b82f6"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </CardContent>

      </Card>

      <Card>

        <CardHeader>
          <CardTitle>
            Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

          <div>
            Revenue : ₹{revenue.toLocaleString("en-IN")}
          </div>

          <div>
            Expenses : ₹{totalExpenses.toLocaleString("en-IN")}
          </div>

          <div>
            Profit : ₹{profit.toLocaleString("en-IN")}
          </div>

          <div>
            Bookings : {bookingCount}
          </div>

          <div>
            Average Daily Revenue : ₹
            {averageDailyRevenue.toFixed(2)}
          </div>

        </CardContent>

      </Card>

    </div>
  );
}