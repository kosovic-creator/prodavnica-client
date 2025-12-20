/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ocistiKorpu, getKorpa } from "@/lib/actions";
import { posaljiEmailObavjestenje } from "@/lib/actions/email";
import { getProizvodById, updateProizvodStanje } from "@/lib/actions/proizvodi";
import { useCart } from "../../components/CartContext";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MonriPaySuccessEffect() {
  const { data: session } = useSession();
  const { refreshKorpa } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const provider = searchParams.get("provider");
    const success = searchParams.get("Success");
    const amount = searchParams.get("amount");

    if (
      provider === "monripay" &&
      success === "true" &&
      session?.user?.id &&
      session?.user?.email &&
      amount &&
      !hasProcessed.current
    ) {
      hasProcessed.current = true;

      (async () => {
        const ukupno = parseFloat(amount);

        // Dohvati stavke iz korpe PRE brisanja
        const korpaResult = await getKorpa(String(session.user.id));
        let stavke: any[] = [];
        if (korpaResult.success && korpaResult.data) {
          stavke = korpaResult.data.stavke || [];
        }

        // Smanji stanje proizvoda za svaku stavku u korpi
        console.log("[MonriPaySuccess] Smanjivanje stanja proizvoda...");
        for (const item of stavke) {
          if (item.proizvod?.id && item.kolicina) {
            const proizvodRes = await getProizvodById(item.proizvod.id);
            if (proizvodRes.success && proizvodRes.data) {
              const novaKolicina = (proizvodRes.data.kolicina ?? 0) - item.kolicina;
              await updateProizvodStanje(item.proizvod.id, novaKolicina);
              console.log(`[MonriPaySuccess] Proizvod ${item.proizvod.id}: nova količina ${novaKolicina}`);
            }
          }
        }

        // Pošalji email sa iznosom i stavkama
        console.log(
          "[MonriPaySuccess] Slanje email obavještenja sa iznosom:",
          ukupno
        );

        // Email adminu o novoj porudžbini
        await posaljiEmailObavjestenje({
          email: session.user.email || "",
          ukupno,
          tip: "porudzbina",
          stavke: stavke
        });

        // Email korisniku - potvrda plaćanja
        await posaljiEmailObavjestenje({
          email: session.user.email || "",
          ukupno,
          tip: "placanje",
          stavke: stavke
        });

        // Isprazni korpu
        const result = await ocistiKorpu(String(session.user.id));

        if (result.success) {
          toast.success("Plaćanje uspešno! Korpa je ispražnjena.");
        } else {
          toast.error("Greška pri čišćenju korpe!");
        }

        await refreshKorpa();
        // Remove query params from URL after handling
        router.replace("/proizvodi", { scroll: false });
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, session?.user?.id, session?.user?.email]);

  return null;
}
