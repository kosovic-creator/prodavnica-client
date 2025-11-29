-- CreateTable
CREATE TABLE "PodaciPreuzimanja" (
    "id" TEXT NOT NULL,
    "korisnikId" TEXT NOT NULL,
    "adresa" TEXT NOT NULL,
    "drzava" TEXT NOT NULL,
    "grad" TEXT NOT NULL,
    "postanskiBroj" INTEGER NOT NULL,
    "telefon" TEXT NOT NULL,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodaciPreuzimanja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StavkaKorpe" (
    "id" TEXT NOT NULL,
    "korisnikId" TEXT NOT NULL,
    "proizvodId" TEXT NOT NULL,
    "kolicina" INTEGER NOT NULL DEFAULT 1,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StavkaKorpe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Porudzbina" (
    "id" TEXT NOT NULL,
    "korisnikId" TEXT NOT NULL,
    "ukupno" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "email" TEXT,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,
    "idPlacanja" TEXT,

    CONSTRAINT "Porudzbina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StavkaPorudzbine" (
    "id" TEXT NOT NULL,
    "porudzbinaId" TEXT NOT NULL,
    "proizvodId" TEXT NOT NULL,
    "kolicina" INTEGER NOT NULL,
    "cena" DOUBLE PRECISION NOT NULL,
    "opis" TEXT,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,
    "slika" TEXT,

    CONSTRAINT "StavkaPorudzbine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "omiljeni" (
    "id" TEXT NOT NULL,
    "korisnikId" TEXT NOT NULL,
    "proizvodId" TEXT NOT NULL,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "omiljeni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proizvod" (
    "id" TEXT NOT NULL,
    "cena" DOUBLE PRECISION NOT NULL,
    "slike" TEXT[],
    "kolicina" INTEGER NOT NULL DEFAULT 1,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,
    "naziv_sr" TEXT NOT NULL,
    "opis_sr" TEXT,
    "karakteristike_sr" TEXT,
    "kategorija_sr" TEXT NOT NULL,
    "naziv_en" TEXT NOT NULL,
    "opis_en" TEXT,
    "karakteristike_en" TEXT,
    "kategorija_en" TEXT NOT NULL,

    CONSTRAINT "Proizvod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PodaciPreuzimanja_korisnikId_key" ON "PodaciPreuzimanja"("korisnikId");

-- CreateIndex
CREATE INDEX "StavkaKorpe_korisnikId_idx" ON "StavkaKorpe"("korisnikId");

-- CreateIndex
CREATE UNIQUE INDEX "StavkaKorpe_korisnikId_proizvodId_key" ON "StavkaKorpe"("korisnikId", "proizvodId");

-- CreateIndex
CREATE UNIQUE INDEX "Porudzbina_idPlacanja_key" ON "Porudzbina"("idPlacanja");

-- CreateIndex
CREATE INDEX "Porudzbina_korisnikId_idx" ON "Porudzbina"("korisnikId");

-- CreateIndex
CREATE INDEX "StavkaPorudzbine_porudzbinaId_idx" ON "StavkaPorudzbine"("porudzbinaId");

-- CreateIndex
CREATE INDEX "omiljeni_korisnikId_idx" ON "omiljeni"("korisnikId");

-- CreateIndex
CREATE UNIQUE INDEX "omiljeni_korisnikId_proizvodId_key" ON "omiljeni"("korisnikId", "proizvodId");

-- AddForeignKey
ALTER TABLE "PodaciPreuzimanja" ADD CONSTRAINT "PodaciPreuzimanja_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StavkaKorpe" ADD CONSTRAINT "StavkaKorpe_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StavkaKorpe" ADD CONSTRAINT "StavkaKorpe_proizvodId_fkey" FOREIGN KEY ("proizvodId") REFERENCES "Proizvod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Porudzbina" ADD CONSTRAINT "Porudzbina_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StavkaPorudzbine" ADD CONSTRAINT "StavkaPorudzbine_porudzbinaId_fkey" FOREIGN KEY ("porudzbinaId") REFERENCES "Porudzbina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StavkaPorudzbine" ADD CONSTRAINT "StavkaPorudzbine_proizvodId_fkey" FOREIGN KEY ("proizvodId") REFERENCES "Proizvod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "omiljeni" ADD CONSTRAINT "omiljeni_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "omiljeni" ADD CONSTRAINT "omiljeni_proizvodId_fkey" FOREIGN KEY ("proizvodId") REFERENCES "Proizvod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
