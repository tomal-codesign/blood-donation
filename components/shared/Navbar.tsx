// components/shared/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
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
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/logo-new.png" alt="PulseCoder" width={200} height={43} className="h-9 w-auto object-contain" priority />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 shadow-lg shadow-gray-900/5' : 'bg-white/70'
      } backdrop-blur-xl border-b border-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-new.png"
              alt="PulseCoder"
              width={200}
              height={43}
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/find-donor">Find Donor</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/faq">FAQ</NavLink>
            <NavLink href="/emergency" isEmergency>Emergency</NavLink>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="cursor-pointer">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 text-white shadow-lg shadow-red-500/30 cursor-pointer">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-1">
              <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="/find-donor" onClick={() => setIsMenuOpen(false)}>Find Donor</MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>About</MobileNavLink>
              <MobileNavLink href="/faq" onClick={() => setIsMenuOpen(false)}>FAQ</MobileNavLink>
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
                    className="text-left px-4 py-2.5 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition cursor-pointer"
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
      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
        isEmergency
          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 hover:scale-105'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {isEmergency && <Heart className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />}
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
      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
        isEmergency
          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
          : isRegister
          ? 'bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}
