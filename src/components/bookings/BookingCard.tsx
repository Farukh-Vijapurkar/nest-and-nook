"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  CalendarDays,
  Users,
  IndianRupee,
  Pencil,
  Trash2,
  Home,
} from "lucide-react";

interface BookingCardProps {
  booking: any;
  propertyName?: string;

  onEdit: (booking: any) => void;
  onDelete: (booking: any) => void;
}

export default function BookingCard({
  booking,
  propertyName,
  onEdit,
  onDelete,
}: BookingCardProps) {
  const status = booking.status || "confirmed";

  const statusLabel =
    status === "checked_in"
      ? "Checked In"
      : status === "checked_out"
      ? "Checked Out"
      : status === "cancelled"
      ? "Cancelled"
      : "Confirmed";

  const statusClass =
    status === "checked_in"
      ? "bg-blue-50 text-blue-700"
      : status === "checked_out"
      ? "bg-gray-100 text-gray-700"
      : status === "cancelled"
      ? "bg-red-50 text-red-700"
      : "bg-green-50 text-green-700";

  const guestCount = Number(
    booking.guest_count || 1
  );

  const amount = Number(
    booking.total_amount || 0
  );

  return (
    <Card className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">

      <CardHeader className="pb-3">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <CardTitle className="truncate text-lg">
              {booking.guest?.name ||
                booking.guest_name ||
                "Guest"}
            </CardTitle>

            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />

              <span>
                {guestCount}{" "}
                {guestCount === 1
                  ? "Guest"
                  : "Guests"}
              </span>
            </div>

          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>

        </div>

      </CardHeader>

      <CardContent className="space-y-4">

        {/* Property / Unit */}

        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
            <Home className="h-4 w-4" />
          </div>

          <div className="min-w-0">

            <p className="text-xs text-muted-foreground">
              Property / Unit
            </p>

            <p className="truncate font-medium">
              {propertyName ||
                booking.property?.name ||
                "Property"}
            </p>

          </div>

        </div>

        {/* Dates */}

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-muted/40 p-3">

            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Check In
            </div>

            <p className="text-sm font-semibold">
              {booking.check_in}
            </p>

          </div>

          <div className="rounded-xl bg-muted/40 p-3">

            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Check Out
            </div>

            <p className="text-sm font-semibold">
              {booking.check_out}
            </p>

          </div>

        </div>

        {/* Amount */}

        <div className="flex items-center justify-between rounded-xl border p-3">

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IndianRupee className="h-4 w-4" />

            <span>Total Amount</span>
          </div>

          <p className="text-lg font-bold">
            ₹
            {amount.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </p>

        </div>

        {/* Actions */}

        <div className="flex gap-2 pt-1">

          <Button
            asChild
            variant="outline"
            className="flex-1"
          >
            <Link
              href={`/bookings/${booking.id}`}
            >
              View
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            title="Edit booking"
            onClick={() =>
              onEdit(booking)
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            title="Delete booking"
            onClick={() =>
              onDelete(booking)
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>

        </div>

      </CardContent>

    </Card>
  );
}