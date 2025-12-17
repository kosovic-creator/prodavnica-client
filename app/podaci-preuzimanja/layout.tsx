import ClientLayout from '../components/ClientLayout';

export default function PodaciPreuzimanjaLayout({ children }: { children: React.ReactNode }) {
  // Možeš dodati dodatne props ako treba
  return (
    <ClientLayout lang="sr">
      {children}
    </ClientLayout>
  );
}
