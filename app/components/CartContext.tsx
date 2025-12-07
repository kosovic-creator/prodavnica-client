"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface CartContextType {
  brojUKorpi: number;
  refreshKorpa: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  brojUKorpi: 0,
  refreshKorpa: async () => {},
});

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [brojUKorpi, setBrojUKorpi] = useState(0);

  const fetchKorpa = async () => {
    if (!session?.user?.id) {
      setBrojUKorpi(0);
      return;
    }
    try {
      const res = await fetch(`/api/korpa/broj?userId=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBrojUKorpi(data.brojUKorpi || 0);
      }
    } catch (e) {
      setBrojUKorpi(0);
    }
  };

  useEffect(() => {
    fetchKorpa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  return (
    <CartContext.Provider value={{ brojUKorpi, refreshKorpa: fetchKorpa }}>
      {children}
    </CartContext.Provider>
  );
}
