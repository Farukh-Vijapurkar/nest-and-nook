"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  IndianRupee,
  Plus,
  Receipt,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import PropertySelector from "@/components/PropertySelector";
import {
  getBookingRevenueForDate,
  getBookingRevenueForDateRange,
} from "@/lib/bookingRevenue";

type Booking = {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  guest_count: number;
  status: string;
  created_at?: string;
  guests?: {
    full_name?: string;
    phone?: string;
    email?: string;
  };
  property?: {
    id: string;
    name: string;
    address?: string;
  };
};

type Expense = {
  id: string;
  property_id?: string;
  category?: string;
  amount: number;
  expense_date: string;
  created_at?: string;
  property?: {
    id: string;
    name: string;
  };
};

const money = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatLongDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardHome() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const [
      { data: bookingsData, error: bookingsError },
      { data: expensesData, error: expensesError },
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select(`
          *,
          guests (
            full_name,
            phone,
            email
          ),
          property:properties (
            id,
            name,
            address
          )
        `)
        .order("check_in", {
          ascending: true,
        }),

      supabase
        .from("expenses")
        .select(`
          *,
          property:properties (
            id,
            name
          )
        `)
        .order("expense_date", {
          ascending: false,
        }),
    ]);

    if (bookingsError) {
      console.error(
        "Dashboard bookings error:",
        bookingsError
      );
    }

    if (expensesError) {
      console.error(
        "Dashboard expenses error:",
        expensesError
      );
    }

    setBookings(
      (bookingsData || []) as Booking[]
    );

    setExpenses(
      (expensesData || []) as Expense[]
    );

    setLoading(false);
  }

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const monthStart = useMemo(() => {
    const d = new Date();

    d.setDate(1);

    return d
      .toISOString()
      .split("T")[0];
  }, []);

  const monthEnd = useMemo(() => {
    const d = new Date();

    d.setMonth(
      d.getMonth() + 1,
      0
    );

    return d
      .toISOString()
      .split("T")[0];
  }, []);

  const filteredBookings =
    selectedPropertyId === "all"
      ? bookings
      : bookings.filter(
          (booking) =>
            booking.property_id ===
            selectedPropertyId
        );

  const filteredExpenses =
    selectedPropertyId === "all"
      ? expenses
      : expenses.filter(
          (expense) =>
            expense.property_id ===
            selectedPropertyId
        );

  const activeBookings =
    filteredBookings.filter(
      (booking) =>
        booking.status !==
        "cancelled"
    );

  const currentBookings =
    activeBookings.filter(
      (booking) =>
        booking.check_in <= today &&
        booking.check_out > today
    );

  const upcomingBookings =
    activeBookings
      .filter(
        (booking) =>
          booking.check_in >= today
      )
      .sort(
        (a, b) =>
          new Date(
            a.check_in
          ).getTime() -
          new Date(
            b.check_in
          ).getTime()
      )
      .slice(0, 5);

  const monthBookings =
    activeBookings.filter(
      (booking) =>
        booking.check_in >=
          monthStart &&
        booking.check_in <=
          monthEnd
    );

  const monthRevenue =
    monthBookings.reduce(
      (sum, booking) =>
        sum +
        getBookingRevenueForDateRange(
          booking,
          monthStart,
          monthEnd
        ),
      0
    );

  const todayRevenue =
    activeBookings.reduce(
      (sum, booking) =>
        sum +
        getBookingRevenueForDate(
          booking,
          today
        ),
      0
    );

  const monthExpenses =
    filteredExpenses
      .filter(
        (expense) =>
          expense.expense_date >=
            monthStart &&
          expense.expense_date <=
            monthEnd
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );

  const profit =
    monthRevenue -
    monthExpenses;

  const totalGuests =
    activeBookings.reduce(
      (sum, booking) =>
        sum +
        Number(
          booking.guest_count || 1
        ),
      0
    );

  const averageBooking =
    monthBookings.length > 0
      ? monthRevenue /
        monthBookings.length
      : 0;

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  const recentActivity = [
    ...activeBookings.map(
      (booking) => ({
        id: `booking-${booking.id}`,
        type: "booking" as const,
        title:
          booking.guests
            ?.full_name ||
          "Guest",
        subtitle:
          booking.property
            ?.name ||
          "Reservation",
        amount: Number(
          booking.total_amount ||
            0
        ),
        date:
          booking.created_at ||
          booking.check_in,
      })
    ),

    ...filteredExpenses.map(
      (expense) => ({
        id: `expense-${expense.id}`,
        type: "expense" as const,
        title:
          expense.category ||
          "Expense",
        subtitle:
          expense.property
            ?.name ||
          "Expense recorded",
        amount: Number(
          expense.amount || 0
        ),
        date:
          expense.created_at ||
          expense.expense_date,
      })
    ),
  ]
    .sort(
      (a, b) =>
        new Date(
          b.date
        ).getTime() -
        new Date(
          a.date
        ).getTime()
    )
    .slice(0, 6);

  const revenueByWeek =
    Array.from(
      { length: 5 },
      (_, index) => {
        const year =
          new Date().getFullYear();

        const month =
          new Date().getMonth();

        const daysInMonth =
          new Date(
            year,
            month + 1,
            0
          ).getDate();

        const startDay =
          index * 7 + 1;

        const endDay =
          Math.min(
            daysInMonth,
            startDay + 6
          );

        const start =
          new Date(
            year,
            month,
            startDay
          )
            .toISOString()
            .split("T")[0];

        const end =
          new Date(
            year,
            month,
            endDay
          )
            .toISOString()
            .split("T")[0];

        return {
          label: `W${index + 1}`,

          value:
            monthBookings.reduce(
              (
                sum,
                booking
              ) =>
                sum +
                getBookingRevenueForDateRange(
                  booking,
                  start,
                  end
                ),
              0
            ),
        };
      }
    );

  const maxRevenue =
    Math.max(
      ...revenueByWeek.map(
        (item) =>
          item.value
      ),
      1
    );

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#18181B]">

      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8 space-y-6">

        {/* HEADER */}

        <section className="rounded-3xl bg-[#0F0F10] px-5 py-6 sm:px-7 sm:py-7 text-white shadow-[0_12px_35px_rgba(15,15,16,0.12)]">

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 text-xs font-medium text-white/55 mb-3">

                <span className="h-2 w-2 rounded-full bg-[#C6A664]" />

                NEST & NOOK · PMS

                <span className="text-white/25">
                  •
                </span>

                {formatLongDate(
                  today
                )}

              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.035em]">
                {greeting}, Farukh
              </h1>

              <p className="mt-2 text-sm sm:text-base text-white/60 max-w-xl">
                Your property performance,
                reservations and finances
                at a glance.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <div className="min-w-[230px] rounded-xl bg-white/10 border border-white/10 p-1">

                <PropertySelector
                  value={
                    selectedPropertyId
                  }
                  onChange={
                    setSelectedPropertyId
                  }
                  includeAll
                  label="Property / Unit"
                />

              </div>

              <Link
                href="/bookings"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C6A664] px-5 py-3 text-sm font-semibold text-[#0F0F10] hover:bg-[#D5B978] transition"
              >

                <Plus size={17} />

                New Booking

              </Link>

            </div>

          </div>

        </section>

        {/* KPI CARDS */}

        <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

          <KpiCard
            label="Monthly Revenue"
            value={money(
              monthRevenue
            )}
            caption="Current month"
            icon={
              <CircleDollarSign
                size={19}
              />
            }
            dark
          />

          <KpiCard
            label="Today's Revenue"
            value={money(
              todayRevenue
            )}
            caption="Recognized today"
            icon={
              <IndianRupee
                size={19}
              />
            }
          />

          <KpiCard
            label="Active Reservations"
            value={String(
              activeBookings.length
            )}
            caption={`${totalGuests} guests recorded`}
            icon={
              <CalendarDays
                size={19}
              />
            }
          />

          <KpiCard
            label="Net Profit"
            value={money(
              profit
            )}
            caption="Revenue less expenses"
            icon={
              <TrendingUp
                size={19}
              />
            }
            negative={
              profit < 0
            }
          />

        </section>

        {/* ANALYTICS */}

        <section className="grid xl:grid-cols-[1.7fr_1fr] gap-6">

          {/* REVENUE */}

          <div className="rounded-3xl bg-white border border-[#E3E1DC] shadow-[0_5px_25px_rgba(35,35,30,0.04)] p-5 sm:p-7">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#A88A4A]">
                  Financial performance
                </p>

                <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-[#0F0F10]">
                  Revenue overview
                </h2>

                <p className="mt-1 text-sm text-[#777269]">
                  Revenue recognized
                  across the current
                  month.
                </p>

              </div>

              <div className="rounded-xl bg-[#F5F0E5] px-3 py-2 text-xs font-semibold text-[#9A7B3D]">
                This month
              </div>

            </div>

            <div className="mt-8 h-60 flex items-end gap-2 sm:gap-5">

              {revenueByWeek.map(
                (item) => (

                  <div
                    key={item.label}
                    className="flex-1 h-full flex flex-col justify-end min-w-0"
                  >

                    <div className="relative flex-1 flex items-end">

                      <div
                        className="w-full rounded-t-2xl bg-[#C6A664] hover:bg-[#A88A4A] transition-all duration-200"
                        style={{
                          height: `${Math.max(
                            item.value >
                              0
                              ? 8
                              : 3,
                            (item.value /
                              maxRevenue) *
                              100
                          )}%`,
                        }}
                      />

                      {item.value >
                        0 && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#777269] whitespace-nowrap">
                          {money(
                            item.value
                          )}
                        </span>
                      )}

                    </div>

                    <span className="mt-3 text-center text-xs font-medium text-[#8C877D]">
                      {item.label}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

          {/* TODAY */}

          <div className="rounded-3xl bg-white border border-[#E3E1DC] shadow-[0_5px_25px_rgba(35,35,30,0.04)] p-5 sm:p-7">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#A88A4A]">
                  Operations
                </p>

                <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-[#0F0F10]">
                  Today
                </h2>

              </div>

              <Clock3
                size={20}
                className="text-[#777269]"
              />

            </div>

            <div className="mt-6 space-y-3">

              <MetricRow
                icon={
                  <CalendarDays
                    size={17}
                  />
                }
                label="Current stays"
                value={String(
                  currentBookings.length
                )}
                tone="gold"
              />

              <MetricRow
                icon={
                  <CalendarDays
                    size={17}
                  />
                }
                label="Upcoming"
                value={String(
                  upcomingBookings.length
                )}
                tone="gold"
              />

              <MetricRow
                icon={
                  <Users
                    size={17}
                  />
                }
                label="Total guests"
                value={String(
                  totalGuests
                )}
                tone="slate"
              />

              <MetricRow
                icon={
                  <Receipt
                    size={17}
                  />
                }
                label="Monthly expenses"
                value={money(
                  monthExpenses
                )}
                tone="red"
              />

            </div>

            <Link
              href="/calendar"
              className="mt-5 flex items-center justify-between rounded-xl bg-[#F7F6F2] border border-[#E3E1DC] px-4 py-3 text-sm font-semibold text-[#0F0F10] hover:bg-[#F1EEE7] transition"
            >

              View booking calendar

              <ChevronRight
                size={17}
              />

            </Link>

          </div>

        </section>

        {/* RESERVATIONS + FINANCE */}

        <section className="grid xl:grid-cols-[1.7fr_1fr] gap-6">

          {/* RESERVATIONS */}

          <div className="rounded-3xl bg-white border border-[#E3E1DC] shadow-[0_5px_25px_rgba(35,35,30,0.04)] overflow-hidden">

            <div className="p-5 sm:p-7 border-b border-[#E7E4DE] flex items-center justify-between gap-4">

              <div>

                <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#A88A4A]">
                  Reservations
                </p>

                <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-[#0F0F10]">
                  Upcoming stays
                </h2>

              </div>

              <Link
                href="/bookings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F0F10] hover:text-[#A88A4A]"
              >

                View all

                <ArrowUpRight
                  size={15}
                />

              </Link>

            </div>

            {upcomingBookings.length ===
            0 ? (

              <div className="p-10 text-center">

                <CalendarDays
                  size={38}
                  className="mx-auto text-[#C4B99F]"
                />

                <p className="mt-3 text-sm text-[#777269]">
                  No upcoming
                  reservations.
                </p>

              </div>

            ) : (

              <div>

                {upcomingBookings.map(
                  (booking) => (

                    <div
                      key={
                        booking.id
                      }
                      className="px-5 sm:px-7 py-4 border-b border-[#EEECE7] last:border-b-0"
                    >

                      <div className="flex flex-col md:flex-row md:items-center gap-4">

                        <div className="flex items-center gap-3 flex-1 min-w-0">

                          <div className="h-11 w-11 shrink-0 rounded-xl bg-[#F3EEE3] flex items-center justify-center">

                            <UserRound
                              size={18}
                              className="text-[#8A7448]"
                            />

                          </div>

                          <div className="min-w-0">

                            <p className="font-semibold text-[#0F0F10] truncate">
                              {booking
                                .guests
                                ?.full_name ||
                                "Guest"}
                            </p>

                            <p className="text-xs text-[#817B72] mt-1 truncate">

                              {booking
                                .property
                                ?.name ||
                                "Property"}

                              {" • "}

                              {booking
                                .guest_count ||
                                1}{" "}
                              guest

                              {(booking
                                .guest_count ||
                                1) !==
                              1
                                ? "s"
                                : ""}

                            </p>

                          </div>

                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6">

                          <div>

                            <p className="text-[10px] uppercase tracking-wide text-[#999287]">
                              Stay
                            </p>

                            <p className="text-sm font-medium text-[#3C3934] mt-1">

                              {formatDate(
                                booking.check_in
                              )}

                              {" — "}

                              {formatDate(
                                booking.check_out
                              )}

                            </p>

                          </div>

                          <div className="text-right min-w-[80px]">

                            <p className="text-[10px] uppercase tracking-wide text-[#999287]">
                              Amount
                            </p>

                            <p className="text-sm font-bold text-[#0F0F10] mt-1">

                              {money(
                                Number(
                                  booking.total_amount ||
                                    0
                                )
                              )}

                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* FINANCIAL SNAPSHOT */}

          <div className="rounded-3xl bg-[#0F0F10] text-white shadow-[0_10px_35px_rgba(15,15,16,0.13)] p-5 sm:p-7">

            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#C6A664]">
              Finance
            </p>

            <h2 className="mt-1 text-xl sm:text-2xl font-semibold">
              Monthly snapshot
            </h2>

            <div className="mt-8 space-y-5">

              <FinanceLine
                label="Revenue"
                value={
                  monthRevenue
                }
              />

              <FinanceLine
                label="Expenses"
                value={
                  monthExpenses
                }
                negative
              />

              <div className="h-px bg-white/10" />

              <div>

                <p className="text-sm text-white/55">
                  Net profit
                </p>

                <p
                  className={`mt-1 text-3xl font-semibold ${
                    profit < 0
                      ? "text-[#D88B82]"
                      : "text-white"
                  }`}
                >
                  {money(
                    profit
                  )}
                </p>

              </div>

              <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 space-y-3">

                <SummaryLine
                  label="Bookings"
                  value={String(
                    monthBookings.length
                  )}
                />

                <SummaryLine
                  label="Guests"
                  value={String(
                    totalGuests
                  )}
                />

                <SummaryLine
                  label="Average booking"
                  value={money(
                    averageBooking
                  )}
                />

              </div>

            </div>

          </div>

        </section>

        {/* RECENT ACTIVITY */}

        <section className="rounded-3xl bg-white border border-[#E3E1DC] shadow-[0_5px_25px_rgba(35,35,30,0.04)] overflow-hidden">

          <div className="p-5 sm:p-7 border-b border-[#E7E4DE] flex items-center justify-between">

            <div>

              <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#A88A4A]">
                Activity
              </p>

              <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-[#0F0F10]">
                Recent activity
              </h2>

            </div>

            <Link
              href="/reports"
              className="text-sm font-semibold text-[#0F0F10] hover:text-[#A88A4A]"
            >
              Reports
            </Link>

          </div>

          {recentActivity.length ===
          0 ? (

            <div className="p-10 text-center text-sm text-[#777269]">
              No recent activity.
            </div>

          ) : (

            <div className="grid md:grid-cols-2 xl:grid-cols-3">

              {recentActivity.map(
                (activity) => (

                  <div
                    key={
                      activity.id
                    }
                    className="p-5 sm:p-6 border-b md:border-r border-[#EEECE7]"
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          activity.type ===
                          "booking"
                            ? "bg-[#F3EEE3]"
                            : "bg-[#F5E8E5]"
                        }`}
                      >

                        {activity.type ===
                        "booking" ? (

                          <CalendarDays
                            size={18}
                            className="text-[#8A7448]"
                          />

                        ) : (

                          <Receipt
                            size={18}
                            className="text-[#B34B43]"
                          />

                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="font-semibold text-sm text-[#0F0F10] truncate">
                          {
                            activity.title
                          }
                        </p>

                        <p className="text-xs text-[#817B72] mt-0.5 truncate">
                          {
                            activity.subtitle
                          }
                        </p>

                      </div>

                    </div>

                    <div className="flex items-end justify-between mt-5">

                      <span className="text-xs text-[#969087]">

                        {new Date(
                          activity.date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )}

                      </span>

                      <span
                        className={`font-semibold text-sm ${
                          activity.type ===
                          "expense"
                            ? "text-[#B94B45]"
                            : "text-[#0F0F10]"
                        }`}
                      >

                        {activity.type ===
                        "expense"
                          ? `-${money(
                              activity.amount
                            )}`
                          : money(
                              activity.amount
                            )}

                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* FOOTER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 pb-4 text-xs text-[#8C877D]">

          <span className="flex items-center gap-2">

            <Sparkles
              size={14}
              className="text-[#C28A2E]"
            />

            Nest & Nook Property
            Management

          </span>

          <span>

            {loading
              ? "Updating dashboard..."
              : "Data synced"}

          </span>

        </div>

      </div>

    </div>
  );
}

function KpiCard({
  label,
  value,
  caption,
  icon,
  dark = false,
  negative = false,
}: {
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  dark?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border shadow-[0_5px_20px_rgba(35,35,30,0.04)] ${
        dark
          ? "bg-[#0F0F10] border-[#0F0F10] text-white"
          : "bg-white border-[#E3E1DC]"
      }`}
    >

      <div className="flex items-center justify-between">

        <span
          className={`text-sm ${
            dark
              ? "text-white/60"
              : "text-[#787269]"
          }`}
        >
          {label}
        </span>

        <span
          className={`${
            dark
              ? "text-[#C6A664]"
              : "text-[#C28A2E]"
          }`}
        >
          {icon}
        </span>

      </div>

      <p
        className={`mt-4 text-2xl sm:text-3xl font-semibold tracking-tight ${
          negative
            ? "text-[#B34B43]"
            : dark
            ? "text-white"
            : "text-[#0F0F10]"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-xs ${
          dark
            ? "text-white/45"
            : "text-[#969087]"
        }`}
      >
        {caption}
      </p>

    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone:
    | "gold"
    | "slate"
    | "red";
}) {
  const tones = {
    gold:
      "bg-[#F5F0E8] text-[#A88A4A]",
    slate:
      "bg-[#EFEEE9] text-[#68645D]",
    red:
      "bg-[#F5E8E5] text-[#B34B43]",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E3E0D9] px-4 py-3">

      <div className="flex items-center gap-3">

        <span
          className={`h-9 w-9 rounded-lg flex items-center justify-center ${tones[tone]}`}
        >
          {icon}
        </span>

        <span className="text-sm text-[#666159]">
          {label}
        </span>

      </div>

      <span className="text-sm font-semibold text-[#25231F]">
        {value}
      </span>

    </div>
  );
}

function FinanceLine({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-white/55">
        {label}
      </span>

      <span
        className={`font-semibold ${
          negative
            ? "text-[#D88B82]"
            : "text-white"
        }`}
      >

        {negative ? "-" : ""}

        {money(value)}

      </span>

    </div>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">

      <span className="text-white/50">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>

    </div>
  );
}