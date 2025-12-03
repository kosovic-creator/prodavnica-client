import { Suspense } from "react";
import RegistracijaClient from "./RegistracijaClient";

export default function Page() {
  return (
    <Suspense>
      <RegistracijaClient />
    </Suspense>
  );
}