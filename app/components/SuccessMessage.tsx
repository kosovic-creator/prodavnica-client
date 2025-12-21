"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface SuccessMessageProps {
  message: string;
  redirectTo?: string;
  redirectDelay?: number;
}

export default function SuccessMessage({
  message,
  redirectTo,
  redirectDelay = 3000
}: SuccessMessageProps) {
  const [show, setShow] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    if (!message) return;
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
    }, redirectDelay);

    return () => clearTimeout(timer);
  }, [message, redirectTo, redirectDelay, router]);

  if (!show || !message) return null;
  return (
    <div className="text-green-600 bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-4">
      {message}
    </div>
  );
}
