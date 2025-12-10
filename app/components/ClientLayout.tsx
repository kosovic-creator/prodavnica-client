"use client";
import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { CartProvider } from "./CartContext";



export default function ClientLayout({ children, lang}: {
  children: React.ReactNode;
  lang: string;
  isLoggedIn?: boolean;
  korisnikIme?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <CartProvider>
      <Navbar
        setSidebarOpen={setSidebarOpen}
        lang={lang}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} lang={lang} />
      <main style={{ marginLeft: sidebarOpen ? 256 : 0, transition: 'margin-left 0.3s' }}>{children}</main>
      <Footer />
    </CartProvider>
  );
}
