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
import PropertySelector from "@/components/PropertySelector";

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
  const [propertyId, setPropertyId] = useState("");

  const [amount, setAmount] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState("confirmed");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!booking) return;

    setPropertyId(booking.property_id ?? "");

    setAmount(String(booking.total_amount ?? ""));

    setCheckIn(booking.check_in ?? "");

    setCheckOut(booking.check_out ?? "");

    setGuestCount(
      Math.max(1, Number(booking.guest_count ?? 1))
    );

    setStatus(booking.status ?? "confirmed");
  }, [booking]);

  async function updateBooking() {
    if (!booking) return;

    if (!propertyId) {
      alert("Please select a property / unit.");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    if (!amount || Number(amount) < 0) {
      alert("Please enter a valid booking amount.");
      return;
    }

    setLoading(true);

    /*
     * Check availability only for the selected property/unit.
     *
     * The current booking is excluded because we are editing it.
     * Cancelled bookings do not block the dates.
     */

    const {
      data: existingBookings,
      error: fetchError,
    } = await supabase
      .from("bookings")
      .select(
        "id, property_id, check_in, check_out, status"
      )
      .eq("property_id", propertyId)
      .neq("id", booking.id)
      .neq("status", "cancelled");

    if (fetchError) {
      alert(fetchError.message);
      setLoading(false);
      return;
    }

    /*
     * Date overlap logic:
     *
     * Existing:
     * 10 Aug → 15 Aug
     *
     * New:
     * 12 Aug → 14 Aug
     *
     * Conflict = true
     */

    const hasConflict =
      existingBookings?.some((existingBooking: any) => {
        return (
          checkIn < existingBooking.check_out &&
          checkOut > existingBooking.check_in
        );
      }) ?? false;

    if (hasConflict) {
      alert(
        "Booking conflict detected for the selected property/unit."
      );

      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        total_amount: Number(amount),
        guest_count: guestCount,
        status,
      })
      .eq("id", booking.id);

    if (updateError) {
      alert(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    onUpdated();

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* Property / Unit */}

          <PropertySelector
            value={propertyId}
            onChange={setPropertyId}
            disabled={loading}
          />

          {/* Amount */}

          <Input
            required
            type="number"
            min={0}
            placeholder="Booking Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            disabled={loading}
          />

          {/* Check In */}

          <div>
            <label className="block mb-2 text-sm font-medium">
              Check In Date
            </label>

            <Input
              required
              type="date"
              value={checkIn}
              onChange={(e) =>
                setCheckIn(e.target.value)
              }
              disabled={loading}
            />
          </div>

          {/* Check Out */}

          <div>
            <label className="block mb-2 text-sm font-medium">
              Check Out Date
            </label>

            <Input
              required
              type="date"
              min={checkIn || undefined}
              value={checkOut}
              onChange={(e) =>
                setCheckOut(e.target.value)
              }
              disabled={loading}
            />
          </div>

          {/* Guest Count */}

          <Input
            type="number"
            min={1}
            placeholder="Guest Count"
            value={guestCount}
            onChange={(e) =>
              setGuestCount(
                Math.max(
                  1,
                  Number(e.target.value || 1)
                )
              )
            }
            disabled={loading}
          />

          {/* Status */}

          <div>
            <label className="block mb-2 text-sm font-medium">
              Booking Status
            </label>

            <select
              className="w-full rounded-md border bg-background px-3 py-2"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              disabled={loading}
            >
              <option value="confirmed">
                Confirmed
              </option>

              <option value="checked_in">
                Checked In
              </option>

              <option value="checked_out">
                Checked Out
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>

          {/* Actions */}

          <div className="flex justify-end gap-2 pt-2">

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                loading ||
                !propertyId ||
                !amount ||
                !checkIn ||
                !checkOut
              }
              onClick={updateBooking}
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </Button>

          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}