// app/(public)/faq/page.tsx
'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Droplet,
  Heart,
  Shield,
  Clock,
  Users,
  HelpCircle,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PageHero from '@/components/shared/PageHero';

// ── Edit page copy below ──────────────────────────────────────────────
const FAQS = [
  {
    category: 'General',
    icon: HelpCircle,
    color: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-50 to-cyan-50',
    shadow: 'shadow-blue-500/20',
    questions: [
      {
        q: 'What is BloodDonation?',
        a: 'BloodDonation is an AI-powered platform that connects blood donors with patients and hospitals in need. We use smart matching algorithms to find the most suitable donors quickly.',
      },
      {
        q: 'Is BloodDonation free to use?',
        a: 'Yes, BloodDonation is completely free for donors, patients, and hospitals. Our mission is to save lives, not make profit.',
      },
      {
        q: 'How does the AI matching work?',
        a: 'Our AI analyzes multiple factors including blood group compatibility, distance, donor availability, and last donation date to rank the best matches for you.',
      },
    ],
  },
  {
    category: 'For Donors',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    bg: 'from-red-50 to-pink-50',
    shadow: 'shadow-red-500/20',
    questions: [
      {
        q: 'Who can become a blood donor?',
        a: 'Anyone between 18-65 years, weighing at least 50kg, and in good health can donate blood. You should not have any serious medical conditions.',
      },
      {
        q: 'How often can I donate blood?',
        a: 'Male donors can donate every 90 days (3 months). Female donors can donate every 120 days (4 months). This ensures your body fully recovers.',
      },
      {
        q: 'What should I do before donating?',
        a: 'Eat a healthy meal, drink plenty of water, get good sleep, and avoid alcohol 24 hours before donation. Bring your ID card.',
      },
      {
        q: 'How do I set my availability?',
        a: 'Log in to your donor dashboard and toggle the availability button. When available, you will receive emergency requests in your area.',
      },
    ],
  },
  {
    category: 'For Recipients',
    icon: Droplet,
    color: 'from-violet-500 to-purple-500',
    bg: 'from-violet-50 to-purple-50',
    shadow: 'shadow-violet-500/20',
    questions: [
      {
        q: 'How do I request blood?',
        a: 'Register as a patient, go to "New Request" in your dashboard, fill in the blood group and units needed, and submit the request.',
      },
      {
        q: 'What is the emergency request?',
        a: 'Emergency requests are for critical situations. They are prioritized and donors are notified immediately via SMS and app notifications.',
      },
      {
        q: 'How long does it take to find a donor?',
        a: 'Normal requests are fulfilled within 6-24 hours. Emergency requests are typically matched within 15-30 minutes.',
      },
    ],
  },
  {
    category: 'Technical',
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
    bg: 'from-emerald-50 to-teal-50',
    shadow: 'shadow-emerald-500/20',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes, we use industry-standard encryption and security measures. Your personal information is never shared without your consent.',
      },
      {
        q: 'Do I need to download an app?',
        a: 'No, BloodDonation is a web-based platform. You can access it from any browser on your phone or computer.',
      },
    ],
  },
];

const QUICK_STATS = [
  { icon: Droplet, value: '8', label: 'Blood Groups', color: 'text-red-500' },
  { icon: Users, value: '10k+', label: 'Donors', color: 'text-blue-500' },
  { icon: Heart, value: '5k+', label: 'Lives Saved', color: 'text-pink-500' },
  { icon: Clock, value: '30min', label: 'Emergency Response', color: 'text-orange-500' },
];
// ── End of editable copy ──────────────────────────────────────────────

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Help Center"
        eyebrowIcon={HelpCircle}
        title={
          <>
            Frequently asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-orange-500">
              questions
            </span>
          </>
        }
        description="Find answers to common questions about blood donation and our platform."
        size="compact"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {QUICK_STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white rounded-2xl px-4 py-3 shadow-sm"
              >
                <Icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
                <div className="text-left">
                  <p className="text-gray-900 font-bold text-sm leading-tight">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </PageHero>

      {/* FAQ Sections */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        {FAQS.map((section, sectionIndex) => {
          const CategoryIcon = section.icon;

          return (
            <div key={sectionIndex} className="mb-12">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${section.color} shadow-md ${section.shadow}`}>
                  <CategoryIcon className="h-4 w-4 text-white" />
                </div>
                {section.category}
              </h2>
              <div className="space-y-2.5">
                {section.questions.map((faq, qIndex) => {
                  const globalIndex = sectionIndex * 10 + qIndex;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={qIndex}
                      className={`bg-gradient-to-br ${section.bg} rounded-2xl border transition-all overflow-hidden ${
                        isOpen ? `border-transparent shadow-lg ${section.shadow}` : 'border-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full text-left cursor-pointer flex items-center justify-between gap-4 px-5 py-4"
                      >
                        <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                        <div className={`shrink-0 p-1 rounded-full transition-colors ${isOpen ? `bg-gradient-to-br ${section.color} text-white` : 'text-gray-400'}`}>
                          {isOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Still Have Questions */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 rounded-3xl p-8 text-center mt-12">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Still have questions?</h3>
            <p className="text-red-50 mb-6 text-sm">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button variant="outline" className="border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white cursor-pointer">
                  Contact Support
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white hover:bg-gray-100 text-red-600 font-semibold cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
