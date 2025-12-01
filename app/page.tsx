
import ProizvodiBannerClient from "./@banner/ProizvodiBannerClient";
import ProizvodiGridHomeClient from "./@grid/ProizvodiGridHomeClient";
import { getProizvodi } from "@/lib/actions/proizvodi";

export default async function Home() {
  const res = await getProizvodi(1, 10);
  const initialProizvodi = res.success && res.data ? res.data.proizvodi : [];
  return (
    <>
      <ProizvodiBannerClient initialProizvodi={initialProizvodi} />
      <ProizvodiGridHomeClient initialProizvodi={initialProizvodi} />
    </>
  );
}
