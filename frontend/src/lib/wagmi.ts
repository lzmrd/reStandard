import { http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arcTestnet } from "./chains";

export const config = getDefaultConfig({
  appName: "reStandard",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [arcTestnet, mainnet],
  transports: {
    [arcTestnet.id]: http("https://sepolia.base.org"),
    [mainnet.id]: http("https://eth.llamarpc.com"),
  },
  ssr: true,
});
