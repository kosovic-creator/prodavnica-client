import { NextRequest, NextResponse } from "next/server";
import { getKorpa } from "@/lib/actions/korpa";

//Koristi se za dobijanje broja artikala u korpi za određenog korisnika ali pošto se poziva i klient side mora biti api
// koji poziva getKorpa funkciju iz actions/korpa
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  let brojUKorpi = 0;
  if (userId) {
    const korpa = await getKorpa(userId);
    if (korpa.success && korpa.data?.stavke) {
      brojUKorpi = korpa.data.stavke.reduce((sum, s) => sum + (s.kolicina || 1), 0);
    }
  }
  return NextResponse.json({ brojUKorpi });
}
