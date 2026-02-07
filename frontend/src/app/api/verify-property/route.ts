import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { ADDRESSES } from "@/abi/addresses";

const PropertyRegistryABI = [
  {
    name: "verifyProperty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "propertyId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getProperty",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "propertyId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "foglio", type: "string" },
          { name: "particella", type: "string" },
          { name: "subalterno", type: "string" },
          { name: "categoria", type: "string" },
          { name: "comune", type: "string" },
          { name: "provincia", type: "string" },
          { name: "proofHash", type: "bytes32" },
          { name: "registeredAt", type: "uint256" },
          { name: "verified", type: "bool" },
        ],
      },
    ],
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const { propertyId } = await request.json();

    if (propertyId === undefined) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 }
      );
    }

    // Verifier private key (server-side only!)
    const verifierPrivateKey = process.env.VERIFIER_PRIVATE_KEY;
    if (!verifierPrivateKey) {
      return NextResponse.json(
        { error: "Verifier not configured" },
        { status: 500 }
      );
    }

    const account = privateKeyToAccount(verifierPrivateKey as `0x${string}`);

    // Create clients
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    });

    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    });

    // 1. Fetch property data (simulate checking the proof)
    const property = await publicClient.readContract({
      address: ADDRESSES.sepolia.propertyRegistry,
      abi: PropertyRegistryABI,
      functionName: "getProperty",
      args: [BigInt(propertyId)],
    });

    if (property.verified) {
      return NextResponse.json(
        { error: "Property already verified" },
        { status: 400 }
      );
    }

    // 2. Simulate TLS Notary proof verification (2 second delay)
    console.log(`[Verifier] Verifying proof for property #${propertyId}...`);
    console.log(`[Verifier] ProofHash: ${property.proofHash}`);
    console.log(`[Verifier] Location: ${property.comune}, ${property.provincia}`);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // In production: here we would verify the actual TLS Notary proof
    // For now, we simulate success
    console.log(`[Verifier] Proof verified successfully!`);

    // 3. Call verifyProperty on-chain
    const hash = await walletClient.writeContract({
      address: ADDRESSES.sepolia.propertyRegistry,
      abi: PropertyRegistryABI,
      functionName: "verifyProperty",
      args: [BigInt(propertyId)],
    });

    // 4. Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      message: "Property verified successfully",
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (error: unknown) {
    console.error("[Verifier] Error:", error);
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
