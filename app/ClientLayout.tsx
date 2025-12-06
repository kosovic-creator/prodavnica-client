"use client";
import React from "react";
import "../i18nnnnn/config";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <>
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main style={{ marginLeft: sidebarOpen ? 256 : 0, transition: 'margin-left 0.3s' }}>{children}</main>
    </>
  );
}
