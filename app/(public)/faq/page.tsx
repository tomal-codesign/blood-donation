// app/(public)/faq/page.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Droplet, Heart, Shield, Clock, Users, Award, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: 'General',
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

  const quickStats = [
    { icon: Droplet, value: '8', label: 'Blood Groups' },
    { icon: Users, value: '10k+', label: 'Donors' },
    { icon: Heart, value: '5k+', label: 'Lives Saved' },
    { icon: Clock, value: '30min', label: 'Emergency Response' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Find answers to common questions about blood donation and our platform.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-3 bg-red-100 rounded-full mb-3">
                    <Icon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {faqs.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.questions.map((faq, qIndex) => {
                const globalIndex = sectionIndex * 10 + qIndex;
                const isOpen = openIndex === globalIndex;
                
                return (
                  <Card key={qIndex} className="overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      className="w-full text-left"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-semibold">{faq.q}</CardTitle>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </CardHeader>
                      {isOpen && (
                        <CardContent>
                          <CardDescription className="text-gray-600 text-base">
                            {faq.a}
                          </CardDescription>
                        </CardContent>
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still Have Questions */}
        <Card className="mt-12 bg-red-50 border-red-200">
          <CardContent className="p-8 text-center">
            <Phone className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  Contact Support
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-red-600 hover:bg-red-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}