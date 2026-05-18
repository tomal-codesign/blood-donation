// app/(public)/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Droplet, Heart, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <Droplet className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Save Lives Through{' '}
            <span className="text-red-600">Smart Donation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered platform connecting blood donors with those in need.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Become a Donor
              </Button>
            </Link>
            <Link href="/emergency">
              <Button size="lg" variant="outline" className="border-red-600 text-red-600">
                <Heart className="mr-2 h-5 w-5" />
                Emergency
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}