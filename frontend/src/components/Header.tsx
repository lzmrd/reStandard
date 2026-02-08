"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEnsForAddress } from "@/hooks/useEns";

export function Header() {
  const { address } = useAccount();
  const { ensName } = useEnsForAddress(address);

  return (
    <header className="border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text hover:scale-105 transition-transform">
            reStandard
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="link-underline text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/register"
              className="link-underline text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
            >
              Register
            </Link>

            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="btn-shine px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 transition-all duration-300"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200"
                          >
                            {chain.hasIcon && chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain'}
                                src={chain.iconUrl}
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="text-sm font-medium text-white/80">{chain.name}</span>
                          </button>

                          <button
                            onClick={openAccountModal}
                            className="group flex items-center gap-2 px-3 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-200"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <span className="text-sm font-medium text-white/80 group-hover:text-cyan-400 transition-colors">
                              {ensName || account.displayName}
                            </span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </nav>

          {/* Mobile */}
          <div className="md:hidden">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      className="btn-shine px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all duration-300"
                    >
                      Connect
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] rounded-lg border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-sm font-medium text-white/80">
                      {ensName || account.displayName}
                    </span>
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </header>
  );
}
