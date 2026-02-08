"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextType {
  closedVaults: Set<string>;
  markVaultClosed: (vaultId: bigint) => void;
  isVaultClosedDemo: (vaultId: bigint) => boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [closedVaults, setClosedVaults] = useState<Set<string>>(new Set());

  const markVaultClosed = (vaultId: bigint) => {
    setClosedVaults(prev => new Set(prev).add(vaultId.toString()));
  };

  const isVaultClosedDemo = (vaultId: bigint) => {
    return closedVaults.has(vaultId.toString());
  };

  return (
    <DemoContext.Provider value={{ closedVaults, markVaultClosed, isVaultClosedDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
