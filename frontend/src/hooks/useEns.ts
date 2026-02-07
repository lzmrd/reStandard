// frontend/src/hooks/useEns.ts
"use client"

import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

// Client viem dedicato per ENS su Sepolia
const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
});

/**
 * Risolve un indirizzo in nome ENS su Sepolia
 */
export function useEnsForAddress(address: `0x${string}` | undefined) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setEnsName(null);
      setEnsAvatar(null);
      return;
    }

    const resolve = async () => {
      setIsLoading(true);
      try {
        // Reverse resolution: address -> name
        const name = await sepoliaClient.getEnsName({
          address,
        });
        
        console.log("ENS Resolution:", { address, name });
        setEnsName(name);

        // Se abbiamo un nome, prova a prendere l'avatar
        if (name) {
          try {
            const avatar = await sepoliaClient.getEnsAvatar({
              name: normalize(name),
            });
            setEnsAvatar(avatar);
          } catch {
            // Avatar non trovato, ignora
          }
        }
      } catch (error) {
        console.error("ENS resolution error:", error);
        setEnsName(null);
      } finally {
        setIsLoading(false);
      }
    };

    resolve();
  }, [address]);

  return { ensName, ensAvatar, isLoading };
}

/**
 * Risolve un nome ENS in indirizzo
 */
export function useAddressForEns(name: string | undefined) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!name) {
      setAddress(null);
      return;
    }

    const resolve = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resolved = await sepoliaClient.getEnsAddress({
          name: normalize(name),
        });
        setAddress(resolved);
      } catch (err) {
        setError(err as Error);
        setAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    resolve();
  }, [name]);

  return { address, isLoading, error };
}

export function formatAddress(address: string, ensName?: string | null): string {
  if (ensName) return ensName;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
