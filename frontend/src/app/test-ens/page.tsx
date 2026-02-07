"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { useEnsForAddress, useAddressForEns } from "@/hooks/useEns";

export default function TestEnsPage() {
  // Test: risolvi indirizzo noto (vitalik)
  const vitalikAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as `0x${string}`;
  const { ensName, ensAvatar, isLoading: loadingName } = useEnsForAddress(vitalikAddress);
  
  // Test: risolvi nome ENS
  const { address: resolvedAddress, isLoading: loadingAddress } = useAddressForEns("vitalik.eth");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Test ENS Integration</h1>
        
        {/* Test 1: Address → ENS Name */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Test 1: Address → ENS Name</h2>
          <p className="text-sm text-gray-600 mb-2 font-mono break-all">
            Input: {vitalikAddress}
          </p>
          <div className="bg-gray-50 p-4 rounded">
            {loadingName ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <>
                <p><strong>ENS Name:</strong> {ensName || "Not found"}</p>
                <p><strong>Avatar:</strong> {ensAvatar || "None"}</p>
              </>
            )}
          </div>
          <p className="text-xs text-green-600 mt-2">
            ✓ Expected: vitalik.eth
          </p>
        </div>

        {/* Test 2: ENS Name → Address */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Test 2: ENS Name → Address</h2>
          <p className="text-sm text-gray-600 mb-2">Input: vitalik.eth</p>
          <div className="bg-gray-50 p-4 rounded">
            {loadingAddress ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <p className="font-mono text-sm break-all">
                <strong>Address:</strong> {resolvedAddress || "Not found"}
              </p>
            )}
          </div>
          <p className="text-xs text-green-600 mt-2">
            ✓ Expected: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
          </p>
        </div>

        {/* Status */}
        <div className={`p-4 rounded-lg text-center ${
          ensName === "vitalik.eth" && resolvedAddress 
            ? "bg-green-100 text-green-800" 
            : loadingName || loadingAddress
            ? "bg-blue-100 text-blue-800"
            : "bg-red-100 text-red-800"
        }`}>
          {loadingName || loadingAddress ? (
            <p>⏳ Loading ENS data...</p>
          ) : ensName === "vitalik.eth" && resolvedAddress ? (
            <p className="text-lg font-bold">✅ ENS Integration funziona!</p>
          ) : (
            <p>❌ ENS non funziona - controlla la configurazione</p>
          )}
        </div>
      </main>
    </div>
  );
}
