import ClientLayout from '../components/ClientLayout';

export default function KontaktLayout({ children, searchParams }: { children: React.ReactNode, searchParams?: { lang?: string } }) {
  const lang = searchParams?.lang === 'en' ? 'en' : 'sr';
  return <ClientLayout lang={lang}>{children}</ClientLayout>;
}
