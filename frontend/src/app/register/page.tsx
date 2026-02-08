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
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Register Property</h1>
        <p className="text-white/60 mb-8">
          Register your property on-chain using TLS Notary proof
        </p>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {(["connect", "data", "proof", "confirm", "success"] as const).map((s, i, arr) => {
            const currentIndex = arr.indexOf(step);
            const isCompleted = currentIndex > i;
            const isCurrent = step === s;

            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shrink-0
                  ${isCurrent ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]" :
                    isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-white/[0.05] text-white/50 border border-white/[0.1]"}
                `}>
                  {isCompleted ? "✓" : i + 1}
                </div>
                {i < arr.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${isCompleted ? "bg-green-500" : "bg-white/[0.1]"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-6 animate-[scale-in_0.3s_ease-out_forwards]">
          
          {/* Step 1: Connect Wallet */}
          {step === "connect" && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Connect Wallet</h2>
              <p className="text-white/60 mb-6">
                To register a property, you must first connect your wallet.
              </p>
              <p className="text-sm text-white/40">
                Use the &quot;Connect Wallet&quot; button in the top right corner
              </p>
            </div>
          )}

          {/* Step 2: Property Data */}
          {step === "data" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Cadastral Data</h2>
              <p className="text-white/60 mb-6">
                Enter your property&apos;s cadastral information
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
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
                  <label className="block text-sm font-medium text-white/70 mb-1">
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
                  <label className="block text-sm font-medium text-white/70 mb-1">
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
                  <label className="block text-sm font-medium text-white/70 mb-1">
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
                  <label className="block text-sm font-medium text-white/70 mb-1">
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
                  <label className="block text-sm font-medium text-white/70 mb-1">
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
                className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Generate Proof */}
          {step === "proof" && (
            <div className="text-center py-4">
              <h2 className="text-xl font-semibold mb-4 text-white">Generate TLS Notary Proof</h2>
              <p className="text-white/60 mb-6">
                In production, this would connect to sister.agenziaentrate.gov.it
                via TLS Notary to generate a cryptographic proof of ownership.
              </p>


              <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium text-white/70 mb-2">Data summary:</p>
                <p className="text-sm text-white/60">
                  {formData.comune} ({formData.provincia}) - Sheet {formData.foglio},
                  Parcel {formData.particella}, Sub. {formData.subalterno || "N/A"}
                </p>
                <p className="text-sm text-white/60">Category: {formData.categoria}</p>
              </div>

              <button
                onClick={handleGenerateProof}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Generate Proof 
              </button>

              <button
                onClick={() => setStep("data")}
                className="mt-3 w-full py-2 text-white/50 hover:text-white transition-colors inline-flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Edit data
              </button>
            </div>
          )}

          {/* Step 4: Confirm & Submit */}
          {step === "confirm" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Confirm Registration</h2>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-white/70 mb-2">Property:</p>
                <p className="text-sm text-white/60">
                  {formData.comune} ({formData.provincia})
                </p>
                <p className="text-sm text-white/60">
                  Sheet {formData.foglio}, Parcel {formData.particella},
                  Sub. {formData.subalterno || "N/A"}
                </p>
                <p className="text-sm text-white/60">Category: {formData.categoria}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-white/70 mb-2">Proof Hash:</p>
                <p className="text-xs text-cyan-400 font-mono break-all">
                  {proofHash}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-400 text-sm">
                    Error: {error.message}
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isPending || isConfirming || !register}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
              >
                {isPending ? "Signing..."
                : isConfirming
                  ? "Confirming transaction..."
                  : "Register On-Chain"
                }
              </button>
              {isConfirming && (
                <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-cyan-400 text-sm text-center flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Transaction submitted, waiting for on-chain confirmation...
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep("proof")}
                disabled={isPending}
                className="mt-3 w-full py-2 text-white/50 hover:text-white transition-colors disabled:text-white/30 inline-flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-[scale-in_0.3s_ease-out_forwards]">
                <span className="text-3xl text-green-400">✓</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-white">Property Registered!</h2>
              <p className="text-white/60 mb-6">
                Your property has been successfully registered on-chain.
              </p>
              <p className="text-sm text-white/40 mb-6">
                Note: An admin will need to verify the proof before you can open a vault.
              </p>
              <a
                href="/dashboard"
                className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 transition-all duration-300"
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
