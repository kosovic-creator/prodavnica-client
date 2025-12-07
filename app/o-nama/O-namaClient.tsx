"use client";
import { useTranslation } from 'react-i18next';

export default function OnamaClient() {
  const { t } = useTranslation('o_nama');
  return <div>{t('tekst') || 'O nama'}</div>;
}
