// components/shared/Footer.tsx (SVG version)
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo-new.png"
                alt="BloodDonation Logo"
                width={200}
                height={32}
                className="h-10 w-auto object-contain"
              />            </div>
            <p className="text-gray-400 text-sm">
              Saving lives through smart blood donation system. AI-powered matching for emergency responses.
            </p>
            <div className="flex space-x-4 mt-4">
              {/* Facebook Icon */}
              <a href="#" className="text-gray-400 hover:text-red-500 transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Twitter Icon */}
              <a href="#" className="text-gray-400 hover:text-red-500 transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.803-12.266c.902-.65 1.684-1.464 2.302-2.392z" />
                </svg>
              </a>
              {/* LinkedIn Icon */}
              <a href="#" className="text-gray-400 hover:text-red-500 transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Rest of the footer remains same */}
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-red-500 transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-red-500 transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/find-donor" className="text-gray-400 hover:text-red-500 transition text-sm">
                  Find Donor
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="text-gray-400 hover:text-red-500 transition text-sm">
                  Emergency
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-red-500 transition text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/register?role=donor" className="text-gray-400 hover:text-red-500 transition text-sm">
                  Become a Donor
                </Link>
              </li>
              <li>
                <Link href="/register?role=patient" className="text-gray-400 hover:text-red-500 transition text-sm">
                  Request Blood
                </Link>
              </li>
              <li>
                <Link href="/register?role=hospital" className="text-gray-400 hover:text-red-500 transition text-sm">
                  Register Hospital
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-red-500 transition text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="h-4 w-4 text-red-500" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-red-500" />
                <span>support@blooddonation.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/emergency">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Emergency</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} PluseCoder. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Made with ❤️ for saving lives
          </p>
        </div>
      </div>
    </footer>
  );
}