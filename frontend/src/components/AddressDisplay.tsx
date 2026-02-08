"use client"

import { useEnsForAddress, truncateAddress } from "@/hooks/useEns";


interface AddressDisplayProps {
    address: `0x${string}`;
    showAvatar?: boolean;
    className?: string;
    linkToEtherscan?: boolean;
}

export function AddressDisplay({
    address,
    showAvatar = false,
    className = "",
    linkToEtherscan = false
}: AddressDisplayProps) {
    const { ensName, isLoading } = useEnsForAddress(address);

    const displayText = ensName || truncateAddress(address);

    const content = (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            { showAvatar && (
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
            )}
            <span className={`${ensName ? "font-medium text-white" : "font-mono text-sm text-white/80"}`}>
                {isLoading ? truncateAddress(address): displayText}
            </span>
            {ensName && (
                <span className="text-xs text-white/40 font-mono">
                    ({truncateAddress(address)})
                </span>
            )}
        </span>
    );

    if(linkToEtherscan){
        return (
            <a
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors duration-200"
            >
                {content}
            </a>
        )
    }

    return content;
}
