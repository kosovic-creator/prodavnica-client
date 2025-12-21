import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  lozinka: z.string().min(6),
});

interface CustomUser {
  id: string;
  email: string;
  uloga?: string;
  ime?: string;
  prezime?: string;
}

interface CustomToken {
  id?: string;
  email?: string;
  uloga?: string;
  ime?: string;
  prezime?: string;
  //dodavamo polje avatar za kompatibilnost sa OAuth provider-ima
  avatar: "url",
  [key: string]: unknown;
}

interface CustomSessionUser {
  id?: string;
  email?: string;
  uloga?: string;
  ime?: string;
  prezime?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email i Lozinka",
      credentials: {
        email: { label: "Email", type: "text" },
        lozinka: { label: "Lozinka", type: "password" },
      },
      // authorize funkcija se poziva kada korisnik pokuša da se prijavi sa email i lozinkom
      // Prima credentials objekat koji sadrži email i lozinka polja iz forme
      // Vraća user objekat ako je autentifikacija uspješna, ili null ako nije
      async authorize(credentials) {

        // KORAK 1: VALIDACIJA INPUTA
        // Validiramo credentials koristeći Zod schema (backend validacija - kritična za sigurnost!)
        // safeParse ne baca greške već vraća objekat sa success: true/false
        const result = loginSchema.safeParse(credentials);
        if (!result.success) {
          // Ako validacija ne uspe (npr. email nije validan ili lozinka je prekratka)
          // Vraćamo null što signalizira NextAuth-u da autentifikacija nije uspela
          return null;
        }

        // Ako je validacija uspešna, destrukturiramo email i lozinku iz validiranih podataka
        const { email, lozinka } = result.data;

        // KORAK 2: PROVERA POSTOJANJA KORISNIKA U BAZI
        // Tražimo korisnika u bazi podataka prema email adresi
        const korisnik = await prisma.korisnik.findUnique({
          where: { email },
        });

        // Ako korisnik ne postoji u bazi ili nema lozinku (OAuth korisnici nemaju lozinku)
        if (!korisnik || !korisnik.lozinka) {
          // Vraćamo null - autentifikacija neuspešna
          return null;
        }

        // KORAK 3: VERIFIKACIJA LOZINKE
        // Poređimo lozinku koju je korisnik uneo sa heširanom lozinkom iz baze
        // bcrypt.compare automatski primenjuje isti salt i hashing algoritam
        const valid = await bcrypt.compare(lozinka, korisnik.lozinka);

        // Ako lozinka nije validna
        if (!valid) {
          // Vraćamo null - autentifikacija neuspešna
          return null;
        }

        // KORAK 4: USPEŠNA AUTENTIFIKACIJA
        // Ako smo došli do ovde, korisnik postoji i lozinka je tačna

        // Vraćamo user objekat sa podacima koje želimo da čuvamo u sesiji
        // Ovi podaci će biti dostupni kroz JWT token i session objekat
        return {
          id: korisnik.id,
          email: korisnik.email,
          uloga: korisnik.uloga,
          ime: korisnik.ime,
          prezime: korisnik.prezime,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Za OAuth provider-e (Google)
      if (account?.provider === "google") {
        try {
          // Proveravamo da li korisnik već postoji u bazi
          const postojeciKorisnik = await prisma.korisnik.findUnique({
            where: { email: user.email! },
          });

          // Ako ne postoji, kreiramo novog korisnika sa minimalnim podacima
          if (!postojeciKorisnik) {
            await prisma.korisnik.create({
              data: {
                email: user.email!,
                ime: user.name || "",
                prezime: "", // default value
                uloga: "korisnik",
                lozinka: "", // OAuth users may not have a password

              },
            });
          } else {
            // Ažuriramo postojećeg korisnika sa novim podacima
            await prisma.korisnik.update({
              where: { email: user.email! },
              data: {
                ime: user.name || postojeciKorisnik.ime,
              },
            });
          }
        } catch (error) {
          console.error("Greška pri čuvanju OAuth korisnika:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // jwt callback se poziva svaki put kada se kreira ili ažurira JWT token
      // 'user' objekat je dostupan SAMO pri prvoj prijavi, kasnije je undefined
      if (user) {
        // SCENARIO 1: CREDENTIALS PROVIDER (Email + Lozinka)
        // Kada korisnik unese email i lozinku u formu
        if (account?.provider === "credentials") {
          const u = user as CustomUser;
          // authorize funkcija je već vratila kompletan user objekat iz NAŠE baze
          // sa svim custom poljima (id, email, uloga, ime, prezime)
          // Tako da samo prenosimo te podatke u JWT token
          (token as CustomToken).id = u.id;
          (token as CustomToken).email = u.email;
          (token as CustomToken).uloga = u.uloga;
          (token as CustomToken).ime = u.ime;
          (token as CustomToken).prezime = u.prezime;

          // ...existing code...
        } else {
          // SCENARIO 2: OAUTH PROVIDER (Google)
          // Kada korisnik koristi "Sign in with Google"
          // Google vraća user objekat koji sadrži SAMO email i ime (Google API podaci)
          // Google NE ZNA o našim custom poljima (uloga, prezime, id iz naše baze)
          // Zato moramo ponovo ići u NAŠU bazu da preuzmemo sve podatke
          const korisnikIzBaze = await prisma.korisnik.findUnique({
            where: { email: user.email! },
          });
          if (korisnikIzBaze) {
            // Sada imamo kompletan korisnik objekat iz naše baze sa svim custom poljima
            (token as CustomToken).id = korisnikIzBaze.id;
            (token as CustomToken).uloga = korisnikIzBaze.uloga;
            (token as CustomToken).ime = korisnikIzBaze.ime || undefined;
            (token as CustomToken).prezime = korisnikIzBaze.prezime || undefined;
          }
        }
      }
      // Vraćamo token koji će biti enkodovan i poslat klijentu kao JWT
      return token;
    },
    async session({ session, token }) {
      // Dodajemo polje uloga iz tokena u session.user
      if (token && session.user) {
        (session.user as CustomSessionUser).uloga = (token as CustomToken).uloga;
        (session.user as CustomSessionUser).ime = (token as CustomToken).ime;
        (session.user as CustomSessionUser).prezime = (token as CustomToken).prezime;
        (session.user as CustomSessionUser).id = (token as CustomToken).id;
        (session.user as CustomSessionUser).email = (token as CustomToken).email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/prijava",
    error: "/auth/prijava",
  },
};
