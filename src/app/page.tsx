import { supabase } from "@/lib/supabase";

export default async function Home() {

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*");

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*");

  const revenue =
    bookings?.reduce(
      (sum, booking) =>
        sum + Number(booking.total_amount || 0),
      0
    ) || 0;

  const totalExpenses =
    expenses?.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    ) || 0;

  const profit =
    revenue - totalExpenses;

  return (
    <main className="min-h-screen p-8">

      <h1 className="text-4xl font-bold mb-8">
        Nest & Nook PMS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">
            Revenue
          </h2>

          <p className="text-3xl mt-2">
            ₹{revenue}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">
            Bookings
          </h2>

          <p className="text-3xl mt-2">
            {bookings?.length || 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">
            Expenses
          </h2>

          <p className="text-3xl mt-2">
            ₹{totalExpenses}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">
            Profit
          </h2>

          <p className="text-3xl mt-2">
            ₹{profit}
          </p>
        </div>

      </div>

    </main>
  );
}