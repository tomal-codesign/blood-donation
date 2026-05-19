// app/(public)/contact/page.tsx
'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

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

    const contactInfo = [
        {
            icon: Phone,
            title: 'Phone',
            details: '+880 1234 567890',
            sub: 'Mon-Fri, 9am-6pm',
        },
        {
            icon: Mail,
            title: 'Email',
            details: 'support@blooddonation.com',
            sub: '24/7 Support',
        },
        {
            icon: MapPin,
            title: 'Office',
            details: 'Dhaka, Bangladesh',
            sub: 'Visit us',
        },
        {
            icon: Clock,
            title: 'Emergency',
            details: '+880 1999 888777',
            sub: '24/7 Available',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                    <p className="text-xl text-red-100 max-w-2xl mx-auto">
                        Have questions? We're here to help. Reach out to us anytime.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <Card key={index}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="p-3 bg-red-100 rounded-lg">
                                                <Icon className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{info.title}</h3>
                                                <p className="text-gray-600">{info.details}</p>
                                                <p className="text-sm text-gray-400">{info.sub}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we'll get back to you as soon as possible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <div className="relative mt-1">
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
                                            <div className="relative mt-1">
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
                                        <div className="relative mt-1">
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
                                        <div className="relative mt-1">
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

                                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
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
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-12">
                    <Card>
                        <CardHeader>
                            <CardTitle>Find Us</CardTitle>
                            <CardDescription>Visit our head office location</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                <p className="text-gray-500">📍 Dhaka, Bangladesh</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}