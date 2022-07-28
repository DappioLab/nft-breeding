import * as anchor from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  MemcmpFilter,
  GetProgramAccountsConfig,
  DataSizeFilter,
  Keypair
} from "@solana/web3.js";
import { createInitializeMintInstruction, createMint, createMintToInstruction, getAccount, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL as nftBreedingIDL  } from "../target/types/nft_breeding";
import {
  NFT_BREEDING_PROGRAM_ID,
} from "./ids";
import * as ixns from "./instruction";

export async function initializeTxn(
  userKey: PublicKey,
  nftMint: PublicKey,
  name: string,
  symbol: string,
  attributes: string[], 
  provider: anchor.AnchorProvider
  ){
    const tx = new Transaction();

    const initializeIx = await ixns.initializeIx(userKey, nftMint,name,symbol, attributes, provider);

    tx.add(initializeIx);

  return tx;
}

export async function computeTxn(
  userKey: PublicKey, 
  parentAMint: PublicKey, 
  parentBMint: PublicKey,
  childMint: PublicKey,
  provider: anchor.AnchorProvider
  ){
    const tx = new Transaction();

    const computeIx = await ixns.computeIx(userKey, parentAMint, parentBMint, childMint, provider);

    computeIx.forEach((ix)=>{
        tx.add(ix);
    })

  return tx;
}

export async function mintChildTxn(
  userKey: PublicKey,
  childNftMint: PublicKey,
  parentAMint: PublicKey,
  parentBMint: PublicKey,
  provider: anchor.AnchorProvider
  ){
    const tx = new Transaction();

    const mintChildIx = await ixns.mintChildIx(userKey, childNftMint, parentAMint, parentBMint, provider);

    mintChildIx.forEach((ix)=>{
        tx.add(ix);
    })

  return tx;
}

export async function updateUriTxn(
  userKey: PublicKey, 
  nftMint: PublicKey, 
  updateUri: string,
  provider: anchor.AnchorProvider
  ){
    const tx = new Transaction();

    const updateUriIx = await ixns.updateUriIx(
        userKey, 
        nftMint, 
        updateUri,
        provider
        );

    tx.add(updateUriIx);

  return tx;
}