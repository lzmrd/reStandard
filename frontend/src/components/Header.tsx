// frontend/src/components/Header.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEnsForAddress } from "@/hooks/useEns";

export function Header() {
  const { address, isConnected } = useAccount();
  const { ensName } = useEnsForAddress(address);

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
            
            {/* Custom Connect Button con ENS */}
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          {/* Chain Button */}
                          <button
                            onClick={openChainModal}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            {chain.hasIcon && chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain'}
                                src={chain.iconUrl}
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="text-sm font-medium">{chain.name}</span>
                          </button>

                          {/* Account Button - mostra ENS se disponibile */}
                          <button
                            onClick={openAccountModal}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium">
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
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium"
                    >
                      Connect
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">
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
