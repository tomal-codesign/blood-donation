// app/(public)/contact/page.tsx
'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, User, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/shared/PageHero';
import { toast } from 'sonner';

// ── Edit page copy below ──────────────────────────────────────────────
const CONTACT_INFO = [
    { icon: Phone, title: 'Phone', details: '+880 1234 567890', sub: 'Mon-Fri, 9am-6pm', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
    { icon: Mail, title: 'Email', details: 'support@blooddonation.com', sub: '24/7 Support', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
    { icon: MapPin, title: 'Office', details: 'Dhaka, Bangladesh', sub: 'Visit us', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
    { icon: Clock, title: 'Emergency', details: '+880 1999 888777', sub: '24/7 Available', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-100', shadow: 'shadow-gray-500/20' },
];
// ── End of editable copy ──────────────────────────────────────────────

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            toast.success('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen">
            <PageHero
                eyebrow="Get In Touch"
                eyebrowIcon={MessageCircle}
                title={
                    <>
                        We're{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-orange-500">
                            here to help
                        </span>
                    </>
                }
                description="Have questions about donating, requesting blood, or partnering with us? Reach out anytime."
                size="compact"
            />

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        {CONTACT_INFO.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <div
                                    key={index}
                                    className={`group bg-gradient-to-br ${info.bg} rounded-2xl border border-white shadow-md hover:shadow-xl ${info.shadow} transition-all p-5`}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center shrink-0 shadow-md ${info.shadow} group-hover:scale-110 transition-transform`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm">{info.title}</h3>
                                            <p className="text-gray-700 text-sm mt-0.5">{info.details}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{info.sub}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-900/5 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900">Send us a message</h2>
                            <p className="text-sm text-gray-500 mt-1 mb-6">
                                Fill out the form below and we'll get back to you as soon as possible.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <div className="relative mt-1.5">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                className="pl-10"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <div className="relative mt-1.5">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                className="pl-10"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="subject">Subject *</Label>
                                    <div className="relative mt-1.5">
                                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="subject"
                                            placeholder="How can we help?"
                                            className="pl-10"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="message">Message *</Label>
                                    <div className="relative mt-1.5">
                                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us more about your inquiry..."
                                            className="pl-10 min-h-[150px]"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 shadow-lg shadow-red-500/30 cursor-pointer hover:scale-[1.01] transition-transform"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-900/5 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900">Find us</h2>
                        <p className="text-sm text-gray-500 mt-1 mb-6">Visit our head office location</p>
                        <div className="relative h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 via-white to-orange-50 border border-gray-100 flex items-center justify-center">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-400 to-pink-400 opacity-20 rounded-full blur-3xl" />
                            <div className="relative text-center">
                                <div className="inline-flex p-3 bg-white rounded-2xl shadow-lg mb-2">
                                    <MapPin className="h-6 w-6 text-red-500" />
                                </div>
                                <p className="text-gray-700 text-sm font-medium">Dhaka, Bangladesh</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
