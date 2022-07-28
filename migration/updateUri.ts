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

  it("Update URI", async()=>{
    const childBreedingMeta = await nftBreedingSDK.fetchBreedingMetaByParent(parentAMint ,parentBMint, provider);
    const _childMint = childBreedingMeta!.account.mint;

    const updateUri = await nftBreedingSDK.updateUriTxn(wallet.publicKey, _childMint, childUri, provider);
    updateUri.feePayer = wallet.publicKey;
    updateUri.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    console.log(updateUri.serializeMessage().toString("base64"));

    // const result = await provider.sendAndConfirm(updateUri, [wallet.payer]);
    // console.log("update uri txn:", result);
  });
});