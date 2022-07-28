import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { IDL as nftBreedingIDL  } from "../target/types/nft_breeding";
import { getAccount } from "@solana/spl-token";
import { assert } from "chai";
import * as nftBreedingSDK from "../ts"
import {parentAMint, parentAUriPath, parentBMint, parentBUriPath, childMint, childUri, connection, collectionName, collectionSymbol} from "./setting"

describe("NFT Breeding", () => {
  const options = anchor.AnchorProvider.defaultOptions();
  const wallet = NodeWallet.local();
  const provider = new anchor.AnchorProvider(connection, wallet, options);

  anchor.setProvider(provider);
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    nftBreedingSDK.NFT_BREEDING_PROGRAM_ID,
    provider
  );

  let parentAAttributes: string[] = [];
  let parentBAttributes: string[] = [];
  
  it("Read token metadata",async () => {
    parentAAttributes = nftBreedingSDK.readAttrsFromUri(parentAUriPath);
    parentBAttributes = nftBreedingSDK.readAttrsFromUri(parentBUriPath);
    console.log("parent A attributes:\n",parentAAttributes);
    console.log("parent B attributes:\n",parentBAttributes);
  });

  it("Initialize", async()=>{
    // initialize parent A
    const initializeATxn = await nftBreedingSDK.initializeTxn(wallet.publicKey, parentAMint,collectionName, collectionSymbol, parentAAttributes, provider);
    
    initializeATxn.feePayer = wallet.publicKey;
    initializeATxn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    console.log(initializeATxn.serializeMessage().toString("base64"));

    const resultA = await provider.sendAndConfirm(initializeATxn);
    console.log("initialize parent A txn:", resultA);

    // initialize parent B
    const initializeBTxn = await nftBreedingSDK.initializeTxn(wallet.publicKey, parentBMint,collectionName,collectionSymbol, parentBAttributes, provider);
    
    initializeBTxn.feePayer = wallet.publicKey;
    initializeBTxn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    console.log(initializeBTxn.serializeMessage().toString("base64"));

    const resultB = await provider.sendAndConfirm(initializeBTxn);
    console.log("initialize parent B txn:", resultB);


    console.log("\n===============\n")

    console.log("Parent A:")
    const parentABreedingMeta = await nftBreedingSDK.fetchBreedingMetaByMint(parentAMint, provider);
    console.log(parentABreedingMeta)
    console.log("attributes:");
    // @ts-ignore
    parentABreedingMeta?.account.attributes.forEach((trait)=>{
      console.log(Buffer.from(trait).toString("utf-8"))
    })

    console.log("\nParent B:")
    const parentBBreedingMeta = await nftBreedingSDK.fetchBreedingMetaByMint(parentBMint, provider);
    console.log(parentBBreedingMeta)
    console.log("attributes:");
    // @ts-ignore
    parentBBreedingMeta?.account.attributes.forEach((trait)=>{
      console.log(Buffer.from(trait).toString("utf-8"))
    })
  });
});