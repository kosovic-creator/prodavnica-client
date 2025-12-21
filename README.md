"use client";  // ← Klijentska komponenta
import { useActionState } from "react";
import { registerAction } from "@/actions/register";  // ← IMPORT OBAVEZAN!

export default function Form() {
  const [state, formAction] = useActionState(registerAction, {});

  return <form action={formAction}>...</form>;  // ← Poziv preko hook-a
}



