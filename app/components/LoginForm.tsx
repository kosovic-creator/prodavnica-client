"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      lozinka,
      redirect: false,
      callbackUrl: "/"
    });
    setLoading(false);
    if (result?.error) {
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
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          type="password"
          name="lozinka"
          placeholder="Lozinka"
          value={lozinka}
          onChange={e => setLozinka(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Prijava..." : "Prijavi se"}
      </button>
    </form>
  );
}
