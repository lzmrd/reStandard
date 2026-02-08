"use client";

import { useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

const features = [
  {
    icon: "🏠",
    title: "Register Property",
    description: "Prove ownership of your Italian property using TLS Notary and catasto data.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: "💰",
    title: "Mint RESD",
    description: "Open a vault and mint stablecoins against your property value at 150% collateral ratio.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: "🔄",
    title: "Recall Anytime",
    description: "Selling your property? Use the recall mechanism to buy back all RESD with USDC.",
    gradient: "from-orange-500 to-yellow-500",
  },
];

export default function Home() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${x}%`);
    card.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center">
          <div className="opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Real Estate Backed
              <span className="block gradient-text mt-2"> Stablecoins</span>
            </h1>
          </div>

          <p className="mt-6 text-lg sm:text-xl leading-8 text-white/70 max-w-2xl mx-auto opacity-0 animate-[fade-in-up_0.6s_ease-out_0.2s_forwards]">
            Mint RESD stablecoins using your Italian real estate as collateral.
            Verified through TLS Notary.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.4s_forwards]">
            <Link
              href="/register"
              className="btn-shine group relative rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Register Property
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-300"
            >
              View Dashboard
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => { cardRefs.current[index] = el; }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              className="animated-border glow-card group rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-2 transition-all duration-300 opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards] inner-glow"
              style={{ animationDelay: `${(index + 1) * 150 + 600}ms` }}
            >
              {/* Icon with gradient background */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>

              <h3 className="text-xl font-semibold text-white group-hover:gradient-text-static transition-all duration-300 relative z-10">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm text-white/60 leading-relaxed relative z-10">
                {feature.description}
              </p>

              {/* Learn more link */}
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyan-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                Learn more
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center opacity-0 animate-[fade-in-up_0.5s_ease-out_1.4s_forwards]">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to unlock your property&apos;s value?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Join thousands of property owners who are already using reStandard to access liquidity.
          </p>
          <Link
            href="/register"
            className="btn-shine inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Now
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
