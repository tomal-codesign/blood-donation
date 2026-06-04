// app/dashboard/donor/requests/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Droplet, AlertCircle, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function FindRequestsPage() {
    const [searchParams, setSearchParams] = useState({
        blood_group: '',
        radius: 10,
        status: 'pending'
    });
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleSearch = async () => {
        if (!searchParams.blood_group) {
            toast.error('Please select a blood group');
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/requests?blood_group=${searchParams.blood_group}&status=${searchParams.status}`
            );
            const data = await response.json();
            setRequests(data.requests || []);
        } catch (error) {
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-50';
            case 'moderate': return 'text-orange-600 bg-orange-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Blood Requests</h1>
                <p className="text-gray-500 mt-1">Browse and respond to blood requests in your area</p>
            </div>

            {/* Search Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Filters</CardTitle>
                    <CardDescription>Find blood requests that match your blood group and location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Blood Group *</Label>
                            <Select onValueChange={(value) => setSearchParams({ ...searchParams, blood_group: value })}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select your blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bloodGroups.map(bg => (
                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Request Status</Label>
                            <Select onValueChange={(value) => setSearchParams({ ...searchParams, status: value })} defaultValue="pending">
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="matched">Matched</SelectItem>
                                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Search Radius: {searchParams.radius} km</Label>
                        <Slider
                            value={[searchParams.radius]}
                            onValueChange={(value) => setSearchParams({ ...searchParams, radius: value[0] })}
                            min={1}
                            max={50}
                            step={1}
                            className="mt-2"
                        />
                    </div>

                    <Button onClick={handleSearch} className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                        {loading ? 'Searching...' : <><Search className="mr-2 h-4 w-4" /> Find Requests</>}
                    </Button>
                </CardContent>
            </Card>

            {/* Results */}
            {searched && (
                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>{requests.length} request(s) found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No blood requests found matching your criteria</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request: any) => (
                                    <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                                    <Droplet className="h-6 w-6 text-red-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold">Blood Group {request.blood_group}</p>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                            {request.priority?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{request.hospital_name}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {request.city}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Navigation className="h-3 w-3" />
                                                            {request.distance || 'Nearby'}
                                                        </span>
                                                        <span>{request.units_needed} unit(s) needed</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button className="bg-red-600 hover:bg-red-700">
                                                Help Now
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}