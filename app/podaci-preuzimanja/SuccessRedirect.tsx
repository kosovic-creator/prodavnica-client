"use client";
import React from "react";

export default function SuccessRedirect({ message }: { message: string }) {
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.href = "/";
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center">
      {message}
    </div>
  );
}