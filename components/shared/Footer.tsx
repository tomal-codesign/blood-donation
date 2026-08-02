// components/shared/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-950 text-white">
      <div className="absolute -top-32 right-0 w-96 h-96 bg-gradient-to-br from-red-600 to-pink-600 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute -bottom-32 left-0 w-96 h-96 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center mb-4 group w-fit">
              <Image
                src="/logo-new.png"
                alt="PulseCoder"
                width={200}
                height={43}
                className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Saving lives through smart blood donation system. AI-powered matching for emergency responses.
            </p>
            <div className="flex space-x-3 mt-5">
              {/* Facebook Icon */}
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-500 hover:border-transparent transition-all">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Twitter Icon */}
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-500 hover:border-transparent transition-all">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.803-12.266c.902-.65 1.684-1.464 2.302-2.392z" />
                </svg>
              </a>
              {/* LinkedIn Icon */}
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-500 hover:border-transparent transition-all">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/find-donor" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  Find Donor
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  Emergency
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-4">For Users</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/register?role=donor" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  Become a Donor
                </Link>
              </li>
              <li>
                <Link href="/register?role=patient" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  Request Blood
                </Link>
              </li>
              <li>
                <Link href="/register?role=hospital" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  Register Hospital
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="h-4 w-4 text-pink-500" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-pink-500" />
                <span>support@blooddonation.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-pink-500" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/emergency">
                <button className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 cursor-pointer">
                  <Heart className="h-4 w-4" />
                  <span>Emergency Request</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} BloodDonation. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made with <span className="text-pink-500">❤</span> for saving lives
          </p>
        </div>
      </div>
    </footer>
  );
}
