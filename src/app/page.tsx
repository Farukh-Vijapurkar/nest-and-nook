"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  getBookingRevenueForDate,
  getBookingRevenueForDateRange,
} from "@/lib/bookingRevenue";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PropertySelector from "@/components/PropertySelector";
import StatsCards from "@/components/dashboard/StatsCards";
import PropertyStatus from "@/components/dashboard/PropertyStatus";
import UpcomingReservations from "@/components/dashboard/UpcomingReservations";
import FinancialSnapshot from "@/components/dashboard/FinancialSnapshot";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function Home() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // "all" means all properties / units
  const [selectedPropertyId, setSelectedPropertyId] =
    useState("all");

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    const {
      data: bookingsData,
      error: bookingsError,
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

    if (bookingsError) {
      console.error(
        "Error loading bookings:",
        bookingsError
      );
    }

    const {
      data: expensesData,
      error: expensesError,
    } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (expensesError) {
      console.error(
        "Error loading expenses:",
        expensesError
      );
    }

    setBookings(bookingsData || []);
    setExpenses(expensesData || []);
  }

  /*
   * Filter bookings based on selected property/unit.
   *
   * "all" = all units
   * otherwise = selected unit only
   */
  const filteredBookings =
    selectedPropertyId === "all"
      ? bookings
      : bookings.filter(
          (booking) =>
            booking.property_id ===
            selectedPropertyId
        );

  /*
   * Filter expenses based on selected property/unit.
   */
  const filteredExpenses =
    selectedPropertyId === "all"
      ? expenses
      : expenses.filter(
          (expense) =>
            expense.property_id ===
            selectedPropertyId
        );

  /*
   * Total booking revenue.
   *
   * This represents the complete revenue
   * of the filtered bookings.
   */
  const revenue = filteredBookings.reduce(
    (sum, booking) =>
      sum +
      Number(booking.total_amount || 0),
    0
  );

  /*
   * Total expenses for selected unit(s).
   */
  const totalExpenses =
    filteredExpenses.reduce(
      (sum, expense) =>
        sum +
        Number(expense.amount || 0),
      0
    );

  /*
   * Total profit.
   */
  const profit =
    revenue - totalExpenses;

  /*
   * Total guests.
   */
  const totalGuests =
    filteredBookings.reduce(
      (sum, booking) =>
        sum +
        Number(
          booking.guest_count || 1
        ),
      0
    );

  /*
   * Today's date.
   */
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /*
   * Current booking for selected unit(s).
   */
  const currentBooking =
    filteredBookings.find(
      (booking) =>
        booking.status ===
          "checked_in" ||
        (booking.check_in <= today &&
          booking.check_out > today)
    ) || null;

  /*
   * Today's revenue.
   *
   * This uses the nightly allocation.
   *
   * Example:
   *
   * Booking:
   * Aug 1 → Aug 9
   * ₹9,000
   *
   * 8 nights
   * ₹1,125 per night
   *
   * If today is Aug 5:
   * today's revenue = ₹1,125
   */
  const todayRevenue =
    filteredBookings.reduce(
      (sum, booking) =>
        sum +
        getBookingRevenueForDate(
          booking,
          today
        ),
      0
    );

  /*
   * Current month boundaries.
   *
   * Example:
   *
   * August:
   * start = Aug 1
   * end   = Sep 1
   *
   * The end date is exclusive.
   */
  const currentDate = new Date();

  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const nextMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  const monthStartString =
    monthStart
      .toISOString()
      .split("T")[0];

  const monthEndString =
    nextMonthStart
      .toISOString()
      .split("T")[0];

  /*
   * Revenue earned during the current month.
   *
   * IMPORTANT:
   *
   * This is different from "revenue".
   *
   * revenue =
   * complete booking revenue
   *
   * monthRevenue =
   * only the portion of booking revenue
   * earned during the current month.
   *
   * Example:
   *
   * Aug 28 → Sep 3
   * ₹6,000 total
   * 6 nights
   * ₹1,000/night
   *
   * August:
   * 4 nights × ₹1,000
   * = ₹4,000
   *
   * September:
   * 2 nights × ₹1,000
   * = ₹2,000
   */
  const monthRevenue =
    filteredBookings.reduce(
      (sum, booking) =>
        sum +
        getBookingRevenueForDateRange(
          booking,
          monthStartString,
          monthEndString
        ),
      0
    );

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-8 space-y-8">

      <DashboardHeader />

      {/* Property / Unit Filter */}

      <div className="flex items-end gap-4">
        <div className="w-full max-w-sm">
          <PropertySelector
            value={selectedPropertyId}
            onChange={setSelectedPropertyId}
            includeAll
            label="Property / Unit"
          />
        </div>
      </div>

      {/* Dashboard Statistics */}

      <StatsCards
        revenue={revenue}
        bookings={filteredBookings.length}
        guests={totalGuests}
        profit={profit}
      />

      {/* Current Property Status */}

      <PropertyStatus
        currentBooking={currentBooking}
      />

      {/* Upcoming Reservations */}

      <UpcomingReservations
        bookings={filteredBookings}
      />

      {/* Financial Snapshot */}

      <FinancialSnapshot
        todayRevenue={todayRevenue}
        monthRevenue={monthRevenue}
        expenses={totalExpenses}
        profit={profit}
        bookings={filteredBookings.length}
      />

      {/* Quick Actions */}

      <QuickActions />

      {/* Recent Activity */}

      <RecentActivity
        bookings={filteredBookings}
        expenses={filteredExpenses}
      />

    </div>
  );
}