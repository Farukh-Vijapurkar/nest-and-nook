export interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  guest_id?: string;
}

export interface Expense {
  id: string;
  date?: string;
  created_at?: string;
  amount: number;
  category?: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getNightCount(checkIn: Date, checkOut: Date) {
  const diff =
    checkOut.getTime() - checkIn.getTime();

  return Math.max(
    Math.ceil(diff / (1000 * 60 * 60 * 24)),
    1
  );
}

export function calculateDailyRevenue(
  bookings: Booking[]
): DailyRevenue[] {

  const revenueMap = new Map<string, number>();

  bookings.forEach((booking) => {

    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);

    const nights = getNightCount(checkIn, checkOut);

    const dailyRevenue =
      Number(booking.total_amount || 0) / nights;

    const current = new Date(checkIn);

    while (current < checkOut) {

      const key = formatDate(current);

      revenueMap.set(
        key,
        (revenueMap.get(key) || 0) + dailyRevenue
      );

      current.setDate(current.getDate() + 1);

    }

  });

  return Array.from(revenueMap.entries())
    .map(([date, revenue]) => ({
      date,
      revenue: Number(revenue.toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateRevenue(
  bookings: Booking[],
  fromDate?: string,
  toDate?: string
) {

  const dailyRevenue =
    calculateDailyRevenue(bookings);

  return dailyRevenue
    .filter((day) => {

      if (fromDate && day.date < fromDate)
        return false;

      if (toDate && day.date > toDate)
        return false;

      return true;

    })
    .reduce(
      (sum, day) => sum + day.revenue,
      0
    );

}

export function calculateExpenses(
  expenses: Expense[],
  fromDate?: string,
  toDate?: string
) {

  return expenses
    .filter((expense) => {

      const date =
        expense.date ||
        expense.created_at?.split("T")[0];

      if (!date) return false;

      if (fromDate && date < fromDate)
        return false;

      if (toDate && date > toDate)
        return false;

      return true;

    })
    .reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

}

export function calculateProfit(
  revenue: number,
  expenses: number
) {
  return revenue - expenses;
}

export function calculateBookingCount(
  bookings: Booking[],
  fromDate?: string,
  toDate?: string
) {

  return bookings.filter((booking) => {

    if (fromDate && booking.check_in < fromDate)
      return false;

    if (toDate && booking.check_in > toDate)
      return false;

    return true;

  }).length;

}

export function calculateAverageDailyRevenue(
  bookings: Booking[],
  fromDate?: string,
  toDate?: string
) {

  const daily =
    calculateDailyRevenue(bookings)
      .filter((day) => {

        if (fromDate && day.date < fromDate)
          return false;

        if (toDate && day.date > toDate)
          return false;

        return true;

      });

  if (!daily.length)
    return 0;

  const total =
    daily.reduce(
      (sum, day) => sum + day.revenue,
      0
    );

  return total / daily.length;

}