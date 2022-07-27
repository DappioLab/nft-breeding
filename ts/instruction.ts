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
import { hex } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { hash } from "@project-serum/anchor/dist/cjs/utils/sha256";
import { IDL as nftBreedingIDL  } from "../target/types/nft_breeding";
import {
  NFT_BREEDING_PROGRAM_ID,
} from "./ids";
import { findAssociatedTokenAddress, findBreedingMeta } from "./utils";

const BREEDING_SEED = "breeding";

export async function initialize(
  userKey: PublicKey,
  nftMint: PublicKey,
  nftMetadata: PublicKey,
  attributes: string[], 
  provider: anchor.AnchorProvider
  ){
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    NFT_BREEDING_PROGRAM_ID,
    provider
  );

  const _attributes: Buffer[] = [];
  for(let attr of attributes){
    _attributes.push(Buffer.from(attr));
  }

  const breedingMeta = await findBreedingMeta(userKey, nftMint);

  const ix = await nftBreedingProgram.methods.initialize(new anchor.BN(bump), _attributes)
  .accounts({
    authority: userKey,
    tokenMint: nftMint,
    tokenMetadata: nftMetadata,
    breedingMeta:breedingMeta, 
    systemProgram: anchor.web3.SystemProgram.programId
  })
  .instruction()

  return ix;
}

export async function compute(
  userKey: PublicKey, 
  parentAMint: PublicKey, 
  parentBMint: PublicKey,
  provider: anchor.AnchorProvider
  ){
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    NFT_BREEDING_PROGRAM_ID,
    provider
  );
  const parentATokenAccount = await findAssociatedTokenAddress(userKey, parentAMint);
  const parentBTokenAccount = await findAssociatedTokenAddress(userKey, parentBMint);

  const parentABreedingMetadata = await findBreedingMeta(userKey, parentAMint);
  const parentBBreedingMetadata = await findBreedingMeta(userKey, parentBMint);

  const newTokenMint = Keypair.generate().publicKey;
  const childBreedingMeta = await findBreedingMeta(userKey, newTokenMint);
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: userKey,
    newAccountPubkey: newTokenMint,
    space: MINT_SIZE,
    lamports: await getMinimumBalanceForRentExemptMint(provider.connection),
    programId: TOKEN_PROGRAM_ID,
  });
  const createInitializeMintIx = createInitializeMintInstruction(newTokenMint, 0, userKey, null, TOKEN_PROGRAM_ID);

  const ComputeIx = await nftBreedingProgram.methods.compute()
  .accounts({
    payer: userKey,
    newToken: newTokenMint,
    childBreedingMeta,
    parentATokenAccount,
    parentABreedingMeta: parentABreedingMetadata,
    parentBTokenAccount,
    parentBBreedingMeta: parentABreedingMetadata,
    systemProgram: anchor.web3.SystemProgram.programId,
    slotHistory:
  })
  .instruction();

  return ix;
}

export async function mint(provider: anchor.AnchorProvider){
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    NFT_BREEDING_PROGRAM_ID,
    provider
  );

  const ix = await nftBreedingProgram.methods.mint()
  .accounts({})
  .instruction()

  return ix;
}

export async function updateUri(provider: anchor.AnchorProvider){
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    NFT_BREEDING_PROGRAM_ID,
    provider
  );

  const ix = await nftBreedingProgram.methods.updateUri()
  .accounts({})
  .instruction()

  return ix;
}