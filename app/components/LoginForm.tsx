"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { korisnikSchemaStatic } from "../../zod";
import type { ZodIssue } from "zod";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; lozinka?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    // Zod validation for email and lozinka
    const loginSchema = korisnikSchemaStatic.pick({ email: true, lozinka: true });
    const result = loginSchema.safeParse({ email, lozinka });
    if (!result.success) {
      const errors: { email?: string; lozinka?: string } = {};
      result.error.issues.forEach((err: ZodIssue) => {
        if (err.path[0] === "email") errors.email = err.message;
        if (err.path[0] === "lozinka") errors.lozinka = err.message;
      });
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    const signInResult = await signIn("credentials", {
      email,
      lozinka,
      redirect: false,
      callbackUrl: "/"
    });
    setLoading(false);
    if (signInResult?.error) {
      setError("Pogrešan email ili lozinka.");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {fieldErrors.email && (
          <div className="text-red-600 text-xs mt-1">{fieldErrors.email}</div>
        )}
      </div>
      <div>
        <input
          type="password"
          name="lozinka"
          placeholder="Lozinka"
          value={lozinka}
          onChange={e => setLozinka(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {fieldErrors.lozinka && (
          <div className="text-red-600 text-xs mt-1">{fieldErrors.lozinka}</div>
        )}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Prijava..." : "Prijavi se"}
      </button>

      <div className="my-4 text-center text-gray-500">ili</div>
      <button
        type="button"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24"><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.93-6.93C36.36 2.34 30.55 0 24 0 14.64 0 6.27 5.7 2.13 14.02l8.06 6.27C12.7 13.16 17.89 9.5 24 9.5z" /><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.75H24v9.02h12.44c-.54 2.92-2.17 5.39-4.62 7.05l7.19 5.59C43.73 37.36 46.1 31.44 46.1 24.5z" /><path fill="#FBBC05" d="M10.19 28.29c-.47-1.41-.74-2.91-.74-4.54s.27-3.13.74-4.54l-8.06-6.27C.74 16.84 0 20.29 0 24c0 3.71.74 7.16 2.13 10.06l8.06 6.27z" /><path fill="#EA4335" d="M24 48c6.55 0 12.36-2.17 16.62-5.91l-7.19-5.59c-2.01 1.35-4.59 2.15-7.43 2.15-6.11 0-11.3-3.66-13.81-8.79l-8.06 6.27C6.27 42.3 14.64 48 24 48z" /></svg>
        Prijavi se putem Google-a
      </button>
    </form>
  );
}
