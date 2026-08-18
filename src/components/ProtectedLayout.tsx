"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen">

        <Sidebar />

        {/* Main Application Area */}
        <main
          className="
            min-h-screen
            lg:ml-72
          "
        >
          {children}
        </main>

      </div>
    </AuthGuard>
  );
}