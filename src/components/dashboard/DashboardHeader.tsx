export default function DashboardHeader() {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hour = today.getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="text-xl text-gray-600 mt-2">
          {greeting}, Welcome to Nest & Nook!
        </p>

        <p className="text-gray-500 mt-1">
          {formattedDate}
        </p>
      </div>

      <div className="mt-6 md:mt-0">
        <div className="rounded-3xl bg-white shadow-sm border px-6 py-4">
          <p className="text-sm text-gray-500">
            Property
          </p>

          <h2 className="font-bold text-xl">
            Nest & Nook
          </h2>

          <div className="flex items-center mt-3 gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>

            <span className="text-sm font-medium">
              System Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}