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

export default function ReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: bookingData } =
      await supabase
        .from("bookings")
        .select("*");

    const { data: expenseData } =
      await supabase
        .from("expenses")
        .select("*");

    setBookings(bookingData || []);
    setExpenses(expenseData || []);
  }

  const revenue = bookings.reduce(
    (sum, booking) =>
      sum + Number(booking.total_amount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

  const profit = revenue - totalExpenses;

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

      <div className="grid md:grid-cols-4 gap-6">

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Revenue
            </p>

            <h2 className="text-4xl font-bold mt-2">
              ₹{revenue}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Expenses
            </p>

            <h2 className="text-4xl font-bold mt-2">
              ₹{totalExpenses}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Profit
            </p>

            <h2 className="text-4xl font-bold mt-2">
              ₹{profit}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Bookings
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {bookings.length}
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
            Total Revenue: ₹{revenue}
          </div>

          <div>
            Total Expenses: ₹{totalExpenses}
          </div>

          <div>
            Net Profit: ₹{profit}
          </div>

          <div>
            Total Bookings: {bookings.length}
          </div>

        </CardContent>

      </Card>

    </div>
  );
}