export const ADDRESSES = {
  arcTestnet: {
    resd: "0x0Ebf4D83b9Aa7B87eEE241200490473721fCDAcf" as `0x${string}`,
    propertyRegistry: "0xD7ABeaa7B02169D09bDF4BC8514A37dD9FCC0c79" as `0x${string}`,
    vaultManager: "0x22776DeC12Ad94d8189464EA207cd58d854F2e0b" as `0x${string}`,
    priceOracle: "0x75FfC777Eb4992663C6cF33d94728ec3FbD6a224" as `0x${string}`,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
  },
  circleGateway: {
    wallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as `0x${string}`,
    minter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B" as `0x${string}`,
    apiTestnet: "https://gateway-api-testnet.circle.com/v1",
  },
} as const;
