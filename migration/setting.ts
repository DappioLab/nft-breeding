import { Connection, Commitment, PublicKey, Keypair } from "@solana/web3.js";

// Initialize setting
// SolMeet DAO#4
export const parentAMint = new PublicKey(
  "B3YyjQboa94cC8FpLJvA3tggTGVkWj7U7wKChGH8n67S"
);
export const parentAUri = "https://arweave.net/UNvkUJj3uNU9rRxGrp5om2JyC0QDW-DCZkXB4Q427gs";
export const parentAUriPath = "./uri/parentAUri.json"

// SolMeet DAO#5
export  const parentBMint = new PublicKey(
  "FWF28SJuWHnyRKkLKk7pt5umsw86tcPmzVXzsb2AB5dQ"
);
export const parentBUri = "https://arweave.net/V0_nkGdRNEdggue1B-w9jdtqVvs1uVLkPPZjjYs6n3s";
export const parentBUriPath = "./uri/parentBUri.json"

export const childMint = Keypair.generate();
export const childUri = "solmeet";

export const collectionName = "SolMeet DAO";
export const collectionSymbol = "SMD";

// Configure connection
export const commitment: Commitment = "processed";

// ENDPOINT: epoch mainnet fork
export const connection = new Connection("https://rpc-mainnet-fork.epochs.studio", {
    commitment: "confirmed",
    wsEndpoint: "wss://rpc-mainnet-fork.epochs.studio/ws",
  });