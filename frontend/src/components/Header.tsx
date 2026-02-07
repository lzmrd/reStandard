"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            reStandard
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Register
            </Link>
            
            {/* Connect Wallet Button */}
            <ConnectButton />
          </nav>
          
          {/* Mobile: solo il bottone wallet */}
          <div className="md:hidden">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
