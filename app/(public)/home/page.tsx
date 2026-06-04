// app/(public)/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Droplet,
    Heart,
    Zap,
    Shield,
    Clock,
    Activity,
    Award,
    Users,
    Hospital,
    ChevronRight,
    PlayCircle,
    CheckCircle,
    Globe,
    Star,
    ArrowRight,
    Sparkles,
    Truck,
    ThumbsUp,
    Target,
    BarChart3
} from 'lucide-react';

export default function HomePage() {
    const stats = [
        { icon: Users, value: '10,000+', label: 'Active Donors', change: '+25%', color: '#ef4444' },
        { icon: Heart, value: '5,000+', label: 'Lives Saved', change: '+18%', color: '#ec4899' },
        { icon: Hospital, value: '50+', label: 'Blood Banks', change: '+12%', color: '#3b82f6' },
        { icon: Award, value: '99%', label: 'Success Rate', change: '+5%', color: '#10b981' },
    ];

    const features = [
        {
            icon: Sparkles,
            title: 'AI Smart Matching',
            description: 'Our intelligent algorithm finds the most suitable donors based on location, blood type, and eligibility in real-time.',
            color: '#f59e0b'
        },
        {
            icon: Shield,
            title: 'Verified Network',
            description: 'Every donor is verified with complete history tracking. Hospitals are certified partners ensuring safety.',
            color: '#10b981'
        },
        {
            icon: Zap,
            title: 'Instant Response',
            description: 'Emergency requests broadcast to thousands of nearby donors within seconds. Response time reduced by 80%.',
            color: '#ef4444'
        },
        {
            icon: Globe,
            title: 'Nationwide Reach',
            description: 'Connected blood banks and donors across 50+ cities. 24/7 support for emergency situations.',
            color: '#3b82f6'
        },
    ];

    const impactNumbers = [
        { value: '2,345', label: 'Emergency Requests', icon: Activity, trend: '+23%' },
        { value: '892', label: 'Critical Saves', icon: Heart, trend: '+15%' },
        { value: '156', label: 'Partner Hospitals', icon: Hospital, trend: '+8%' },
        { value: '98%', label: 'Patient Satisfaction', icon: ThumbsUp, trend: '+4%' },
    ];

    const testimonials = [
        {
            name: 'Dr. Sarah Ahmed',
            role: 'Chief Medical Officer',
            hospital: 'Dhaka Medical College',
            content: 'This platform has revolutionized how we handle emergency blood requests. The AI matching is incredibly accurate and fast.',
            rating: 5,
            image: 'S',
            saved: '200+ lives'
        },
        {
            name: 'Md. Rahman',
            role: 'Regular Donor',
            hospital: '15+ Donations',
            content: 'Being a donor here gives me purpose. The app makes it so easy to help people in need.',
            rating: 5,
            image: 'R',
            saved: '45 lives'
        },
        {
            name: 'Fatema Begum',
            role: 'Recipient Family',
            hospital: 'Saved Her Son',
            content: 'When my son needed O- blood urgently, we found a donor within 20 minutes. This service is a blessing.',
            rating: 5,
            image: 'F',
            saved: '1 life'
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1600')] bg-cover bg-center opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>

                <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-none mb-6 px-4 py-1.5 text-sm">
                                <Sparkles className="h-3 w-3 inline mr-1" />
                                AI-Powered Blood Donation Platform
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                Save Lives With
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-200 block">
                                    Smart Technology
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300 mb-8 max-w-lg">
                                Connect with blood donors instantly using our intelligent matching system.
                                Fast, reliable, and life-saving.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/register">
                                    <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-600 cursor-pointer hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all text-lg px-8">
                                        Start Donating
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/emergency">
                                    <Button size="lg" variant="outline" className="border-white cursor-pointer bg-transparent text-white hover:text-white hover:bg-white/20 transition-all text-lg px-8">
                                        <PlayCircle className="mr-2 h-5 w-5" />
                                        Emergency Request
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-8 mt-8 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300">10k+ Donors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Truck className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300">50+ Hospitals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <Target className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300">99% Success</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <div className="text-center mb-4">
                                    <div className="inline-flex p-3 bg-red-500/20 rounded-full">
                                        <BarChart3 className="h-6 w-6 text-red-400" />
                                    </div>
                                    <h3 className="text-white font-semibold mt-2">Live Impact Stats</h3>
                                </div>
                                <div className="space-y-3">
                                    {impactNumbers.map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                        <Icon className="h-4 w-4 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold">{item.value}</p>
                                                        <p className="text-xs text-gray-400">{item.label}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-500/20 text-green-400 border-none">
                                                    {item.trend}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <Badge className="bg-red-100 text-red-600 mb-4">Our Impact</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Making a Difference Together
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Numbers that reflect our commitment to saving lives
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardContent className="p-6 text-center">
                                        <div className="relative">
                                            <div className="absolute -top-2 -right-2 text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                                                {stat.change}
                                            </div>
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${stat.color}15` }}>
                                                <Icon className="h-8 w-8" style={{ color: stat.color }} />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-sm text-gray-500">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white mb-4">Features</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose BloodDonation?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We combine cutting-edge technology with human compassion
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden">
                                    <div className="h-2" style={{ backgroundColor: feature.color }}></div>
                                    <CardContent className="p-6">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${feature.color}15` }}>
                                            <Icon className="h-7 w-7" style={{ color: feature.color }} />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                        <div className="mt-4 flex items-center text-sm font-medium" style={{ color: feature.color }}>
                                            Learn more
                                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Emergency CTA */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700"></div>
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="pattern-blood" width="60" height="60" patternUnits="userSpaceOnUse">
                                <g fill="none" fillRule="evenodd">
                                    <g fill="#ffffff" fillOpacity="0.05">
                                        <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
                                    </g>
                                </g>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#pattern-blood)" />
                    </svg>
                </div>
                <div className="relative max-w-5xl mx-auto px-4 text-center">
                    <div className="inline-flex p-4 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                        <Heart className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Need Blood Urgently?
                    </h2>
                    <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
                        Don't wait. Post an emergency request and get donors in minutes. Our AI will notify thousands of donors in your area.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/emergency">
                            <Button size="lg" className="bg-white cursor-pointer hover:bg-gray-100 text-red-600 font-semibold shadow-lg text-lg px-8">
                                Request Emergency Blood
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/20 hover:text-white text-lg px-8 cursor-pointer">
                                Become a Donor
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <Badge className="bg-purple-100 text-purple-600 mb-4">Testimonials</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Trusted by Thousands
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Real stories from our community
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 italic leading-relaxed">"{testimonial.content}"</p>
                                    <div className="flex items-center gap-3 pt-3 border-t">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                                            {testimonial.image}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                            <p className="text-xs text-gray-500">{testimonial.role}</p>
                                            <p className="text-xs text-red-600 mt-1">⭐ Saved {testimonial.saved}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-12 text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-10"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Make a Difference?
                            </h2>
                            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                                Join our community of heroes. Every donation saves up to 3 lives.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register">
                                    <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-600 cursor-pointer hover:from-red-600 hover:to-red-700 text-white shadow-lg px-8">
                                        <Heart className="mr-2 h-5 w-5" />
                                        Join Now - It's Free
                                    </Button>
                                </Link>
                                <Link href="/find-donor">
                                    <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/20 hover:text-white px-8 cursor-pointer">
                                        Find Blood Near You
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-gray-400 text-sm mt-6">
                                No commitment. Start saving lives today.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}