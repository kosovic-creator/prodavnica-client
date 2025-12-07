"use client";
import React from "react";
import "../i18n/config";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";


export default function ClientLayout({ children, lang, korisnikIme, isLoggedIn, brojUKorpi }: {
  children: React.ReactNode;
  lang: string;
  korisnikIme?: string;
  isLoggedIn?: boolean;
  brojUKorpi?: number;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <>
      <Navbar
        setSidebarOpen={setSidebarOpen}
        lang={lang}
        korisnikIme={korisnikIme}
        isLoggedIn={isLoggedIn}
        brojUKorpi={brojUKorpi}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main style={{ marginLeft: sidebarOpen ? 256 : 0, transition: 'margin-left 0.3s' }}>{children}</main>
      <Footer />
    </>
  );
}
