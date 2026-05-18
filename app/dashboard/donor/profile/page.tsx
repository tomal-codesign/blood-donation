// app/dashboard/donor/profile/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Droplet, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function DonorProfile() {
    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Profile</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Edit profile coming soon')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ProfileField icon={<User />} label="Full Name" value="John Doe" />
                    <ProfileField icon={<Mail />} label="Email" value="john@example.com" />
                    <ProfileField icon={<Phone />} label="Phone" value="+880 1234 567890" />
                    <ProfileField icon={<MapPin />} label="City" value="Dhaka" />
                    <ProfileField icon={<Droplet />} label="Blood Group" value="O+" />
                </CardContent>
            </Card>
        </div>
    );
}

function ProfileField({ icon, label, value }: any) {
    return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-400">{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}