"use client"

import { useAddressForEns } from "@/hooks/useEns";
import { useState, useEffect } from "react";
import { isAddress } from "viem";

interface EnsInputProps {
    value: string;
    onChange: (address: `0x${string}` | null, displayValue: string) => void;
    placeholder? : string;
    className?: string;
}

export function EnsInput({
    value,
    onChange,
    placeholder = "0x... or vitalik.eth",
    className = ""
}: EnsInputProps) {
    const [inputValue, setInputValue] = useState(value);
    const isEnsName = inputValue.endsWith(".eth");

    const { address: resolvedAddress, isLoading, error } = useAddressForEns(
        isEnsName ? inputValue : undefined
    );

    useEffect(() => {
        if (isAddress(inputValue)) {
            // Input è già un indirizzo valido
            onChange(inputValue as `0x${string}`, inputValue);
        } else if (isEnsName && resolvedAddress){
            // ENS risolto con successo
            onChange(resolvedAddress, inputValue);
        } else if (!isEnsName && inputValue.length > 0) {
            //Input non valido
            onChange(null, inputValue);
        }
    },  [inputValue, resolvedAddress, isEnsName, onChange]);

    return (
        <div className="relative>">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
            />

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute right-3 top-1/2 -trnsalate-y1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}    

            {/*ENS resolved inficator */}
            {isEnsName && resolvedAddress && !isLoading && (
                <div className="absolute right-3 top 1/2 -transalte-y-1/2 text-green-500">
                    ✓
                </div>
            )}

            {/* Error Indicator */}
            {isEnsName && error && !isLoading && (
                <div className="absolute riiiight-3 top-1/2 -translate-y-1/2 text-red-500">
                    ✗
                </div>
            )}

            {/* Resolved address */}
            {isEnsName && resolvedAddress && ( 
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  → {resolvedAddress.slice(0, 10)}...{resolvedAddress.slice(-8)}
                </p>
            )}

        </div>
    );

}