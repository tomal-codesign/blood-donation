// app/(public)/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Heart,
    Zap,
    Shield,
    Activity,
    Award,
    Users,
    Hospital,
    ArrowRight,
    Sparkles,
    ThumbsUp,
    Globe,
    Star,
    CheckCircle,
} from 'lucide-react';

// ── Edit page copy below ──────────────────────────────────────────────
const STATS = [
    { icon: Users, value: '10,000+', label: 'Active Donors', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
    { icon: Heart, value: '5,000+', label: 'Lives Saved', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
    { icon: Hospital, value: '50+', label: 'Blood Banks', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
    { icon: Award, value: '99%', label: 'Success Rate', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
];

const FEATURES = [
    {
        icon: Sparkles,
        title: 'AI Smart Matching',
        description: 'Our intelligent algorithm finds the most suitable donors based on location, blood type, and eligibility in real-time.',
        color: 'from-red-500 to-rose-600',
        bg: 'from-red-50 to-rose-100',
        shadow: 'shadow-gray-500/20',
        wide: true,
    },
    {
        icon: Shield,
        title: 'Verified Network',
        description: 'Every donor is verified with complete history tracking.',
        color: 'from-red-500 to-rose-600',
        bg: 'from-red-50 to-rose-100',
        shadow: 'shadow-gray-500/20',
        wide: false,
    },
    {
        icon: Zap,
        title: 'Instant Response',
        description: 'Emergency requests reach thousands of donors within seconds.',
        color: 'from-red-500 to-rose-600',
        bg: 'from-red-50 to-rose-100',
        shadow: 'shadow-gray-500/20',
        wide: false,
    },
    {
        icon: Globe,
        title: 'Nationwide Reach',
        description: 'Connected blood banks and donors across 50+ cities, with 24/7 support for emergency situations.',
        color: 'from-red-500 to-rose-600',
        bg: 'from-red-50 to-rose-100',
        shadow: 'shadow-gray-500/20',
        wide: true,
    },
];

const IMPACT_NUMBERS = [
    { value: '2,345', label: 'Emergency Requests', icon: Activity },
    { value: '892', label: 'Critical Saves', icon: Heart },
    { value: '156', label: 'Partner Hospitals', icon: Hospital },
    { value: '98%', label: 'Patient Satisfaction', icon: ThumbsUp },
];

const TESTIMONIALS = [
    {
        name: 'Dr. Sarah Ahmed',
        role: 'Chief Medical Officer, Dhaka Medical College',
        content: 'This platform has revolutionized how we handle emergency blood requests. The AI matching is incredibly accurate and fast.',
        rating: 5,
        initial: 'S',
        color: 'from-red-500 to-rose-600',
        bg: 'from-red-50 to-rose-50',
    },
    {
        name: 'Md. Rahman',
        role: 'Regular Donor · 15+ Donations',
        content: 'Being a donor here gives me purpose. The app makes it so easy to help people in need.',
        rating: 5,
        initial: 'R',
        color: 'from-red-500 to-rose-600',
        bg: 'from-red-50 to-rose-50',
    },
    {
        name: 'Fatema Begum',
        role: 'Recipient Family',
        content: "When my son needed O- blood urgently, we found a donor within 20 minutes. This service is a blessing.",
        rating: 5,
        initial: 'F',
        color: 'from-red-500 to-rose-600',
        bg: 'from-red-50 to-rose-50',
    },
];
// ── End of editable copy ──────────────────────────────────────────────

export default function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1600')" }}
                />
                {/* Red-tinted wash so text stays readable while keeping the brand tone */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/95 via-white/85 to-rose-100/90" />

                <div className="absolute -top-32 -left-20 w-[28rem] h-[28rem] bg-gradient-to-br from-red-400 to-pink-400 opacity-30 blur-3xl animate-blob" />
                <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] bg-gradient-to-br from-orange-300 to-amber-300 opacity-30 blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
                <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-purple-300 opacity-20 blur-3xl animate-blob" style={{ animationDelay: '6s' }} />

                <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-red-600 mb-6 shadow-sm">
                                <Sparkles className="h-3.5 w-3.5" />
                                AI-Powered Blood Donation Platform
                            </div>
                            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.05] tracking-tight">
                                Save lives with
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-orange-500 animate-gradient">
                                    smart technology
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                                Connect with blood donors instantly using our intelligent matching system.
                                Fast, reliable, and life-saving.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/register">
                                    <Button size="lg" className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 cursor-pointer text-white text-base px-7 shadow-lg shadow-red-500/30 hover:scale-105 transition-transform">
                                        Start Donating
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/emergency">
                                    <Button size="lg" variant="outline" className="border-red-200 cursor-pointer bg-white/70 backdrop-blur-sm text-red-600 hover:bg-white text-base px-7 hover:scale-105 transition-transform">
                                        <Heart className="mr-2 h-4 w-4" />
                                        Emergency Request
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 mt-10 pt-6 border-t border-gray-900/10">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm text-gray-600">10k+ Donors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-gray-600">50+ Hospitals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-pink-500" />
                                    <span className="text-sm text-gray-600">99% Success</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Floating mini badges */}
                            <div className="hidden md:flex absolute -top-6 -left-6 z-10 items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-900/10 px-4 py-3 animate-float">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 leading-none">Verified</p>
                                    <p className="text-sm font-semibold text-gray-900 leading-tight">10,000+ Donors</p>
                                </div>
                            </div>
                            <div
                                className="hidden md:flex absolute -bottom-6 -right-4 z-10 items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-900/10 px-4 py-3 animate-float"
                                style={{ animationDelay: '1.5s' }}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                                    <Heart className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 leading-none">This month</p>
                                    <p className="text-sm font-semibold text-gray-900 leading-tight">892 Lives Saved</p>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-2xl shadow-gray-900/10 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-md shadow-red-500/30">
                                        <Activity className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-gray-900 font-semibold text-sm">Live Impact Stats</h3>
                                </div>
                                <div className="space-y-1">
                                    {IMPACT_NUMBERS.map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <Icon className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{item.label}</span>
                                                </div>
                                                <span className="text-gray-900 font-bold">{item.value}</span>
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
                                    <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section — bento grid */}
            <section className="py-24 bg-gradient-to-b from-white via-violet-50/40 to-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white shadow-sm px-4 py-1.5 text-xs font-semibold text-violet-600 mb-4">
                            Features
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Why choose BloodDonation?
                        </h2>
                        <p className="text-gray-500">
                            We combine cutting-edge technology with human compassion
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {FEATURES.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className={`group relative overflow-hidden bg-gradient-to-br ${feature.bg} rounded-3xl border border-white hover:border-transparent shadow-md hover:shadow-2xl ${feature.shadow} transition-all duration-300 p-7 ${feature.wide ? 'md:col-span-2' : 'md:col-span-1'}`}
                                >
                                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 blur-2xl transition-opacity`} />
                                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg ${feature.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="relative text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="relative text-gray-500 text-sm leading-relaxed mb-5">{feature.description}</p>
                                    <Link href="/about" className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-600 pl-4 pr-1 py-1 text-sm font-medium text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 hover:scale-105 transition-all">
                                        Learn more
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/25">
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Emergency CTA */}
            <section className="relative overflow-hidden py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-600 to-orange-500" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-300 opacity-20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

                <div className="relative max-w-5xl mx-auto px-4 text-center">
                    <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
                        <Heart className="h-9 w-9 text-white animate-pulse" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        Need blood urgently?
                    </h2>
                    <p className="text-red-50 text-lg mb-8 max-w-2xl mx-auto">
                        Don't wait. Post an emergency request and get donors in minutes. Our AI will notify thousands of donors in your area.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/emergency">
                            <Button size="lg" className="bg-white cursor-pointer hover:bg-gray-100 text-red-600 font-semibold shadow-xl text-base px-8 hover:scale-105 transition-transform">
                                Request Emergency Blood
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline" className="border-white/40 cursor-pointer bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white text-base px-8 hover:scale-105 transition-transform">
                                Become a Donor
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-gradient-to-b from-white via-blue-50/40 to-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white shadow-sm px-4 py-1.5 text-xs font-semibold text-blue-600 mb-4">
                            Testimonials
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Trusted by thousands
                        </h2>
                        <p className="text-gray-500">
                            Real stories from our community
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <div key={index} className={`group bg-gradient-to-br ${testimonial.bg} rounded-3xl border border-white shadow-md shadow-gray-500/20 hover:shadow-2xl hover:shadow-gray-900/10 hover:-translate-y-1 transition-all p-6`}>
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-5 leading-relaxed text-sm">"{testimonial.content}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
                                        {testimonial.initial}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                                        <p className="text-xs text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-12 md:p-16 text-center">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-blob" />
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full blur-3xl opacity-20 animate-blob" style={{ animationDelay: '5s' }} />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                                Ready to make a difference?
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                                Join our community of heroes. Every donation saves up to 3 lives.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/register">
                                    <Button size="lg" className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 cursor-pointer text-white shadow-lg shadow-red-500/30 px-8 hover:scale-105 transition-transform">
                                        <Heart className="mr-2 h-4 w-4" />
                                        Join Now &mdash; It's Free
                                    </Button>
                                </Link>
                                <Link href="/find-donor">
                                    <Button size="lg" variant="outline" className="border-white/20 cursor-pointer bg-transparent text-white hover:bg-white/10 hover:text-white px-8 hover:scale-105 transition-transform">
                                        Find Blood Near You
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-gray-500 text-sm mt-6">
                                No commitment. Start saving lives today.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
