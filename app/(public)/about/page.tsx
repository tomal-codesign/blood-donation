// app/(public)/about/page.tsx
'use client';

import {
  Heart,
  Droplet,
  Users,
  Award,
  Target,
  Shield,
  Clock,
  Globe,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PageHero from '@/components/shared/PageHero';

// ── Edit page copy below ──────────────────────────────────────────────
const STATS = [
  { icon: Users, value: '10,000+', label: 'Active Donors', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
  { icon: Heart, value: '5,000+', label: 'Lives Saved', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
  { icon: Droplet, value: '50+', label: 'Blood Banks', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
  { icon: Award, value: '99%', label: 'Success Rate', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
];

const FEATURES = [
  {
    icon: Target,
    title: 'AI-Powered Matching',
    description: 'Smart algorithm finds the most suitable donors instantly based on blood type, distance, and eligibility.',
    color: 'from-red-500 to-rose-600',
    bg: 'from-red-50 to-rose-100',
    shadow: 'shadow-gray-500/20',
  },
  {
    icon: Shield,
    title: 'Verified Donors',
    description: 'Every donor is verified with a complete, transparent donation history you can trust.',
    color: 'from-red-500 to-rose-600',
    bg: 'from-red-50 to-rose-100',
    shadow: 'shadow-gray-500/20',
  },
  {
    icon: Clock,
    title: '24/7 Emergency',
    description: 'Round-the-clock emergency response system that never stops looking for a match.',
    color: 'from-red-500 to-rose-600',
    bg: 'from-red-50 to-rose-100',
    shadow: 'shadow-gray-500/20',
  },
  {
    icon: Globe,
    title: 'Wide Network',
    description: 'Connected blood banks and hospitals across all major cities, working as one network.',
    color: 'from-red-500 to-rose-600',
    bg: 'from-red-50 to-rose-100',
    shadow: 'shadow-gray-500/20',
  },
];

const VALUES = [
  { label: 'Real-time AI Matching', color: 'text-red-400' },
  { label: 'Verified Donor Network', color: 'text-red-400' },
  { label: '24/7 Emergency Support', color: 'text-red-400' },
  { label: 'Complete Data Privacy', color: 'text-red-400' },
];
// ── End of editable copy ──────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="About Us"
        eyebrowIcon={Sparkles}
        title={
          <>
            Technology with a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-orange-500">
              human heartbeat
            </span>
          </>
        }
        description="BloodDonation connects donors with patients and hospitals in need, using AI to make every second count when it matters most."
      />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`group text-center py-8 px-4 rounded-3xl border border-white bg-gradient-to-br ${stat.bg} shadow-md ${stat.shadow} hover:shadow-xl transition-all hover:-translate-y-1`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gray-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }} />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-pink-300 mb-4">
            Our Mission
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            A world where no one dies waiting for blood
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            We leverage AI to make blood donation faster, smarter, and more accessible to
            everyone in need &mdash; turning minutes of searching into seconds of matching.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {VALUES.map((value) => (
              <div
                key={value.label}
                className="flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2"
              >
                <CheckCircle className={`h-4 w-4 ${value.color}`} />
                <span className="text-sm text-gray-200">{value.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white via-orange-50/40 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white shadow-sm px-4 py-1.5 text-xs font-semibold text-orange-600 mb-4">
              Why Choose Us
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Built for speed, trust, and scale
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden bg-gradient-to-br ${feature.bg} rounded-3xl border border-white hover:border-transparent shadow-md hover:shadow-2xl ${feature.shadow} transition-all duration-300 p-6`}
                >
                  <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 blur-2xl transition-opacity`} />
                  <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg ${feature.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="relative text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="relative text-gray-500 text-sm leading-relaxed mb-4">{feature.description}</p>
                  <Link href="/faq" className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-600 pl-3.5 pr-1 py-1 text-xs font-medium text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 hover:scale-105 transition-all">
                    Learn more
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/25">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 rounded-3xl p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Ready to save lives?
              </h2>
              <p className="text-red-50 mb-8 max-w-2xl mx-auto">
                Join thousands of donors who are making a difference every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white cursor-pointer hover:bg-gray-100 text-red-600 font-semibold shadow-xl px-8 hover:scale-105 transition-transform">
                    Become a Donor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/find-donor">
                  <Button size="lg" variant="outline" className="border-white/40 cursor-pointer bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white px-8 hover:scale-105 transition-transform">
                    Find Blood
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
