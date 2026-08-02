// app/(auth)/layout.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Dot grid texture, faded toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, black 0%, transparent 100%)',
        }}
      />
      <div className="absolute -top-24 -left-16 w-96 h-96 bg-gradient-to-br from-red-400 to-pink-400 opacity-20 blur-3xl animate-blob" />
      <div className="absolute -bottom-24 -right-16 w-96 h-96 bg-gradient-to-br from-orange-300 to-amber-300 opacity-20 blur-3xl animate-blob" style={{ animationDelay: '3s' }} />

      <Link
        href="/"
        className="fixed top-5 left-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:text-gray-900 hover:shadow-md transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
