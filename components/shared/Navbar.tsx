// components/shared/Navbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Droplet, Menu, X, Heart, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import RoleToggle from './RoleToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    const role = user.currentRole || user.roles?.[0] || 'donor';
    return `/dashboard/${role}`;
  };

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Droplet className="h-8 w-8 text-red-600" />
              <span className="font-bold text-xl">BloodDonation</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Droplet className="h-8 w-8 text-red-600 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xl">BloodDonation</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/find-donor">Find Donor</NavLink>
            <NavLink href="/emergency" isEmergency>Emergency</NavLink>
            
            {/* Role Toggle - Only show if user has both donor and patient roles */}
            {user && <RoleToggle />}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="outline" className="border-red-200 hover:bg-red-50">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="destructive" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="/find-donor" onClick={() => setIsMenuOpen(false)}>Find Donor</MobileNavLink>
              <MobileNavLink href="/emergency" onClick={() => setIsMenuOpen(false)} isEmergency>Emergency</MobileNavLink>
              
              {user && <RoleToggle />}
              
              {user ? (
                <>
                  <MobileNavLink href={getDashboardLink()} onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </MobileNavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href="/login" onClick={() => setIsMenuOpen(false)}>Login</MobileNavLink>
                  <MobileNavLink href="/register" onClick={() => setIsMenuOpen(false)} isRegister>
                    Register
                  </MobileNavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children, isEmergency }: { href: string; children: React.ReactNode; isEmergency?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isEmergency
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
      }`}
    >
      {isEmergency && <Heart className="h-4 w-4 inline mr-1" />}
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick, isEmergency, isRegister }: { 
  href: string; 
  children: React.ReactNode; 
  onClick: () => void;
  isEmergency?: boolean;
  isRegister?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        isEmergency
          ? 'bg-red-600 text-white'
          : isRegister
          ? 'bg-red-600 text-white'
          : 'text-gray-700 hover:bg-red-50'
      }`}
    >
      {children}
    </Link>
  );
}