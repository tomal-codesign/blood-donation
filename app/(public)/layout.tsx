// app/(public)/layout.tsx
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}