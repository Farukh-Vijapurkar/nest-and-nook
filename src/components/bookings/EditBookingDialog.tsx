"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface EditBookingDialogProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export default function EditBookingDialog({
  booking,
  open,
  onOpenChange,
  onUpdated,
}: EditBookingDialogProps) {
  const [amount, setAmount] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!booking) return;

    setAmount(String(booking.total_amount ?? ""));
    setCheckIn(booking.check_in ?? "");
    setCheckOut(booking.check_out ?? "");
    setGuestCount(booking.guest_count ?? 1);
    setStatus(booking.status ?? "confirmed");
  }, [booking]);

  async function updateBooking() {
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert("Check-out date must be after check-in date");
      return;
    }
    if (!booking) return;

    setLoading(true);

    const { 
        data: existingBookings,
        error: fetchError
    } = await supabase
      .from("bookings")
      .select("*")
      .neq("id", booking.id)
      .neq("status", "cancelled");

      if (fetchError) {
        alert(fetchError.message);
        setLoading(false);
        return;
      }

          const hasConflict =
      existingBookings?.some((b: any) => {
        return (
          checkIn < b.check_out &&
          checkOut > b.check_in
        );
      }) ?? false;

    if (hasConflict) {
      alert("Booking conflict detected");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        check_in: checkIn,
        check_out: checkOut,
        total_amount: Number(amount),
        guest_count: guestCount,
        status,
      })
      .eq("id", booking.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onUpdated();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            required
            type="number"
            min={0}
            placeholder="Booking Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            required
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />

          <Input
            required
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />

                  <Input
            type="number"
            min={1}
            placeholder="Guest Count"
            value={guestCount}
            onChange={(e) =>
              setGuestCount(Math.max(1, Number(e.target.value || 1)))
            }
          />

          <select
            className="w-full rounded-md border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex justify-end gap-2 pt-2">

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                loading ||
                !amount ||
                !checkIn ||
                !checkOut
              }
              onClick={updateBooking}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>

          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

