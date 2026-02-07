"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { HealthIndicator } from "@/components/HealthIndicator";
import { MintBurnForm } from "@/components/MintBurnForm";
import { useVault, useProperty } from "@/hooks/useContracts";
import { formatUnits } from "viem";
import { AddressDisplay } from "@/components/AddressDisplay";

// Tipi per i dati del contratto
type VaultData = readonly [bigint, `0x${string}`, bigint, number, bigint];
type PropertyData = readonly [`0x${string}`, string, string, string, string, string, string, `0x${string}`, bigint, boolean];

export default function VaultDetailPage() {
  const params = useParams();
  const vaultId = BigInt(params.id as string);
  const { address } = useAccount();
  
  const { data: vaultRaw, isLoading: vaultLoading } = useVault(vaultId);
  const vault = vaultRaw as VaultData | undefined;
  
  const propertyId = vault ? vault[0] : BigInt(0);
  const { data: propertyRaw, isLoading: propertyLoading } = useProperty(propertyId);
  const property = propertyRaw as PropertyData | undefined;

  const isLoading = vaultLoading || propertyLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!vault || vault[1] === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Vault Non Trovato</h1>
            <p className="text-gray-600">Il vault #{String(params.id)} non esiste.</p>
            <a href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
              Torna alla Dashboard
            </a>
          </div>
        </main>
      </div>
    );
  }

  // Destructure vault data: [PropertyId, owner, debt, status, createdAt]
  const owner = vault[1];
  const debt = vault[2];
  const status = vault[3];
  const createdAt = vault[4];
  
  const isOwner = address?.toLowerCase() === owner.toLowerCase();
  const debtFormatted = formatUnits(debt, 18);
  
  // Status: 0 = Active, 1 = InRecall, 2 = Closed
  const statusLabels = ["Active", "In Recall", "Closed"];
  const statusColors = ["bg-green-100 text-green-800", "bg-yellow-100 text-yellow-800", "bg-gray-100 text-gray-800"];

  // Mock collateral ratio (in produzione verrebbe da getCollateralRatio)
  const mockRatio = debt > BigInt(0) ? 18500 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/dashboard" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
              ← Dashboard
            </a>
            <h1 className="text-3xl font-bold">Vault #{String(params.id)}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vault Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Statistiche Vault</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Debito Totale</p>
                  <p className="text-2xl font-bold">{Number(debtFormatted).toLocaleString()} RESD</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Collateral Ratio</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{(mockRatio / 100).toFixed(1)}%</p>
                    <HealthIndicator ratio={mockRatio} />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Property ID</p>
                  <p className="text-lg font-medium">#{propertyId.toString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Creato il</p>
                  <p className="text-lg font-medium">
                    {new Date(Number(createdAt) * 1000).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </div>
            </div>

            {/* Property Info */}
            {property && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Proprietà Collaterale</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ubicazione</p>
                    <p className="font-medium">{property[5]} ({property[6]})</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Categoria</p>
                    <p className="font-medium">{property[4]}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Identificativi Catastali</p>
                    <p className="font-medium">
                      Foglio {property[1]}, Part. {property[2]}, Sub. {property[3] || "N/A"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Valore Stimato</p>
                    <p className="font-medium text-green-600">
                      ~€170,000
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recall Section (solo se InRecall) */}
            {status === 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-yellow-800">
                  Recall in Corso
                </h2>
                <p className="text-yellow-700 mb-4">
                  Il proprietario ha avviato il recall. Gli holder RESD possono 
                  riscuotere USDC con un premium decrescente.
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">Settimana 1</p>
                    <p className="font-bold text-green-600">1.02 USDC/RESD</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">Settimana 2-3</p>
                    <p className="font-bold text-yellow-600">1.01 USDC/RESD</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">Settimana 4</p>
                    <p className="font-bold text-gray-600">1.00 USDC/RESD</p>
                  </div>
                </div>
                
                {!isOwner && (
                  <button className="w-full py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700">
                    Riscuoti USDC
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Mint/Burn Form (solo owner e vault attivo) */}
            {isOwner && status === 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Gestisci RESD</h2>
                <MintBurnForm vaultId={vaultId} currentDebt={debt} />
              </div>
            )}

            {/* Recall Button (solo owner e vault attivo con debt > 0) */}
            {isOwner && status === 0 && debt > BigInt(0) && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Recall</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Avvia il recall per riacquistare tutti i RESD in circolazione 
                  depositando USDC (debito + 2% premium).
                </p>
                <button className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
                  Avvia Recall
                </button>
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Owner</h2>
              <AddressDisplay
              address={owner}
              showAvatar
              linkToEtherscan
              />
              {isOwner && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Tu sei l&apos;owner
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
