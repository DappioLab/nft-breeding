import * as anchor from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  MemcmpFilter,
  GetProgramAccountsConfig,
  DataSizeFilter,
} from "@solana/web3.js";
import { createInitializeMintInstruction, createMint, createMintToInstruction, getAccount, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { hex } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { hash } from "@project-serum/anchor/dist/cjs/utils/sha256";
import { IDL as nftBreedingIDL  } from "../target/types/nft_breeding";
import {
  NFT_BREEDING_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID,
} from "./ids";
import { createATAWithoutCheckIx, findAssociatedTokenAddress, findBreedingMeta, findMasterEditionAddress, findTokenMetadataAddress } from "./utils";

export async function initializeIx(
  userKey: PublicKey,
  nftMint: PublicKey,
  name: string,
  symbol: string,
  attributes: string[], 
  provider: anchor.AnchorProvider
  ){
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    NFT_BREEDING_PROGRAM_ID,
    provider
  );

  const _attributes = attributes.map((trait)=>Buffer.from(trait));

  const nftMetadata = (await findTokenMetadataAddress(nftMint))[0];
  const [breedingMeta, bump] = await findBreedingMeta(userKey, nftMint);

  const ix = await nftBreedingProgram.methods.initialize(bump,Buffer.from(name),Buffer.from(symbol), _attributes)
  .accounts({
    authority: userKey,
    tokenMint: nftMint,
    tokenMetadata: nftMetadata,
    breedingMeta:breedingMeta, 
    systemProgram: anchor.web3.SystemProgram.programId
  })
  .instruction();

  return ix;
}

export async function computeIx(
  userKey: PublicKey, 
  parentAMint: PublicKey, 
  parentBMint: PublicKey,
  childMint: PublicKey,
  provider: anchor.AnchorProvider
  ){
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    NFT_BREEDING_PROGRAM_ID,
    provider
  );

  const allIx: anchor.web3.TransactionInstruction[] = [];

  const parentATokenAccount = await findAssociatedTokenAddress(userKey, parentAMint);
  const parentBTokenAccount = await findAssociatedTokenAddress(userKey, parentBMint);

  const parentABreedingMetadata = (await findBreedingMeta(userKey, parentAMint))[0];
  const parentBBreedingMetadata = (await findBreedingMeta(userKey, parentBMint))[0];

  const [childBreedingMeta, bump] = await findBreedingMeta(userKey, childMint);
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: userKey,
    newAccountPubkey: childMint,
    space: MINT_SIZE,
    lamports: await getMinimumBalanceForRentExemptMint(provider.connection),
    programId: TOKEN_PROGRAM_ID,
  });
  const createInitializeMintIx = createInitializeMintInstruction(childMint, 0, userKey, null, TOKEN_PROGRAM_ID);

  const ComputeIx = await nftBreedingProgram.methods.compute(bump)
  .accounts({
    payer: userKey,
    newToken: childMint,
    childBreedingMeta,
    parentATokenAccount,
    parentABreedingMeta: parentABreedingMetadata,
    parentBTokenAccount,
    parentBBreedingMeta: parentBBreedingMetadata,
    systemProgram: anchor.web3.SystemProgram.programId,
    slotHashesAccount: anchor.web3.SYSVAR_SLOT_HASHES_PUBKEY
  })
  .instruction();

  allIx.push(createAccountIx);
  allIx.push(createInitializeMintIx);
  allIx.push(ComputeIx);

  return allIx;
}

export async function mintChildIx(
  userKey: PublicKey,
  childNftMint: PublicKey,
  parentAMint: PublicKey,
  parentBMint: PublicKey,
  provider: anchor.AnchorProvider
  ){
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    NFT_BREEDING_PROGRAM_ID,
    provider
  );
  const allIx: anchor.web3.TransactionInstruction[] = [];

  const parentATokenAccount = await findAssociatedTokenAddress(userKey, parentAMint);
  const parentBTokenAccount = await findAssociatedTokenAddress(userKey, parentBMint);
  const childNftTokenAccount = await findAssociatedTokenAddress(userKey, childNftMint);
  
  const childNftBreedingMetadata = (await findBreedingMeta(userKey, childNftMint))[0];
  const childTokenMetadataAddress = (await findTokenMetadataAddress(childNftMint))[0];
  const childMasterEditionAddress = (await findMasterEditionAddress(childNftMint))[0];


  const createAtaIx = await createATAWithoutCheckIx(userKey, childNftMint);
  const mintToIx = createMintToInstruction(childNftMint, childNftTokenAccount, userKey, 1);

  const mintChildIx = await nftBreedingProgram.methods.mint()
  .accounts({
    payer: userKey, 
    newToken: childNftMint, 
    newTokenMetadata: childTokenMetadataAddress,
    newTokenMasterEdition: childMasterEditionAddress, 
    childBreedingMeta: childNftBreedingMetadata,
    parentATokenAccount, 
    parentATokenMint: parentAMint, 
    parentBTokenAccount, 
    parentBTokenMint: parentBMint, 
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    tokenProgram: TOKEN_PROGRAM_ID,
    metadataProgram: TOKEN_METADATA_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId
  })
  .instruction();

  allIx.push(createAtaIx);
  allIx.push(mintToIx);
  allIx.push(mintChildIx);


  return allIx;
}

export async function updateUriIx(
  userKey: PublicKey, 
  nftMint: PublicKey, 
  updateUri: string,
  provider: anchor.AnchorProvider
  ){
  const nftBreedingProgram = new anchor.Program(
    nftBreedingIDL,
    NFT_BREEDING_PROGRAM_ID,
    provider
  );

  const nftBreedingMetadata = (await findBreedingMeta(userKey, nftMint))[0];
  const nftTokenAccount = await findAssociatedTokenAddress(userKey, nftMint);

  const nftMetadata = (await findTokenMetadataAddress(nftMint))[0];

  const ix = await nftBreedingProgram.methods.updateUri(updateUri)
  .accounts({
    owner: userKey, 
    breedingMeta: nftBreedingMetadata,
    nftAccount: nftTokenAccount,
    nftMint, 
    nftMetadata: nftMetadata,
    metadataProgram: TOKEN_METADATA_PROGRAM_ID,
  })
  .instruction()

  return ix;
}