import {
    PublicKey,
    Transaction,
    TransactionInstruction,
    SystemProgram,
    Connection,
    SYSVAR_RENT_PUBKEY,
    Keypair,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
  import * as fs from "fs";
  import { AnchorProvider } from "@project-serum/anchor";
  import { NFT_BREEDING_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./ids";
  const ATA_INIT_PROGRAM_ID = new PublicKey(
    "9tiP8yZcekzfGzSBmp7n9LaDHRjxP2w7wJj8tpPJtfG"
  );

  const BREEDING_SEED = "breeding";
  const PREFIX = "metadata";
  const EDITION = "edition";
  
  export async function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [
          walletAddress.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];
  }
  
  export async function createATAWithoutCheckIx(
    wallet: PublicKey,
    mint: PublicKey,
    payer?: PublicKey
  ): Promise<TransactionInstruction> {
    if (payer === undefined) {
      payer = wallet as PublicKey;
    }
    payer = payer as PublicKey;
    const ATA = await findAssociatedTokenAddress(wallet, mint);
    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: ATA, isSigner: false, isWritable: true },
      { pubkey: wallet, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];
    return new TransactionInstruction({
      keys,
      programId: ATA_INIT_PROGRAM_ID,
    });
  }

  export async function findBreedingMeta(
    userKey: PublicKey,
    nftMint: PublicKey
  ){
    return await PublicKey.findProgramAddress(
          [
            Buffer.from(BREEDING_SEED),
            userKey.toBuffer(),
            nftMint.toBuffer(),
          ],
          NFT_BREEDING_PROGRAM_ID
        )
      ;
  }
  
  export async function findTokenMetadataAddress(
    nftMint: PublicKey
  ){
    const seeds = [
        Buffer.from(PREFIX),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(), 
        nftMint.toBuffer()
    ];
    
    return await PublicKey.findProgramAddress(
        seeds,
        TOKEN_METADATA_PROGRAM_ID
      )
    ;
  }

  export async function findMasterEditionAddress(
    nftMint: PublicKey
  ){
    const seeds = [
        Buffer.from(PREFIX),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(), 
        nftMint.toBuffer(),
        Buffer.from(EDITION)
    ];
    
    return await PublicKey.findProgramAddress(
        seeds,
        TOKEN_METADATA_PROGRAM_ID
      )
    ;
  }

  export function readAttrsFromUri(
    path: string,
  ): string[] {
    const attribute: string[] = [];
  
    const rawData = fs.readFileSync(path, "utf-8");
    const data: nftMint = JSON.parse(rawData);
    data.attributes.forEach((element) => {
        attribute.push(element.value);
    });
  
    return attribute;
  }

  interface nftMint {
    name: string;
    symbol: string;
    description: string;
    seller_fee_basis_points: string;
    external_url: string;
    attributes: attribute[];
    collection: collecntion;
    properties: properties;
  }

  interface attribute {
    trait_type: string;
    value: string;
  }
  interface collecntion {
    name: string;
    family: string;
  }
  interface properties {
    files: file[];
    category: string;
    maxSupply: number;
    creators: creator;
    image: string;
  }
  interface file {
    uri: string;
    type: string;
  }
  interface creator {
    address: string;
    share: number;
  }