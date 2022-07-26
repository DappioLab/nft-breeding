use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::{hash, Hash};

use anchor_lang::solana_program::system_program;
use anchor_spl::associated_token::get_associated_token_address;
use anchor_spl::token::{
    self, Burn, CloseAccount, InitializeMint, Mint, SetAuthority, Token, TokenAccount, Transfer,
};
use mpl_token_metadata::state::Metadata;
use mpl_token_metadata::{pda::find_metadata_account, state::TokenMetadataAccount};

use anchor_lang::solana_program::{program::invoke, slot_hashes};
use mpl_token_metadata::state::Creator;
declare_id!("B91y1sRzsHMCgDkaxeHyembZ63Gpd13DbNi6iX2HCseh");

#[program]
pub mod nft_breeding {

    use anchor_lang::solana_program::program::invoke_signed;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, bump: u8, attributes: Vec<Vec<u8>>) -> Result<()> {
        let metadata_account: Metadata =
            Metadata::from_account_info(&ctx.accounts.token_metadata.to_account_info()).unwrap();
        //generate hash
        let mut hash_data: Vec<u8> = ctx.accounts.authority.key().to_bytes().clone().to_vec();
        hash_data.append(&mut ctx.accounts.token_mint.key().to_bytes().clone().to_vec());
        hash_data.append(&mut system_program::id().to_bytes().clone().to_vec());
        hash_data.append(&mut system_program::id().to_bytes().clone().to_vec());
        for mut attribute in attributes.clone() {
            hash_data.append(&mut attribute);
        }

        let hash_value = hash(&hash_data);

        ctx.accounts.breeding_meta.hash = hash_value;
        ctx.accounts.breeding_meta.generation = 0;
        ctx.accounts.breeding_meta.authority = ctx.accounts.authority.key().clone();
        ctx.accounts.breeding_meta.mint = ctx.accounts.token_mint.key().clone();
        ctx.accounts.breeding_meta.parent_a = system_program::id();
        ctx.accounts.breeding_meta.parent_b = system_program::id();
        ctx.accounts.breeding_meta.attributes = attributes.clone();
        ctx.accounts.breeding_meta.uri = metadata_account.data.uri.as_bytes().to_vec();
        ctx.accounts.breeding_meta.breeding = true;
        ctx.accounts.breeding_meta.bump = bump;
        Ok(())
    }
    pub fn compute(ctx: Context<Compute>, bump: u8) -> Result<()> {
        //decide new attributes
        let mut random_seed: Vec<u8> = vec![0];
        random_seed.extend_from_slice(
            &ctx.accounts
                .parent_a_breeding_meta
                .to_account_info()
                .data
                .borrow(),
        );
        random_seed.extend_from_slice(
            &ctx.accounts
                .parent_b_breeding_meta
                .to_account_info()
                .data
                .borrow(),
        );
        random_seed.extend_from_slice(&ctx.accounts.slot_history.to_account_info().data.borrow());
        let random = hash(&random_seed).to_bytes().to_vec();
        let mut new_attributes: Vec<Vec<u8>> = vec![];
        for index in 0..ctx.accounts.parent_a_breeding_meta.attributes.len() {
            if random[index] % 2 == 0 {
                new_attributes.push(ctx.accounts.parent_a_breeding_meta.attributes[index].clone())
            }
            if random[index] % 2 == 1 {
                new_attributes.push(ctx.accounts.parent_b_breeding_meta.attributes[index].clone())
            }
        }

        //generate hash

        let mut hash_data: Vec<u8> = ctx
            .accounts
            .parent_a_breeding_meta
            .authority
            .to_bytes()
            .clone()
            .to_vec();
        hash_data.append(&mut ctx.accounts.new_token.key().to_bytes().clone().to_vec());
        hash_data.append(
            &mut ctx
                .accounts
                .parent_a_breeding_meta
                .mint
                .to_bytes()
                .clone()
                .to_vec(),
        );
        hash_data.append(
            &mut ctx
                .accounts
                .parent_b_breeding_meta
                .mint
                .to_bytes()
                .clone()
                .to_vec(),
        );
        for mut attribute in new_attributes.clone() {
            hash_data.append(&mut attribute);
        }
        let hash_value = hash(&hash_data);
        let generation = ctx
            .accounts
            .parent_a_breeding_meta
            .generation
            .max(ctx.accounts.parent_b_breeding_meta.generation)
            .checked_add(1)
            .unwrap();
        ctx.accounts.parent_a_breeding_meta.breeding = true;
        ctx.accounts.parent_b_breeding_meta.breeding = true;

        ctx.accounts.child_breeding_meta.hash = hash_value.clone();
        ctx.accounts.child_breeding_meta.generation = generation.clone();
        ctx.accounts.child_breeding_meta.mint = ctx.accounts.new_token.key().clone();
        ctx.accounts.child_breeding_meta.authority =
            ctx.accounts.parent_a_breeding_meta.authority.clone();
        ctx.accounts.child_breeding_meta.parent_a =
            ctx.accounts.parent_a_breeding_meta.mint.clone();
        ctx.accounts.child_breeding_meta.parent_b =
            ctx.accounts.parent_b_breeding_meta.mint.clone();
        ctx.accounts.child_breeding_meta.attributes = new_attributes.clone();
        ctx.accounts.child_breeding_meta.breeding = false;
        ctx.accounts.child_breeding_meta.bump = bump;
        Ok(())
    }
    pub fn mint(ctx: Context<Mint_child>) -> Result<()> {
        let creators = Creator {
            share: 100,
            address: ctx.accounts.child_breeding_meta.key(),
            verified: false,
        };
        let create_metadata_ins = mpl_token_metadata::instruction::create_metadata_accounts_v3(
            mpl_token_metadata::ID,
            ctx.accounts.new_token_metadata.key(),
            ctx.accounts.new_token.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.child_breeding_meta.key(),
            "".to_string(),
            ctx.accounts.child_breeding_meta.hash.to_string(),
            "".to_string(),
            Some(vec![creators]),
            0,
            false,
            true,
            None,
            None,
            None,
        );
        invoke(&create_metadata_ins, &ctx.accounts.to_account_infos())?;
        let master_edition_ix = mpl_token_metadata::instruction::create_master_edition_v3(
            mpl_token_metadata::ID,
            ctx.accounts.new_token_master_edition.key(),
            ctx.accounts.new_token.key(),
            ctx.accounts.child_breeding_meta.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.new_token_metadata.key(),
            ctx.accounts.payer.key(),
            None,
        );
        invoke_signed(
            &master_edition_ix,
            &ctx.accounts.to_account_infos(),
            &[&[
                b"breeding",
                &ctx.accounts.child_breeding_meta.authority.key().to_bytes(),
                &ctx.accounts.new_token.key().to_bytes(),
                &ctx.accounts.child_breeding_meta.bump.to_le_bytes(),
            ]],
        )?;
        anchor_spl::token::burn(ctx.accounts.burn_parent_a_token_from_owner(), 1)?;
        anchor_spl::token::burn(ctx.accounts.burn_parent_b_token_from_owner(), 1)?;
        ctx.accounts.child_breeding_meta.breeding = false;
        Ok(())
    }
    pub fn update_uri(ctx: Context<Mint_child>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_mint: Box<Account<'info, Mint>>,
    pub token_metadata: AccountInfo<'info>,
    #[account(
        init,
        seeds = [b"breeding".as_ref(),&authority.key().as_ref(), &token_mint.key().as_ref()],
        bump,
        payer = authority,
        space = 1000
    )]
    pub breeding_meta: Account<'info, BreedingMeta>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Compute<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub new_token: Box<Account<'info, Mint>>,
    #[account(
        init,
        seeds = [b"breeding".as_ref(),&parent_a_breeding_meta.authority.key().as_ref(), &new_token.key().as_ref()],
        bump,
        payer = payer,
        space = 1000
    )]
    pub child_breeding_meta: Account<'info, BreedingMeta>,
    #[account(
        constraint = parent_a_token_account.owner == payer.key(),
        constraint = parent_a_token_account.mint == parent_a_breeding_meta.mint,
        constraint = parent_a_token_account.amount > 0,
    )]
    pub parent_a_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut,
        constraint = parent_a_breeding_meta.authority == parent_b_breeding_meta.authority,
        constraint = parent_a_breeding_meta.breeding == false
    )]
    pub parent_a_breeding_meta: Account<'info, BreedingMeta>,
    #[account(
        constraint = parent_b_token_account.owner == payer.key(),
        constraint = parent_b_token_account.mint == parent_b_breeding_meta.mint,
        constraint = parent_b_token_account.amount > 0
    )]
    pub parent_b_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut,
        constraint = parent_b_breeding_meta.breeding == false
    )]
    pub parent_b_breeding_meta: Account<'info, BreedingMeta>,
    pub system_program: Program<'info, System>,
    pub slot_history: AccountInfo<'info>,
}
#[derive(Accounts)]
pub struct Mint_child<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub new_token: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub new_token_metadata: AccountInfo<'info>,
    #[account(mut)]
    pub new_token_master_edition: AccountInfo<'info>,
    #[account(mut)]
    pub child_breeding_meta: Account<'info, BreedingMeta>,
    #[account(mut)]
    pub parent_a_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub parent_a_token_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub parent_b_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub parent_b_token_mint: Box<Account<'info, Mint>>,
    pub token_program: AccountInfo<'info>,
}
impl<'info> Mint_child<'info> {
    fn burn_parent_a_token_from_owner(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.parent_a_token_mint.to_account_info().clone(),
            from: self.parent_a_token_account.to_account_info().clone(),
            authority: self.payer.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
    fn burn_parent_b_token_from_owner(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.parent_b_token_mint.to_account_info().clone(),
            from: self.parent_b_token_account.to_account_info().clone(),
            authority: self.payer.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}
#[account]
pub struct BreedingMeta {
    pub hash: Hash,
    pub generation: u8,
    pub uri: Vec<u8>,
    pub mint: Pubkey,
    pub authority: Pubkey,
    pub parent_a: Pubkey,
    pub parent_b: Pubkey,
    pub attributes: Vec<Vec<u8>>,
    pub breeding: bool,
    pub bump: u8,
}
