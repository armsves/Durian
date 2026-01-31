"use client";

import Link from "next/link";
import { DurianLogo } from "@/components/durian-logo";

const footerLinks = {
  ecosystem: [
    { name: "USDC Offramp", href: "#" },
    { name: "Business Directory", href: "/directory" },
    { name: "API for Developers", href: "#" },
    { name: "Fee Schedule", href: "#" },
  ],
  company: [
    { name: "Governance", href: "#" },
    { name: "Privacy Policy", href: "/legal" },
    { name: "Contact Support", href: "#" },
    { name: "Thai SEC Compliance", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#FDFBF7] border-t border-[#A8C2B9]/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <DurianLogo className="w-8 h-8" />
              <span className="font-serif text-xl font-semibold text-[#1A1C1A]">Durian</span>
            </Link>
            <p className="text-sm text-[#5C6B5C] max-w-sm">
              Empowering the Thai enterprise with secure, compliant digital asset
              infrastructure. Registered as a Digital Asset Provider in the
              Kingdom of Thailand.
            </p>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="font-medium text-xs uppercase tracking-wider text-[#5C6B5C] mb-4">
              Ecosystem
            </h4>
            <ul className="space-y-3">
              {footerLinks.ecosystem.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#1A1C1A] hover:text-[#C5A35E] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium text-xs uppercase tracking-wider text-[#5C6B5C] mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#1A1C1A] hover:text-[#C5A35E] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#A8C2B9]/30 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#5C6B5C]">
            © 2024 DURIAN PAY (THAILAND) LTD. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-[#5C6B5C]">NETWORK SECURE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
