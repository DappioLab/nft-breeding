import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { IDL as nftBreedingIDL  } from "../target/types/nft_breeding";
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
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    nftBreedingSDK.NFT_BREEDING_PROGRAM_ID,
    provider
  );

  // SolMeet DAO#2
  const parentAMint = new PublicKey(
    "5UeK5Fp26AfMsFiCnyVtCE6fdxVTwFcUnkXiaD3RkaXM"
  );
  const parentAUri = "https://arweave.net/dHHQ9XVgVg2livoX3De5WCiYH8an1CgCjmxAHShST4I";
  const parentAUriPath = "./uri/parentAUri.json"
  let parentAAttributes: string[] = [];

  // SolMeet DAO#3
  const parentBMint = new PublicKey(
    "6qMCTTfjR9W8tkrLCXYNjUMxid8kD3SM7ZHXMGJ78Afa"
  );
  const parentBUri = "https://arweave.net/C_KjdIPznqFdX1H4oEf_oV_lMr48S9jUmdjInubPTlI";
  const parentBUriPath = "./uri/parentBUri.json"
  let parentBAttributes: string[] = [];

  const childMint = Keypair.generate();
  const childUri = "";
  
  it("Read token metadata",async () => {
    parentAAttributes = nftBreedingSDK.readAttrsFromUri(parentAUriPath);
    parentBAttributes = nftBreedingSDK.readAttrsFromUri(parentBUriPath);
    console.log("parent A attributes:\n",parentAAttributes);
    console.log("parent B attributes:\n",parentBAttributes);
  });

  // it("Initialize", async()=>{
  //   // initialize parent A
  //   const initializeATxn = await nftBreedingSDK.initializeTxn(wallet.publicKey, parentAMint, parentAAttributes, provider);
    
  //   // initializeATxn.feePayer = wallet.publicKey;
  //   // initializeATxn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
  //   // console.log(initializeATxn.serializeMessage().toString("base64"));

  //   const resultA = await provider.sendAndConfirm(initializeATxn);
  //   console.log("initialize parent A txn:", resultA);

  //   // initialize parent B
  //   const initializeBTxn = await nftBreedingSDK.initializeTxn(wallet.publicKey, parentBMint, parentBAttributes, provider);
    
  //   // initializeBTxn.feePayer = wallet.publicKey;
  //   // initializeBTxn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
  //   // console.log(initializeBTxn.serializeMessage().toString("base64"));

  //   const resultB = await provider.sendAndConfirm(initializeBTxn);
  //   console.log("initialize parent B txn:", resultB);


  //   console.log("\n===============\n")

  //   console.log("Parent A:")
  //   const parentABreedingMeta = await nftBreedingSDK.fetchBreedingMetaByMint(parentAMint, provider);
  //   console.log(parentABreedingMeta)
  //   console.log("attributes:");
  //   // @ts-ignore
  //   parentABreedingMeta?.account.attributes.forEach((trait)=>{
  //     console.log(Buffer.from(trait).toString("utf-8"))
  //   })

  //   console.log("\nParent B:")
  //   const parentBBreedingMeta = await nftBreedingSDK.fetchBreedingMetaByMint(parentBMint, provider);
  //   console.log(parentBBreedingMeta)
  //   console.log("attributes:");
  //   // @ts-ignore
  //   parentBBreedingMeta?.account.attributes.forEach((trait)=>{
  //     console.log(Buffer.from(trait).toString("utf-8"))
  //   })
  // });

  // it("Compute", async()=>{
  //   const conputeTxn = await nftBreedingSDK.computeTxn(wallet.publicKey, parentAMint, parentBMint, childMint.publicKey, provider);

  //   conputeTxn.feePayer = wallet.publicKey;
  //   conputeTxn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
  //   console.log(conputeTxn.serializeMessage().toString("base64"));

  //   const result = await provider.sendAndConfirm(conputeTxn, [wallet.payer, childMint]);
  //   console.log("compute txn:", result);

  //   console.log("\nChild:")
  //   const childBreedingMeta = await nftBreedingSDK.fetchBreedingMetaByParent(parentAMint ,parentBMint, provider);
  //   console.log(childBreedingMeta)
  //   console.log("attributes:");
  //   // @ts-ignore
  //   childBreedingMeta?.account.attributes.forEach((trait)=>{
  //     console.log(Buffer.from(trait).toString("utf-8"))
  //   });
  // });

  it("Mint Child", async()=>{
    // if you run it second time childMint might be different,
    // use fetch to get the key which is written in BreedingMeta account
    const childBreedingMeta = await nftBreedingSDK.fetchBreedingMetaByParent(parentAMint ,parentBMint, provider);
    const _childMint = childBreedingMeta.account.mint;

    const mintChildTxn = await nftBreedingSDK.mintChildTxn(wallet.publicKey, _childMint, parentAMint, parentBMint, provider);
    mintChildTxn.feePayer = wallet.publicKey;
    mintChildTxn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    console.log(mintChildTxn.serializeMessage().toString("base64"));

    const result = await provider.sendAndConfirm(mintChildTxn, [wallet.payer]);
    console.log("compute txn:", result);
  });

  // it("Update URI", async()=>{
  //   const childBreedingMeta = await nftBreedingSDK.fetchBreedingMetaByParent(parentAMint ,parentBMint, provider);
  //   const _childMint = childBreedingMeta.account.mint;

  //   const updateUri = await nftBreedingSDK.updateUriTxn(wallet.publicKey, _childMint, childUri, provider);
  //   updateUri.feePayer = wallet.publicKey;
  //   updateUri.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
  //   console.log(updateUri.serializeMessage().toString("base64"));

  //   const result = await provider.sendAndConfirm(updateUri, [wallet.payer]);
  //   console.log("compute txn:", result);
  // });
});