import ClientLayout from '../components/ClientLayout';


export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout lang="sr">
      {children}
    </ClientLayout>
  );
}