"use client";
import { useTranslation } from 'react-i18next';

export default function KontaktClient() {
  const { t } = useTranslation('kontakt');
  return <div>{t('tekst') || 'Kontakt'}</div>;
}
