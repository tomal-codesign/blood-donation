// app/(public)/about/page.tsx
'use client';

import { Heart, Droplet, Users, Award, Target, Shield, Clock, Globe, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutPage() {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Donors' },
    { icon: Heart, value: '5,000+', label: 'Lives Saved' },
    { icon: Droplet, value: '50+', label: 'Blood Banks' },
    { icon: Award, value: '99%', label: 'Success Rate' },
  ];

  const features = [
    {
      icon: Target,
      title: 'AI-Powered Matching',
      description: 'Smart algorithm finds the most suitable donors instantly.',
    },
    {
      icon: Shield,
      title: 'Verified Donors',
      description: 'All donors are verified with donation history tracking.',
    },
    {
      icon: Clock,
      title: '24/7 Emergency',
      description: 'Round-the-clock emergency response system.',
    },
    {
      icon: Globe,
      title: 'Wide Network',
      description: 'Connected blood banks across all major cities.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-pulse">PulseCoder</h1>
          <p className="text-lg text-red-100">
            Connecting blood donors with those in need using cutting-edge AI technology.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
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

      {/* Mission Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 text-lg mb-6">
            To create a world where no one dies waiting for blood. We leverage AI to make
            blood donation faster, smarter, and more accessible to everyone in need.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Real-time Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Verified Donors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex p-3 bg-red-100 rounded-full mb-4">
                      <Icon className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-red-600 to-red-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-red-100 mb-6">
            Join thousands of donors who are making a difference every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                Become a Donor
              </Button>
            </Link>
            <Link href="/find-donor">
              <Button size="lg" variant="outline" className="border-white text-red-600 hover:bg-red-700">
                Find Blood
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}