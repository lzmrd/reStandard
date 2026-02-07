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
  
  const { register, isPending, isConfirming, isSuccess, error } = useRegisterProperty();

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
        <h1 className="text-3xl font-bold mb-2">Register Property</h1>
        <p className="text-gray-600 mb-8">
          Register your property on-chain using TLS Notary proof
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
              <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
              <p className="text-gray-600 mb-6">
                To register a property, you must first connect your wallet.
              </p>
              <p className="text-sm text-gray-500">
                Use the &quot;Connect Wallet&quot; button in the top right corner
              </p>
            </div>
          )}

          {/* Step 2: Property Data */}
          {step === "data" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Cadastral Data</h2>
              <p className="text-gray-600 mb-6">
                Enter your property&apos;s cadastral information
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sheet (Foglio)
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
                    Parcel (Particella)
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
                    Sub-unit (Subalterno)
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
                    Category
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
                    Municipality (Comune)
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
                    Province
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
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Generate Proof */}
          {step === "proof" && (
            <div className="text-center py-4">
              <h2 className="text-xl font-semibold mb-4">Generate TLS Notary Proof</h2>
              <p className="text-gray-600 mb-6">
                In production, this would connect to sister.agenziaentrate.gov.it
                via TLS Notary to generate a cryptographic proof of ownership.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Demo Mode:</strong> For the hackathon, we will generate a mock proof.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">Data summary:</p>
                <p className="text-sm text-gray-600">
                  {formData.comune} ({formData.provincia}) - Sheet {formData.foglio},
                  Parcel {formData.particella}, Sub. {formData.subalterno || "N/A"}
                </p>
                <p className="text-sm text-gray-600">Category: {formData.categoria}</p>
              </div>
              
              <button
                onClick={handleGenerateProof}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Generate Proof (Mock)
              </button>
              
              <button
                onClick={() => setStep("data")}
                className="mt-3 w-full py-2 text-gray-600 hover:text-gray-800"
              >
                ← Edit data
              </button>
            </div>
          )}

          {/* Step 4: Confirm & Submit */}
          {step === "confirm" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Confirm Registration</h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Property:</p>
                <p className="text-sm text-gray-600">
                  {formData.comune} ({formData.provincia})
                </p>
                <p className="text-sm text-gray-600">
                  Sheet {formData.foglio}, Parcel {formData.particella},
                  Sub. {formData.subalterno || "N/A"}
                </p>
                <p className="text-sm text-gray-600">Category: {formData.categoria}</p>
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
                    Error: {error.message}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={isPending || isConfirming || !register}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isPending ? "Signing..."
                : isConfirming
                  ? "Confirming transaction..."
                  : "Register On-Chain"
                }

              </button>
              {isConfirming && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm text-center">
                    ⏳ Transaction submitted, waiting for on-chain confirmation...
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep("proof")}
                disabled={isPending}
                className="mt-3 w-full py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Property Registered!</h2>
              <p className="text-gray-600 mb-6">
                Your property has been successfully registered on-chain.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Note: An admin will need to verify the proof before you can open a vault.
              </p>
              <a
                href="/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Go to Dashboard
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
