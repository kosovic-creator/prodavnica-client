'use client';

import React, { useTransition } from 'react';
import { createMonriPayCheckout } from '@/lib/actions';
import { toast } from 'react-hot-toast';

interface MonriPayButtonProps {
  amount: number;
}

const MonriPayButton: React.FC<MonriPayButtonProps> = ({ amount }) => {
  const [isPending, startTransition] = useTransition();
  const validAmount = typeof amount === 'number' && amount > 0 ? amount : 1;
  const isDisabled = !amount || amount <= 0 || isPending;

  const handleClick = async () => {
    if (isDisabled) {
      if (!amount || amount <= 0) {
        toast.error('Iznos za plaćanje nije validan.');
      }
      return;
    }

    startTransition(async () => {
      try {
        const result = await createMonriPayCheckout(validAmount);

        if (result.success && result.redirectUrl) {
          // MonriPay koristi redirect na njihov payment gateway
          window.location.href = result.redirectUrl;
        } else {
          toast.error(result.error || 'Greška pri kreiranju MonriPay sesije.');
        }
      } catch (error) {
        console.error('MonriPay error:', error);
        toast.error('Greška pri komunikaciji sa MonriPay servisom.');
      }
    });
  };

  return (
    <button
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
        isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
      }`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {isPending ? (
        <>
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          Priprema plaćanje...
        </>
      ) : (
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#fff" />
            <rect x="1" y="1" width="22" height="22" rx="3" fill="#1E40AF" />
            <circle cx="8" cy="8" r="2" fill="#fff" />
            <circle cx="16" cy="8" r="2" fill="#fff" />
            <path d="M6 16c2 2 6 2 8 0h4c0 2-2 4-8 4s-8-2-8-4h4z" fill="#fff" />
          </svg>
          MonriPay
        </div>
      )}
    </button>
  );
};

export default MonriPayButton;