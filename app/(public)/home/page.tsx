// app/(public)/home/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Droplet, Heart, Zap, Shield, Clock, MapPin, Activity } from 'lucide-react';

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
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Save Lives Through{' '}
                        <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                            Smart Donation
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        AI-powered platform connecting blood donors with those in need.
                        Fast, reliable, and life-saving.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-8">
                                Become a Donor
                            </Button>
                        </Link>
                        <Link href="/emergency">
                            <Button size="lg" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 text-lg px-8">
                                <Heart className="mr-2 h-5 w-5" />
                                Emergency Request
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose BloodDonation?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We use cutting-edge AI technology to make blood donation faster and more efficient
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="h-8 w-8 text-red-600" />}
                            title="AI Smart Matching"
                            description="Our AI finds the nearest and most suitable donors in seconds"
                        />
                        <FeatureCard
                            icon={<Clock className="h-8 w-8 text-red-600" />}
                            title="Emergency Response"
                            description="Critical requests are prioritized and broadcast immediately"
                        />
                        <FeatureCard
                            icon={<Activity className="h-8 w-8 text-red-600" />}
                            title="Real-time Tracking"
                            description="Monitor blood inventory and request status in real-time"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-red-50 to-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to Make a Difference?
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Join thousands of donors who are saving lives every day
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="bg-red-600 hover:bg-red-700">
                                Register Now
                            </Button>
                        </Link>
                        <Link href="/find-donor">
                            <Button size="lg" variant="outline">
                                Find Blood
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}