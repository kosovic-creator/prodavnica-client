import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// Extend the session user type to include 'id'
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}
import { getKorpa } from '@/lib/actions/korpa';

// Compatible cart item type that matches Server Action response
interface KorpaStavka {
  id: string;
  kolicina: number;
  proizvod?: {
    id: string;
    naziv_sr: string;
    naziv_en: string;
    cena: number;
    slika?: string | null;
  } | null;
}

export interface KorpaContextType {
  stavke: KorpaStavka[];
  setStavke: React.Dispatch<React.SetStateAction<KorpaStavka[]>>;
  resetKorpa: () => void;
  brojStavki: number;
  setBrojStavki: (broj: number) => void;
  refreshKorpa: () => Promise<void>;
  loading: boolean;
}

const KorpaContext = createContext<KorpaContextType>({
  stavke: [],
  setStavke: () => { },
  resetKorpa: () => { },
  brojStavki: 0,
  setBrojStavki: () => { },
  refreshKorpa: async () => { },
  loading: false,
});

export const useKorpa = () => {
  const context = useContext(KorpaContext);
  if (!context) {
    throw new Error("useKorpa must be used within a KorpaProvider");
  }
  return context;
};

export const KorpaProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [stavke, setStavke] = useState<KorpaStavka[]>([]);
  const [brojStavki, setBrojStavki] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchKorpa = useCallback(async () => {
    if (!session?.user?.id) {
      setStavke([]);
      setBrojStavki(0);
      return;
    }

    setLoading(true);
    try {
      const result = await getKorpa(session.user.id);

      if (result.success && result.data) {
        const stavkeData = result.data.stavke || [];
        setStavke(stavkeData);

        // Calculate total items count
        const totalItems = stavkeData.reduce((acc, stavka) => acc + stavka.kolicina, 0);
        setBrojStavki(totalItems);

        // Update localStorage for persistence across page reloads
        localStorage.setItem('brojUKorpi', totalItems.toString());
      } else {
        console.error('Failed to fetch korpa:', result.error);
        setStavke([]);
        setBrojStavki(0);
      }
    } catch (error) {
      console.error('Error fetching korpa:', error);
      setStavke([]);
      setBrojStavki(0);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const resetKorpa = useCallback(() => {
    setStavke([]);
    setBrojStavki(0);
    localStorage.setItem('brojUKorpi', '0');
    window.dispatchEvent(new Event('korpaChanged'));
    console.log('resetKorpa called');
  }, []);

  // Initialize cart data on session change
  useEffect(() => {
    if (session?.user?.id) {
      fetchKorpa();
    } else {
      // Clear cart when user logs out
      setStavke([]);
      setBrojStavki(0);
      localStorage.setItem('brojUKorpi', '0');
    }
  }, [session?.user?.id, fetchKorpa]);

  // Listen for cart changes from other components
  useEffect(() => {
    const handleKorpaChange = () => {
      if (session?.user?.id) {
        fetchKorpa();
      }
    };

    window.addEventListener("korpaChanged", handleKorpaChange);
    return () => window.removeEventListener("korpaChanged", handleKorpaChange);
  }, [session?.user?.id, fetchKorpa]);

  // Load initial count from localStorage on mount
  useEffect(() => {
    const savedCount = localStorage.getItem('brojUKorpi');
    if (savedCount) {
      setBrojStavki(parseInt(savedCount, 10) || 0);
    }
  }, []);

  return (
    <KorpaContext.Provider
      value={{
        stavke,
        setStavke,
        resetKorpa,
        brojStavki,
        setBrojStavki,
        refreshKorpa: fetchKorpa,
        loading
      }}
    >
      {children}
    </KorpaContext.Provider>
  );
};