'use client';
import { SessionProvider } from "next-auth/react";
import '../../i18n/config';
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";




export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <SessionProvider>
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`transition-all ${sidebarOpen ? 'md:pl-64' : ''}`}>
        {children}
      </div>
    </SessionProvider>
  );
}
