'use client';
import { SessionProvider, useSession } from "next-auth/react";
import '../../i18n/config';
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";





function ClentNavbarWithSession({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
  useSession(); // If you need session info for side effects, keep this line; otherwise, you can remove it.
  return <Navbar setSidebarOpen={setSidebarOpen} />;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <SessionProvider>
      <ClentNavbarWithSession setSidebarOpen={setSidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {children}

    </SessionProvider>
  );
}
