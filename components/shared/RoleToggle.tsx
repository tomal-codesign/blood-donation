// components/shared/RoleToggle.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Droplet, User, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleToggle() {
  const { user, toggleRole } = useAuth();
  const router = useRouter();

  if (!user || !user.roles || user.roles.length < 2) {
    return null;
  }

  // Check if user has both donor and patient roles
  const hasDonorRole = user.roles.includes('donor');
  const hasPatientRole = user.roles.includes('patient');
  
  if (!hasDonorRole || !hasPatientRole) {
    return null;
  }

  const isDonor = user.currentRole === 'donor';
  const isPatient = user.currentRole === 'patient';

  const handleToggle = () => {
    toggleRole();
    
    // Redirect to appropriate dashboard after role change
    setTimeout(() => {
      const newRole = isDonor ? 'patient' : 'donor';
      router.push(`/dashboard/${newRole}`);
    }, 300);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={handleToggle}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300
          ${isDonor 
            ? 'bg-red-500 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <Droplet className="h-4 w-4" />
        Donor
      </button>
      
      <button
        onClick={handleToggle}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300
          ${isPatient 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <User className="h-4 w-4" />
        Patient
      </button>
    </div>
  );
}