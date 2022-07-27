import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { getAccount } from "@solana/spl-token";
import { assert } from "chai";
import * as nftBreedingSDK from "../ts"

describe("NFT Breeding", () => {
  // const connection = new Connection("https://rpc-mainnet-fork.dappio.xyz", {
  //   commitment,
  //   wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
  // });
  const connection = new Connection("https://rpc-mainnet-fork.epochs.studio", {
    commitment: "confirmed",
    wsEndpoint: "wss://rpc-mainnet-fork.epochs.studio/ws",
  });
  // const connection = new Connection("https://solana-api.tt-prod.net", {
  //   commitment: "confirmed",
  //   confirmTransactionInitialTimeout: 180 * 1000,
  // });
  // const connection = new Connection("https://ssc-dao.genesysgo.net", {
  //   commitment: "confirmed",
  //   confirmTransactionInitialTimeout: 180 * 1000,
  // });
  // const connection = new Connection("https:////api.mainnet-beta.solana.com", {
  //   commitment: "confirmed",
  //   confirmTransactionInitialTimeout: 180 * 1000,
  // });

  const options = anchor.AnchorProvider.defaultOptions();
  const wallet = NodeWallet.local();
  const provider = new anchor.AnchorProvider(connection, wallet, options);

  anchor.setProvider(provider);

  // SolMeet DAO#0
  const parentAMint = new PublicKey(
    "Evo6Dhsrqn8GrrU5AaawAJgiFtKCcjLPw9QKRapsHhmK"
  );
  const parentAUri = "https://arweave.net/QpiIsbFE4OWAsuF75J6AukNlUbYg2lxE7teCxi-TzcQ";
  const parentAUriPath = "./uri/parentAUri.json"
  let parentAAttributes: string[] = [];

  // SolMeet DAO#1
  const parentBMint = new PublicKey(
    "D1kqUW2N67BiDsgXMA6gZeQ4CNFciZKmcxJV3ThnCtLd"
  );
  const parentBUri = "https://arweave.net/YmrEAavNz-fTszq12kn7J-BA4pTgA9IHCsiaSH9feCg";
  const parentBUriPath = "./uri/parentBUri.json"
  let parentBAttributes: string[] = [];
  
  it("Read token metadata",async () => {
    parentAAttributes = nftBreedingSDK.readAttrsFromUri(parentAUriPath);
    parentBAttributes = nftBreedingSDK.readAttrsFromUri(parentBUriPath);
    console.log("parent A attributes:\n",parentAAttributes);
    console.log("parent B attributes:\n",parentBAttributes);
  });

  it("Initialize", async()=>{
    // const initializeTxn = await nftBreedingSDK.initializeTxn(wallet.publicKey, parentAMint, parentAAttributes, provider);
    // console.log(initializeTxn)
  });

  it("Compute", async()=>{
    
  });

  it("Mint Child", async()=>{
    
  });

  it("Update URI", async()=>{
    
  });
});