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

export async function fetchBreedingMetaByParent(
    parentAMint: PublicKey,
    parentBMint: PublicKey,
    provider: anchor.AnchorProvider
){
    const nftBreedingProgram = new anchor.Program(
        nftBreedingIDL,
        NFT_BREEDING_PROGRAM_ID,
        provider
      );
    
      let ParentAMemcmp = {
        memcmp: {
          offset: 105, // 8 + 32 + 1 + 32 * 2
          bytes: parentAMint.toString(),
        },
      };
      let ParentBMemcmp = {
        memcmp: {
          offset: 137, // 8 + 32 + 1 + 32 * 3
          bytes: parentBMint.toString(),
        },
      };

    let filter = [ParentAMemcmp, ParentBMemcmp];
    
    const breedingMeta = await nftBreedingProgram.account.breedingMeta.all(filter);
    if(breedingMeta){
        return breedingMeta[0];
    }else{
      let ParentAMemcmp = {
        memcmp: {
          offset: 137, // 8 + 32 + 1 + 32 * 3
          bytes: parentAMint.toString(),
        },
      };
      let ParentBMemcmp = {
        memcmp: {
          offset: 105, // 8 + 32 + 1 + 32 * 2
          bytes: parentBMint.toString(),
        },
      };
      filter = [ParentAMemcmp, ParentBMemcmp];
    
      const breedingMeta = await nftBreedingProgram.account.breedingMeta.all(filter);
      if(breedingMeta){
        return breedingMeta[0];
      }else{  
        return null;
      }
    }
}

export async function fetchBreedingMetaByMint(
    nftMint: PublicKey,
    provider: anchor.AnchorProvider
){
    const nftBreedingProgram = new anchor.Program(
        nftBreedingIDL,
        NFT_BREEDING_PROGRAM_ID,
        provider
      );
    
      const nftMintMemcmp = {
        memcmp: {
          offset: 41, // 8 + 32 + 1
          bytes: nftMint.toString(),
        },
      };

      const filter = [nftMintMemcmp];
    
    const breedingMeta = await nftBreedingProgram.account.breedingMeta.all(filter);
    if(breedingMeta){
      return breedingMeta[0];
    }else{
      return null;
    }
}