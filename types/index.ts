// types/index.ts
export interface User {
  id: string;
  email: string;
  role: 'donor' | 'patient' | 'hospital' | 'admin';
  full_name: string;
  phone: string;
  city: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
}

export interface Donor extends User {
  blood_group: string;
  is_available: boolean;
  last_donation_date?: string;
  total_donations: number;
}

export interface BloodRequest {
  id: string;
  requester_id: string;
  blood_group: string;
  units_needed: number;
  priority: 'critical' | 'moderate' | 'normal';
  status: 'pending' | 'matched' | 'fulfilled' | 'cancelled';
  hospital_name: string;
  location_lat: number;
  location_lng: number;
  city: string;
  patient_condition?: string;
  created_at: string;
}

export interface AIMatch {
  donor_id: string;
  name: string;
  phone: string;
  city: string;
  blood_group: string;
  distance_km: string;
  score: number;
  is_available: boolean;
  total_donations: number;
  last_donation_date?: string;
}