"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  getBookingNights,
  getBookingRevenueForDateRange,
} from "@/lib/bookingRevenue";

import PropertySelector from "@/components/PropertySelector";

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

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // "all" = all properties / units
  const [selectedPropertyId, setSelectedPropertyId] =
    useState("all");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const {
      data: bookingData,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .select(`
        *,
        guests (
          full_name
        ),
        property:properties (
          id,
          name,
          address
        )
      `)
      .order("check_in", {
        ascending: false,
      });

    if (bookingError) {
      console.error(
        "Error loading bookings:",
        bookingError
      );
    }

    const {
      data: expenseData,
      error: expenseError,
    } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", {
        ascending: false,
      });

    if (expenseError) {
      console.error(
        "Error loading expenses:",
        expenseError
      );
    }

    setBookings(bookingData || []);
    setExpenses(expenseData || []);

    setLoading(false);
  }

  /*
   * Filter bookings by selected property / unit.
   */
  const propertyFilteredBookings =
    useMemo(() => {
      if (selectedPropertyId === "all") {
        return bookings;
      }

      return bookings.filter(
        (booking) =>
          booking.property_id ===
          selectedPropertyId
      );
    }, [
      bookings,
      selectedPropertyId,
    ]);

  /*
   * Filter expenses by selected property / unit.
   */
  const propertyFilteredExpenses =
    useMemo(() => {
      if (selectedPropertyId === "all") {
        return expenses;
      }

      return expenses.filter(
        (expense) =>
          expense.property_id ===
          selectedPropertyId
      );
    }, [
      expenses,
      selectedPropertyId,
    ]);

  /*
   * Determine whether a booking overlaps
   * the selected report date range.
   *
   * Booking:
   * Aug 28 → Sep 3
   *
   * Report:
   * Sep 1 → Sep 30
   *
   * The booking overlaps the report range.
   */
  function bookingOverlapsRange(
    booking: any
  ) {
    if (!fromDate && !toDate) {
      return true;
    }

    const bookingStart =
      booking.check_in;

    const bookingEnd =
      booking.check_out;

    if (fromDate && bookingEnd <= fromDate) {
      return false;
    }

    if (toDate && bookingStart >= toDate) {
      return false;
    }

    return true;
  }

  /*
   * Filter bookings that have at least one
   * occupied night inside the selected range.
   */
  const reportBookings = useMemo(() => {
    return propertyFilteredBookings.filter(
      (booking) =>
        bookingOverlapsRange(booking)
    );
  }, [
    propertyFilteredBookings,
    fromDate,
    toDate,
  ]);

  /*
   * Revenue calculation.
   *
   * If no dates are selected:
   * use complete booking revenue.
   *
   * If a date range is selected:
   * calculate revenue based on occupied nights.
   */
  const revenue = useMemo(() => {
    if (!fromDate && !toDate) {
      return propertyFilteredBookings.reduce(
        (sum, booking) =>
          sum +
          Number(
            booking.total_amount || 0
          ),
        0
      );
    }

    /*
     * If only From Date is selected,
     * use a very large future date.
     */
    const rangeStart =
      fromDate ||
      "1900-01-01";

    /*
     * If only To Date is selected,
     * use a very early date as the beginning.
     *
     * The helper uses the end date as
     * an exclusive boundary.
     */
    const rangeEnd =
      toDate ||
      "2999-12-31";

    return propertyFilteredBookings.reduce(
      (sum, booking) =>
        sum +
        getBookingRevenueForDateRange(
          booking,
          rangeStart,
          rangeEnd
        ),
      0
    );
  }, [
    propertyFilteredBookings,
    fromDate,
    toDate,
  ]);

  /*
   * Expense calculation.
   *
   * Expenses are point-in-time records,
   * so expense_date is used for filtering.
   */
  const totalExpenses = useMemo(() => {
    return propertyFilteredExpenses.reduce(
      (sum, expense) => {
        const expenseDate =
          expense.expense_date;

        if (!expenseDate) {
          return sum;
        }

        if (
          fromDate &&
          expenseDate < fromDate
        ) {
          return sum;
        }

        if (
          toDate &&
          expenseDate > toDate
        ) {
          return sum;
        }

        return (
          sum +
          Number(
            expense.amount || 0
          )
        );
      },
      0
    );
  }, [
    propertyFilteredExpenses,
    fromDate,
    toDate,
  ]);

  /*
   * Profit.
   */
  const profit =
    revenue - totalExpenses;

  /*
   * Number of bookings that overlap
   * the selected report period.
   */
  const bookingCount =
    reportBookings.length;

  /*
   * Calculate the number of nights
   * represented by the report.
   *
   * This is used for Average Daily Revenue.
   */
  const reportNights = useMemo(() => {
    /*
     * If no date range is selected,
     * calculate average using all
     * booked nights.
     */
    if (!fromDate && !toDate) {
      return propertyFilteredBookings.reduce(
        (sum, booking) =>
          sum +
          getBookingNights(
            booking.check_in,
            booking.check_out
          ),
        0
      );
    }

    let totalNights = 0;

    for (const booking of reportBookings) {
      const bookingStart =
        booking.check_in;

      const bookingEnd =
        booking.check_out;

      const effectiveStart =
        fromDate &&
        bookingStart < fromDate
          ? fromDate
          : bookingStart;

      const effectiveEnd =
        toDate &&
        bookingEnd > toDate
          ? toDate
          : bookingEnd;

      if (
        effectiveStart >= effectiveEnd
      ) {
        continue;
      }

      totalNights +=
        getBookingNights(
          effectiveStart,
          effectiveEnd
        );
    }

    return totalNights;
  }, [
    propertyFilteredBookings,
    reportBookings,
    fromDate,
    toDate,
  ]);

  /*
   * Average revenue per occupied night.
   *
   * Example:
   *
   * Revenue = ₹9,000
   * Nights = 8
   *
   * Average Daily Revenue = ₹1,125
   */
  const averageDailyRevenue =
    reportNights > 0
      ? revenue / reportNights
      : 0;

  /*
   * Chart data.
   */
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

  /*
   * Format currency consistently.
   */
  function formatCurrency(
    value: number
  ) {
    return `₹${value.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  return (
    <div className="p-10 space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold">
          Reports
        </h1>

        <p className="text-muted-foreground mt-2">
          Business performance overview
        </p>
      </div>

      {/* Filters */}

      <Card>
        <CardHeader>
          <CardTitle>
            Report Filters
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">

            {/* Property */}

            <div>
              <PropertySelector
                value={selectedPropertyId}
                onChange={
                  setSelectedPropertyId
                }
                includeAll
                label="Property / Unit"
              />
            </div>

            {/* From Date */}

            <div>
              <label className="text-sm font-medium">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-2 mt-2"
              />
            </div>

            {/* To Date */}

            <div>
              <label className="text-sm font-medium">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-2 mt-2"
              />
            </div>

          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Revenue is calculated using
              actual occupied nights within
              the selected date range.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading */}

      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading report data...
        </div>
      )}

      {/* Statistics */}

      <div className="grid md:grid-cols-5 gap-6">

        {/* Revenue */}

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Revenue
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(
                revenue
              )}
            </h2>
          </CardContent>
        </Card>

        {/* Expenses */}

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Expenses
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(
                totalExpenses
              )}
            </h2>
          </CardContent>
        </Card>

        {/* Profit */}

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Profit
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(
                profit
              )}
            </h2>
          </CardContent>
        </Card>

        {/* Bookings */}

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

        {/* Average Daily Revenue */}

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Avg Daily Revenue
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(
                averageDailyRevenue
              )}
            </h2>
          </CardContent>
        </Card>

      </div>

      {/* Financial Overview */}

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

              <BarChart
                data={chartData}
              >

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip
                  formatter={(
                    value: any
                  ) =>
                    formatCurrency(
                      Number(value)
                    )
                  }
                />

                <Bar
                  dataKey="amount"
                  fill="#3b82f6"
                  radius={[
                    10,
                    10,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </CardContent>

      </Card>

      {/* Summary */}

      <Card>

        <CardHeader>
          <CardTitle>
            Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

          <div>
            Revenue :{" "}
            {formatCurrency(
              revenue
            )}
          </div>

          <div>
            Expenses :{" "}
            {formatCurrency(
              totalExpenses
            )}
          </div>

          <div>
            Profit :{" "}
            {formatCurrency(
              profit
            )}
          </div>

          <div>
            Bookings :{" "}
            {bookingCount}
          </div>

          <div>
            Occupied Nights :{" "}
            {reportNights}
          </div>

          <div>
            Average Daily Revenue :{" "}
            {formatCurrency(
              averageDailyRevenue
            )}
          </div>

        </CardContent>

      </Card>

    </div>
  );
}