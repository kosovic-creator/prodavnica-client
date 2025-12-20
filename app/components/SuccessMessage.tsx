'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  redirectTo?: string;
  redirectDelay?: number;
}

export default function SuccessMessage({
  message,
  onClose,
  redirectTo = '/proizvodi',
  redirectDelay = 3000
}: SuccessMessageProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
      router.push(redirectTo);
    }, redirectDelay);

    return () => clearTimeout(timer);
  }, [router, redirectTo, redirectDelay, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <FaCheckCircle className="text-green-500 text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Uspešno!</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500">
            Biće te preusmeren/a za {redirectDelay / 1000} sekundi...
          </p>
        </div>
      </div>
    </div>
  );
}