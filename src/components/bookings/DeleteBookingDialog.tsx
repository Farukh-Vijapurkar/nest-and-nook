"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface DeleteBookingDialogProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export default function DeleteBookingDialog({
  booking,
  open,
  onOpenChange,
  onDeleted,
}: DeleteBookingDialogProps) {
  const [loading, setLoading] = useState(false);

  async function deleteBooking() {
    if (!booking) return;

    setLoading(true);

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", booking.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onDeleted();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">

        <DialogHeader>
          <DialogTitle>
            Delete Booking
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this booking?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2 pt-4">

          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={loading}
            onClick={deleteBooking}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}