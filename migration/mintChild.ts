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

  it("Mint Child", async()=>{
    // if you run it second time childMint might be different,
    // use fetch to get the key which is written in BreedingMeta account
    const childBreedingMeta = await nftBreedingSDK.fetchBreedingMetaByParent(parentAMint ,parentBMint, provider);
    const _childMint = childBreedingMeta!.account.mint;

    const mintChildTxn = await nftBreedingSDK.mintChildTxn(wallet.publicKey, _childMint, parentAMint, parentBMint, provider);
    mintChildTxn.feePayer = wallet.publicKey;
    mintChildTxn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    console.log(mintChildTxn.serializeMessage().toString("base64"));
    
    // const result = await provider.sendAndConfirm(mintChildTxn, [wallet.payer]);
    // console.log("mint child txn:", result);
  });
});