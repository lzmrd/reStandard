import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Real Estate Backed
            <span className="text-blue-600"> Stablecoins</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Mint RESD stablecoins using your Italian real estate as collateral.
            Verified through TLS Notary, powered by Circle Arc.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Register Property
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              View Dashboard <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <div className="text-3xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Register Property
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Prove ownership of your Italian property using TLS Notary and
              catasto data.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-900">Mint RESD</h3>
            <p className="mt-2 text-sm text-gray-600">
              Open a vault and mint stablecoins against your property value at
              150% collateral ratio.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recall Anytime
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Selling your property? Use the recall mechanism to buy back all
              RESD with USDC.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
