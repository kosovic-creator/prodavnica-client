"use client";
import React from "react";


export default function SuccessMessage({ message }: { message: string }) {
  const [show, setShow] = React.useState(true);
  React.useEffect(() => {
    if (!message) return;
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!show || !message) return null;
  return (
    <div className="text-green-600 bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-4">
      {message}
    </div>
  );
}
