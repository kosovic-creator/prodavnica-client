'use client';

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

// Zod schema za validaciju
const prijavaSchema = z.object({
    email: z.string().email('Nevažeća email adresa'),
    lozinka: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
});

// definiše tipove za propse koje komponenta prima
interface PrijavaFormProps {
    lang: 'sr' | 'en';
    // definiše tipove za prevode koje komponenta prima
    prevod: {
        title: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        submit: string;
        loading: string;
        error: string;
        or: string;
        google: string;
        noAccount: string;
        registerHere: string;
        invalidEmail?: string;
        passwordTooShort?: string;
    };
    initialEmail?: string;
}
// glavna funkcionalna komponenta za prijavu korisnika prima propse lang i translations
export default function PrijavaForm({ lang, prevod: t, initialEmail = '' }: PrijavaFormProps) {
    // definiše state varijable za email, lozinku, greške i stanje učitavanja
    const [email, setEmail] = useState(initialEmail);
    const [lozinka, setLozinka] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; lozinka?: string }>({});
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Validacija pojedinačnog polja
    const validateField = (field: 'email' | 'lozinka', value: string) => {
        try {
            if (field === 'email') {
                prijavaSchema.shape.email.parse(value);
            } else {
                prijavaSchema.shape.lozinka.parse(value);
            }
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        } catch (err) {
            if (err instanceof z.ZodError) {
                // postavlja grešku za odgovarajuće polje u novo zod nema error nego isusesses
                setFieldErrors((prev) => ({ ...prev, [field]: err.issues[0].message }));
            }
        }
    };

    // funkcija koja se poziva prilikom slanja forme
    const handleSubmit = async (e: React.FormEvent) => {
        // sprečava podrazumevano ponašanje forme (pri slanju stranica se ne osvežava)
        e.preventDefault();
        setError('');

        // Validacija pre slanja potrebano jer moguće da korisnik nije "izgubio fokus" sa polja već samo pritisuo submit
        try {
            prijavaSchema.parse({ email, lozinka });
        } catch (err) {
            if (err instanceof z.ZodError) {
                const emailError = err.issues.find(issue => issue.path[0] === 'email');
                //issues je niz grešaka koje su se desile pri validaciji i novo nekad je bilo error
                const lozinkaError = err.issues.find(issue => issue.path[0] === 'lozinka');
                setFieldErrors({
                    email: emailError?.message,
                    lozinka: lozinkaError?.message
                });
                return;
            }
        }


        startTransition(async () => {
        // koristi NextAuth.js funkciju signIn za prijavu korisnika sa credential provider-om
            const signInResult = await signIn('credentials', {
                email,
                lozinka,
                redirect: false,
            });

            if (signInResult?.error) {
                setError(t.error);
            } else {
                // osvježava server podatke (session) i navigira na home stranicu
                router.refresh();
                router.push('/');
            }
        });
    };

    return (
        <div className="flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {t.title}
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder={t.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={(e) => validateField('email', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                {t.passwordPlaceholder}
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder={t.passwordPlaceholder}
                                value={lozinka}
                                onChange={(e) => setLozinka(e.target.value)}
                                onBlur={(e) => validateField('lozinka', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${fieldErrors.lozinka ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {fieldErrors.lozinka && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.lozinka}</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            // kada je forma u procesu slanja (isPending je true), dugme je onemogućeno
                            disabled={isPending}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? t.loading : t.submit}
                            {/* prikazuje loading lokalizovani tekst dok je forma u procesu slanja */}
                        </button>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">{t.or}</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <button
                            type="button"
                            // koristi NextAuth.js funkciju signIn za prijavu korisnika preko Google-a
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {t.google}
                        </button>
                    </form>

                    {/* Register Link - na dnu forme */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {t.noAccount}{' '}
                            <Link
                                // vodi na stranicu za registraciju sa odgovarajućim jezičkim parametrima
                                href={`/auth/registracija?lang=${lang}`}
                                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                            >
                                {t.registerHere}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
