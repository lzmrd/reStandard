// frontend/src/lib/wagmi.ts
import { http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arcTestnet } from "./chains";

export const config = getDefaultConfig({
  appName: "reStandard",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [arcTestnet, mainnet, sepolia],
  transports: {
    [arcTestnet.id]: http("https://sepolia.base.org"),
    [mainnet.id]: http("https://eth.llamarpc.com"),
    [sepolia.id]: http("https://rpc.sepolia.org"),  // RPC ufficiale Sepolia
  },
  ssr: true,
});
