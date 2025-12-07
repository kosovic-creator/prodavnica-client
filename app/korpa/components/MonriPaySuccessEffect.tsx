"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { clearCartAndSendEmail } from "@/lib/utils/clearCartAndSendEmail";
import { useCart } from "../../components/CartContext";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MonriPaySuccessEffect() {
  const { data: session } = useSession();
  const { refreshKorpa } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const provider = searchParams.get("provider");
    const success = searchParams.get("Success");
    if (provider === "monripay" && success === "true" && session?.user?.id && session?.user?.email) {
      (async () => {
        const result = await clearCartAndSendEmail(String(session.user.id), String(session.user.email));
        if (result.success && result.emailSent) {
          toast.success("Korpa je ispražnjena i email je poslat!");
        } else {
          toast.error("Greška pri čišćenju korpe ili slanju emaila!");
        }
        await refreshKorpa();
        // Remove query params from URL after handling
        router.replace("/korpa", { scroll: false });
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, session?.user?.id, session?.user?.email]);

  return null;
}
