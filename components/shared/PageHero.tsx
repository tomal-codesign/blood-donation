// components/shared/PageHero.tsx
import { type LucideIcon } from 'lucide-react';

interface PageHeroProps {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'emergency';
  size?: 'default' | 'compact';
  children?: React.ReactNode;
}

export default function PageHero({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  icon: Icon,
  variant = 'default',
  size = 'default',
  children,
}: PageHeroProps) {
  const isEmergency = variant === 'emergency';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Mesh gradient blobs */}
      <div
        className="absolute -top-24 -left-16 w-96 h-96 bg-gradient-to-br from-red-400 to-pink-400 opacity-30 blur-3xl animate-blob"
        style={{ ['--float-rotate' as string]: '0deg' }}
      />
      <div
        className="absolute -bottom-24 -right-16 w-96 h-96 bg-gradient-to-br from-orange-300 to-amber-300 opacity-30 blur-3xl animate-blob"
        style={{ animationDelay: '3s' }}
      />
      <div
        className={`absolute top-1/3 right-1/4 w-64 h-64 opacity-20 blur-3xl animate-blob ${
          isEmergency ? 'bg-red-500' : 'bg-purple-400'
        }`}
        style={{ animationDelay: '6s' }}
      />

      <div
        className={`relative max-w-4xl mx-auto px-6 text-center ${
          size === 'compact' ? 'py-16 md:py-20' : 'py-20 md:py-28'
        }`}
      >
        {eyebrow && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm px-4 py-1.5 text-xs font-semibold mb-6 shadow-sm ${
              isEmergency
                ? 'border-red-200 bg-white/80 text-red-700'
                : 'border-white/60 bg-white/70 text-red-600'
            }`}
          >
            {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5" />}
            {eyebrow}
          </div>
        )}

        {Icon && (
          <div className="flex justify-center mb-6">
            <div
              className={`inline-flex p-4 rounded-2xl shadow-xl ${
                isEmergency
                  ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/30'
                  : 'bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/30'
              }`}
            >
              <Icon className={`h-8 w-8 text-white ${isEmergency ? 'animate-pulse' : ''}`} />
            </div>
          </div>
        )}

        <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-[1.1] tracking-tight text-gray-900">
          {title}
        </h1>

        {description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">{description}</p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
