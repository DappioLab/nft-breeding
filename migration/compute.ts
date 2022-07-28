import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { IDL as nftBreedingIDL  } from "../target/types/nft_breeding";
import { getAccount } from "@solana/spl-token";
import { assert } from "chai";
import * as nftBreedingSDK from "../ts"
import {parentAMint, parentAUriPath, parentBMint, parentBUriPath, childMint, childUri, connection} from "./setting"

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

  it("Compute", async()=>{
    const conputeTxn = await nftBreedingSDK.computeTxn(wallet.publicKey, parentAMint, parentBMint, childMint.publicKey, provider);

    conputeTxn.feePayer = wallet.publicKey;
    conputeTxn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    console.log(conputeTxn.serializeMessage().toString("base64"));

    const result = await provider.sendAndConfirm(conputeTxn, [wallet.payer, childMint]);
    console.log("compute txn:", result);

    console.log("\nChild:")
    const childBreedingMeta = await nftBreedingSDK.fetchBreedingMetaByParent(parentAMint ,parentBMint, provider);
    console.log(childBreedingMeta)
    console.log("attributes:");
    // @ts-ignore
    childBreedingMeta?.account.attributes.forEach((trait)=>{
      console.log(Buffer.from(trait).toString("utf-8"))
    });
  });
});