// components/shared/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
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
    switch (user.role) {
      case 'donor': return '/dashboard/donor';
      case 'hospital': return '/dashboard/hospital';
      case 'admin': return '/dashboard/admin';
      default: return '/dashboard/patient';
    }
  };

  // Navigation items with their paths
  const navItems = [
    { name: 'Home', href: '/', exact: true, altPaths: ['/home'] }, // Added altPaths for /home
    { name: 'Find Donor', href: '/find-donor', exact: false },
    { name: 'Emergency', href: '/emergency', exact: false },
    { name: 'About', href: '/about', exact: false },
    { name: 'Contact', href: '/contact', exact: false },
  ];

  // Check if link is active with support for alternative paths
  const isActiveLink = (item: typeof navItems[0]) => {
    if (!pathname) return false;

    // For Home page: check both '/' and '/home'
    if (item.href === '/') {
      return pathname === '/' || pathname === '/home';
    }

    if (item.exact) {
      return pathname === item.href;
    }

    return pathname.startsWith(item.href);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo-new.png"
                alt="BloodDonation Logo"
                width={200}
                height={32}
                className="h-8 object-contain"
              />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm shadow-md'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Image */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Image
                src="/logo-new.png"
                alt="BloodDonation Logo"
                width={200}
                height={32}
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                isActive={isActiveLink(item)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="outline" className="border-red-200 hover:bg-red-50 cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="destructive" size="sm" className="cursor-pointer text-white">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="cursor-pointer hover:bg-red-50">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-red-600 hover:bg-red-700 cursor-pointer">
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
              {navItems.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  isActive={isActiveLink(item)}
                >
                  {item.name}
                </MobileNavLink>
              ))}

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
                  <MobileNavLink href="/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </MobileNavLink>
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

// NavLink component - all links have same behavior
function NavLink({
  href,
  children,
  isActive
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  // Check if it's emergency link to show heart icon

  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
          ? 'bg-red-50 text-red-600' // Active state for all links including emergency
          : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
        }`}
    >
      {children}
    </Link>
  );
}

// MobileNavLink component - all links have same behavior
function MobileNavLink({
  href,
  children,
  onClick,
  isActive,
  isRegister
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  isRegister?: boolean;
}) {
  // Check if it's emergency link

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isRegister
          ? 'bg-red-600 text-white' // Register button special style
          : isActive
            ? 'bg-red-50 text-red-600' // Active state for all links including emergency
            : 'text-gray-700 hover:bg-red-50'
        }`}
    >
      {children}
    </Link>
  );
}