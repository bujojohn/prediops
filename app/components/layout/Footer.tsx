'use client';

import Link from 'next/link';
import { Facebook, Twitter, Mail, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2024; // Last year
  const copyrightYear = currentYear === startYear ? startYear : `${startYear}-${currentYear}`;

  return (
    <footer className="bg-slate-100 text-gray-800 border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo size="lg" showText={true} className="text-white" />
            <p className="text-slate-600 text-sm leading-relaxed">
              Sports predictions and value betting opportunities across 111+ leagues worldwide.
            </p>
                         <div className="flex items-center gap-2">
               <Badge variant="secondary" className="text-xs">
                 v2.9.1
               </Badge>
               <span className="text-xs text-slate-500">Latest Release</span>
             </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/predictions" className="text-slate-400 hover:text-white transition-colors">
                  Predictions
                </Link>
              </li>
              <li>
                <Link href="/value-bets" className="text-slate-400 hover:text-white transition-colors">
                  Value Bets
                </Link>
              </li>
              <li>
                <Link href="/live" className="text-slate-400 hover:text-white transition-colors">
                  Live Matches
                </Link>
              </li>
              <li>
                <Link href="/countries" className="text-slate-400 hover:text-white transition-colors">
                  Countries
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-400">AI Predictions</li>
              <li className="text-slate-400">Value Betting</li>
              <li className="text-slate-400">Live Scores</li>
              <li className="text-slate-400">Global Coverage</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect</h3>
            <div className="flex items-center gap-3">
              <Link 
                href="https://www.facebook.com/prediops" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://twitter.com/prediops" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="mailto:contact@prediops.com" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
              <Link 
                href="https://prediops.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Globe className="h-5 w-5" />
              </Link>
            </div>
            <div className="text-sm text-slate-400">
              <p>contact@prediops.com</p>
              <p>24/7 Support Available</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-300 pt-8 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-slate-400">
              © {copyrightYear} Prediops. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>

            {/* Version Info */}
            <div className="text-xs text-slate-500">
                              <span>Powered by Joobuatech</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
