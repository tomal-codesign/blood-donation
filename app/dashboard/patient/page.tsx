// app/dashboard/patient/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientDashboard() {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Patient Dashboard</h2>
                <p className="text-green-100">Request blood and track your requests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<FileText />} title="Total Requests" value="5" color="bg-blue-50" />
                <StatCard icon={<Clock />} title="Pending" value="2" color="bg-yellow-50" />
                <StatCard icon={<CheckCircle />} title="Fulfilled" value="3" color="bg-green-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => toast.info('Emergency request coming soon')}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Emergency Request
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => toast.info('New request coming soon')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Blood Request
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <RequestItem bloodGroup="O-" status="pending" date="Today" />
                            <RequestItem bloodGroup="A+" status="fulfilled" date="Yesterday" />
                            <RequestItem bloodGroup="B-" status="pending" date="2 days ago" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, color }: any) {
    return (
        <Card className={color}>
            <CardContent className="p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

function RequestItem({ bloodGroup, status, date }: any) {
    const statusConfig = {
        pending: { icon: <Clock className="h-4 w-4 text-yellow-600" />, text: 'Pending', color: 'bg-yellow-50' },
        fulfilled: { icon: <CheckCircle className="h-4 w-4 text-green-600" />, text: 'Fulfilled', color: 'bg-green-50' },
        cancelled: { icon: <XCircle className="h-4 w-4 text-red-600" />, text: 'Cancelled', color: 'bg-red-50' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];

    return (
        <div className={`p-3 rounded-lg ${config.color}`}>
            <div className="flex justify-between items-center">
                <div>
                    <span className="font-semibold">Blood Group {bloodGroup}</span>
                    <p className="text-xs text-gray-500">{date}</p>
                </div>
                <div className="flex items-center space-x-1">
                    {config.icon}
                    <span className="text-sm">{config.text}</span>
                </div>
            </div>
        </div>
    );
}