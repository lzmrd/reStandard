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
    const  { ensName , ensAvatar, isLoading } = useEnsForAddress(address);

    const displayText = ensName || truncateAddress(address);

    const content = (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            { showAvatar && ensAvatar && (
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
            )}
            <span className={ensName ? "font-medium" : "font-mono text-sm"}>
                {isLoading ? truncateAddress(address): displayText}
            </span>
            {ensName && (
                <span className="text-xs text-gray-400 font mono">
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
              className="hover:underline"
            >
                {content}
            </a>
        )
    }

    return content;
}
