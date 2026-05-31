"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "@/lib/supabase";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);

  async function loadBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        guests (
          full_name
        )
      `);

    if (error) {
      console.error(error);
      return;
    }

    const calendarEvents =
      data?.map((booking: any) => ({
        title:
          booking.guests?.full_name ||
          "Guest",

        start: booking.check_in,

        end: booking.check_out,
      })) || [];

    setEvents(calendarEvents);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Booking Calendar
      </h1>

      <FullCalendar
        plugins={[
          dayGridPlugin,
          interactionPlugin,
        ]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />
    </div>
  );
}