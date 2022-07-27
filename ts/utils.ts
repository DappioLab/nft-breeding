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
  import { NFT_BREEDING_PROGRAM_ID } from "./ids";
  const ATA_INIT_PROGRAM_ID = new PublicKey(
    "9tiP8yZcekzfGzSBmp7n9LaDHRjxP2w7wJj8tpPJtfG"
  );

  const BREEDING_SEED = "breeding";
  
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
  ): Promise<PublicKey> {
    return (
        await PublicKey.findProgramAddress(
          [
            Buffer.from(BREEDING_SEED),
            nftMint.toBuffer(),
            userKey.toBuffer(),
          ],
          NFT_BREEDING_PROGRAM_ID
        )
      )[0];
  }
  