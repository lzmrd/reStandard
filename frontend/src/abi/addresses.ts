export const ADDRESSES = {
  sepolia: {
    resd: "0x710E9965C9f60236188b29C4A9086EAC73540B20" as `0x${string}`,
    propertyRegistry: "0x8Ca32A6e75B21f8090c1ea498b5D3CDE9179c169" as `0x${string}`,
    priceOracle: "0xAf4d629BA2aBf7A60e0229641C2CD4412Ad46af1" as `0x${string}`,
    vaultManager: "0x0Ebf4D83b9Aa7B87eEE241200490473721fCDAcf" as `0x${string}`,
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`,
  },
  circleGateway: {
    wallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as `0x${string}`,
    minter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B" as `0x${string}`,
    apiTestnet: "https://gateway-api-testnet.circle.com/v1",
  },
} as const;
