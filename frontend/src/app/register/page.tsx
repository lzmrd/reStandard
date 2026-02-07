"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { useRegisterProperty } from "@/hooks/useContracts";

type Step = "connect" | "data" | "proof" | "confirm" | "success";

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<Step>("connect");
  
  // Form state
  const [formData, setFormData] = useState({
    foglio: "",
    particella: "",
    subalterno: "",
    categoria: "",
    comune: "",
    provincia: "",
  });
  
  // Mock proof hash
  const [proofHash, setProofHash] = useState<`0x${string}` | null>(null);
  
  const { register, isPending, isSuccess, error } = useRegisterProperty();

  // Aggiorna step quando wallet si connette
  useEffect(() => {
    if (isConnected && step === "connect") {
      setStep("data");
    }
  }, [isConnected, step]);

  // Quando la transazione ha successo
  useEffect(() => {
    if (isSuccess && step === "confirm") {
      setStep("success");
    }
  }, [isSuccess, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGenerateProof = () => {
    // Mock: genera un hash fittizio
    const mockHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}` as `0x${string}`;
    
    setProofHash(mockHash);
    setStep("confirm");
  };

  const handleSubmit = () => {
    if (!proofHash || !register) return;
    
    register(
        formData.foglio,
        formData.particella,
        formData.subalterno,
        formData.categoria,
        formData.comune.toUpperCase(),
        formData.provincia.toUpperCase(),
        address as string
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Registra Proprietà</h1>
        <p className="text-gray-600 mb-8">
          Registra il tuo immobile on-chain usando la prova TLS Notary
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {(["connect", "data", "proof", "confirm", "success"] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step === s ? "bg-blue-600 text-white" : 
                  (["connect", "data", "proof", "confirm", "success"] as const).indexOf(step) > i 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-500"}
              `}>
                {(["connect", "data", "proof", "confirm", "success"] as const).indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 4 && <div className="w-12 h-0.5 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          
          {/* Step 1: Connect Wallet */}
          {step === "connect" && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">Connetti il Wallet</h2>
              <p className="text-gray-600 mb-6">
                Per registrare una proprietà, devi prima connettere il tuo wallet.
              </p>
              <p className="text-sm text-gray-500">
                Usa il pulsante &quot;Connect Wallet&quot; in alto a destra
              </p>
            </div>
          )}

          {/* Step 2: Property Data */}
          {step === "data" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Dati Catastali</h2>
              <p className="text-gray-600 mb-6">
                Inserisci i dati catastali della tua proprietà
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foglio
                  </label>
                  <input
                    type="text"
                    name="foglio"
                    value={formData.foglio}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Particella
                  </label>
                  <input
                    type="text"
                    name="particella"
                    value={formData.particella}
                    onChange={handleInputChange}
                    placeholder="456"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subalterno
                  </label>
                  <input
                    type="text"
                    name="subalterno"
                    value={formData.subalterno}
                    onChange={handleInputChange}
                    placeholder="1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    placeholder="A/2"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comune
                  </label>
                  <input
                    type="text"
                    name="comune"
                    value={formData.comune}
                    onChange={handleInputChange}
                    placeholder="ROMA"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia
                  </label>
                  <input
                    type="text"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleInputChange}
                    placeholder="RM"
                    maxLength={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <button
                onClick={() => setStep("proof")}
                disabled={!formData.foglio || !formData.particella || !formData.categoria || !formData.comune || !formData.provincia}
                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continua
              </button>
            </div>
          )}

          {/* Step 3: Generate Proof */}
          {step === "proof" && (
            <div className="text-center py-4">
              <h2 className="text-xl font-semibold mb-4">Genera Prova TLS Notary</h2>
              <p className="text-gray-600 mb-6">
                In produzione, qui si collegherebbe a sister.agenziaentrate.gov.it 
                tramite TLS Notary per generare una prova crittografica della proprietà.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Demo Mode:</strong> Per l&apos;hackathon, genereremo una proof mock.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">Riepilogo dati:</p>
                <p className="text-sm text-gray-600">
                  {formData.comune} ({formData.provincia}) - Foglio {formData.foglio}, 
                  Particella {formData.particella}, Sub. {formData.subalterno || "N/A"}
                </p>
                <p className="text-sm text-gray-600">Categoria: {formData.categoria}</p>
              </div>
              
              <button
                onClick={handleGenerateProof}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Genera Proof (Mock)
              </button>
              
              <button
                onClick={() => setStep("data")}
                className="mt-3 w-full py-2 text-gray-600 hover:text-gray-800"
              >
                ← Modifica dati
              </button>
            </div>
          )}

          {/* Step 4: Confirm & Submit */}
          {step === "confirm" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Conferma Registrazione</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Proprietà:</p>
                <p className="text-sm text-gray-600">
                  {formData.comune} ({formData.provincia})
                </p>
                <p className="text-sm text-gray-600">
                  Foglio {formData.foglio}, Particella {formData.particella}, 
                  Sub. {formData.subalterno || "N/A"}
                </p>
                <p className="text-sm text-gray-600">Categoria: {formData.categoria}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Proof Hash:</p>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {proofHash}
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">
                    Errore: {error.message}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={isPending || !register}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isPending ? "Registrazione in corso..." : "Registra On-Chain"}
              </button>
              
              <button
                onClick={() => setStep("proof")}
                disabled={isPending}
                className="mt-3 w-full py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400"
              >
                ← Indietro
              </button>
            </div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Proprietà Registrata!</h2>
              <p className="text-gray-600 mb-6">
                La tua proprietà è stata registrata on-chain con successo.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Nota: Un admin dovrà verificare la proof prima che tu possa aprire un vault.
              </p>
              <a
                href="/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Vai alla Dashboard
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
