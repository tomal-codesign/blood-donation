// app/dashboard/hospital/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Droplet, TrendingUp, AlertCircle, Users, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function HospitalDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Hospital Dashboard</h2>
        <p className="text-blue-100">Manage your blood inventory and requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Package className="h-8 w-8 text-blue-600" />} title="Total Units" value="156" color="bg-blue-50" />
        <StatCard icon={<AlertCircle className="h-8 w-8 text-red-600" />} title="Critical Stock" value="3" color="bg-red-50" />
        <StatCard icon={<Droplet className="h-8 w-8 text-green-600" />} title="Active Requests" value="12" color="bg-green-50" />
        <StatCard icon={<TrendingUp className="h-8 w-8 text-purple-600" />} title="Fulfillment Rate" value="87%" color="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <ActionButton icon={<Package />} label="Update Inventory" onClick={() => toast.info('Inventory management coming soon')} />
            <ActionButton icon={<Plus />} label="New Request" onClick={() => toast.info('Create request coming soon')} />
            <ActionButton icon={<Users />} label="View Donors" onClick={() => toast.info('Donor list coming soon')} />
            <ActionButton icon={<FileText />} label="View Reports" onClick={() => toast.info('Reports coming soon')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blood Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AlertItem bloodGroup="A-" units={5} status="critical" />
              <AlertItem bloodGroup="AB-" units={2} status="critical" />
              <AlertItem bloodGroup="B-" units={8} status="low" />
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

function ActionButton({ icon, label, onClick }: any) {
  return (
    <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={onClick}>
      {icon}
      <span className="text-sm">{label}</span>
    </Button>
  );
}

function AlertItem({ bloodGroup, units, status }: any) {
  const colors = status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
  return (
    <div className={`p-3 rounded-lg border ${colors}`}>
      <div className="flex justify-between items-center">
        <span className="font-bold">Blood Group {bloodGroup}</span>
        <span className="text-sm">{units} units left</span>
      </div>
      <p className="text-xs mt-1">{status === 'critical' ? '⚠️ Immediate action required' : '⚠️ Consider restocking soon'}</p>
    </div>
  );
}