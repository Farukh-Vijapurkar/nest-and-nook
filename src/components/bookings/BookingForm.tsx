"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BookingFormProps {
  guestName: string;
  setGuestName: (v: string) => void;

  phone: string;
  setPhone: (v: string) => void;

  email: string;
  setEmail: (v: string) => void;

  notes: string;
  setNotes: (v: string) => void;

  idType: string;
  setIdType: (v: string) => void;

  idNumber: string;
  setIdNumber: (v: string) => void;

  amount: string;
  setAmount: (v: string) => void;

  checkIn: string;
  setCheckIn: (v: string) => void;

  checkOut: string;
  setCheckOut: (v: string) => void;

  guestCount: number;
  setGuestCount: (v: number) => void;

  additionalGuests: string[];
  setAdditionalGuests: (v: string[]) => void;

  documentFiles: File[];
  setDocumentFiles: (v: File[]) => void;

  dateConflict: boolean;
  invalidDateRange: boolean;

  checkAvailability: (
    startDate: string,
    endDate: string
  ) => Promise<void>;

  submitLabel: string;

  onSubmit: () => void;
}

export default function BookingForm({
  guestName,
  setGuestName,

  phone,
  setPhone,

  email,
  setEmail,

  notes,
  setNotes,

  idType,
  setIdType,

  idNumber,
  setIdNumber,

  amount,
  setAmount,

  checkIn,
  setCheckIn,

  checkOut,
  setCheckOut,

  guestCount,
  setGuestCount,

  additionalGuests,
  setAdditionalGuests,

  documentFiles,
  setDocumentFiles,

  dateConflict,
  invalidDateRange,

  checkAvailability,

  submitLabel,

  onSubmit,
}: BookingFormProps) {
  useEffect(() => {
  if (checkIn && checkOut) {
    void checkAvailability(checkIn, checkOut);
  }
}, [checkIn, checkOut, checkAvailability]);

  return (
    <div className="grid gap-5">

      <h3 className="text-lg font-semibold border-b pb-2">
        Guest Information
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <Input
          required
          placeholder="Guest Name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />

        <Input
          required
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          required
          placeholder="ID Type"
          value={idType}
          onChange={(e) => setIdType(e.target.value)}
        />

        <Input
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
        />

        <div>
          <label className="block mb-2 text-sm font-medium">
            Number of Guests
          </label>

          <Input
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => {
                const value = Math.max(1, Number(e.target.value));
                setGuestCount(value);
                if (additionalGuests.length > value - 1) {
                  setAdditionalGuests(additionalGuests.slice(0, value - 1));
                }               
              }
            }
          />
        </div>

      </div>

      {guestCount > 1 && (
        <div>

          <label className="block mb-2 font-medium">
            Additional Guests
          </label>

          {Array.from({ length: guestCount - 1 }).map((_, index) => (
            <Input
              key={index}
              className="mb-2"
              placeholder={`Guest ${index + 2} Name`}
              value={additionalGuests[index] || ""}
              onChange={(e) => {
                const updated = [...additionalGuests];
                updated[index] = e.target.value;
                setAdditionalGuests(updated);
              }}
            />
          ))}

        </div>
      )}

      <Textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <h3 className="text-lg font-semibold border-b pb-2">
        Documents
      </h3>

      <Input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) =>
          setDocumentFiles(Array.from(e.target.files || []))
        }
      />

      {documentFiles.length > 0 && (
        <div className="rounded-lg border p-4 bg-muted/40">

          <p className="font-medium mb-2">
            Selected Documents
          </p>

          <div className="space-y-2">

            {documentFiles.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span>{file.name}</span>

                <span className="text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}

          </div>

        </div>
      )}
            <h3 className="text-lg font-semibold border-b pb-2 mt-2">
        Booking Information
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <Input
             type="number"
             min={0}
             placeholder="Booking Amount"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
        />

        <div />

        <div>
          <label className="block mb-2 text-sm font-medium">
            Check In Date
          </label>

          <Input
            type="date"
            value={checkIn}
            onChange={(e) => {
              const value = e.target.value;
              setCheckIn(value);
              checkAvailability(value, checkOut);
            }}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Check Out Date
          </label>

          <Input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => {
              const value = e.target.value;
              setCheckOut(value);
              checkAvailability(checkIn, value);
            }}
          />
        </div>

      </div>

      {checkIn && checkOut && (
        <div className="mt-2">

          {invalidDateRange ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
              ❌ Check-out date cannot be before check-in date.
            </div>
          ) : dateConflict ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
              ❌ Property is already booked for the selected dates.
            </div>
          ) : (
            <div className="rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
              ✅ Dates Available
            </div>
          )}

        </div>
      )}

      {checkIn &&
        checkOut &&
        !invalidDateRange && (() => {

          const start = new Date(checkIn);
          const end = new Date(checkOut);

          const nights = Math.max(
            1,
            Math.ceil(
              (end.getTime() - start.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );

          const total = Number(amount || 0);

          const perNight =
            nights > 0 ? total / nights : total;

          return (
            <div className="rounded-xl border bg-muted/40 p-4 mt-4">

              <h4 className="font-semibold mb-3">
                Booking Summary
              </h4>

              <div className="grid grid-cols-2 gap-3 text-sm">

                <div>
                  <p className="text-muted-foreground">
                    Nights
                  </p>
                  <p className="font-semibold">
                    {nights}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Guests
                  </p>
                  <p className="font-semibold">
                    {guestCount}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="font-semibold">
                    ₹{total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Per Night
                  </p>
                  <p className="font-semibold">
                    ₹{perNight.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Check In
                    </p>

                    <p className="font-semibold">
                    {checkIn}
                    </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Check Out
                  </p>  

                    <p className="font-semibold">
                      {checkOut}
                    </p>
                </div>

              </div>

            </div>
          );
        })()}

      <Button
        className="w-full mt-5"
        disabled={
            dateConflict || 
            invalidDateRange ||
            !guestName.trim() ||
            !checkIn ||
            !checkOut ||
            !amount
        }
        onClick={onSubmit}
      >
        {invalidDateRange
          ? "Invalid Dates"
          : dateConflict
          ? "Dates Unavailable"
          : submitLabel}
      </Button>

    </div>
  );
}
