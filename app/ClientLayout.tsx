"use client";
import React from "react";
import "../i18nnnnn/config";
import Navbar from "./components/Navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
