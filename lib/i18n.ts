import path from 'path';
import fs from 'fs';

/**
 * Učitaj prevode za dati jezik i namespace (npr. "proizvodi", "profil", ...)
 * @param lang Jezik (npr. "sr", "en")
 * @param namespace Naziv json fajla bez ekstenzije (npr. "proizvodi")
 */
export function getLocaleMessages(lang: string, namespace: string) {
  const filePath = path.join(process.cwd(), 'i18n/locales', lang, `${namespace}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}