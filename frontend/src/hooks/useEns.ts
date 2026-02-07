"use client"

import { useEnsName, useEnsAvatar, useEnsAddress } from "wagmi";
import { mainnet   } from "wagmi/chains";

/**
 * Risolve un indirizzo in nome ENS
 * Nota: ENS funziona solo su mainnet
 */
export function useEnsForAddress(address: `0x${string}` | undefined){
    const { data: ensName, isLoading: isLoadingName } = useEnsName({
        address,
        chainId: mainnet.id,
    });

    const { data: ensAvatar, isLoading: isLoadingAvatar } = useEnsAvatar({
        name: ensName ?? undefined,
        chainId: mainnet.id,      
    })

    return { ensName, ensAvatar, isLoading: isLoadingName || isLoadingAvatar};
}

/**
 * Risolve un nome ENS in indirizzo
 */
export function useAddressForEns(name: string | undefined) {
    const { data: address, isLoading, error } = useEnsAddress({
        name,
        chainId: mainnet.id,
    });
    return { address, isLoading, error };
}

/**
 * Formatta un indirizzo: mostra ens se disponibile,altrimenti tronca
 */
export function formatAddress(address: string, ensName?: string | null): string {
    if (ensName) return ensName;
    return `${address.slice(0,6)}...${address.slice(-4)}`;
}

/**
 * Tronca un indirizzo senza ENS
 */
export function truncateAddress(address:string): string {
    return `${address.slice(0,6)}...${address.slice(-4)}`;
}