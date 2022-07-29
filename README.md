# NFT Breeding Program

> #### Prerequisite: What is Metaplex Standard?
> >
> ![](https://i.imgur.com/yeO8vDC.png)
> image from [Metaplex docs](https://docs.metaplex.com/programs/token-metadata/accounts)

![](https://hackmd.io/_uploads/H1djPylTq.png)

## 1. Initialize

![](https://hackmd.io/_uploads/ry604xgpq.png)

- Store metaplex NFT attributes on chain
- Breeding Metadata
  - **Hash**
  - **Generation**
  - **Name**
  - **Metaplex Mint**
  - ParentA
  - ParentB
  - ...
  - AttributeA
  - AttributeB 
  - ...
- Initialization is **only** for genesis (Generation 0)
- Change Upgrade Authority of NFT to Breeding PDA signer so that the used NFT can be burnt by Breeding program

## 2. Compute New Data

![](https://hackmd.io/_uploads/S1k-rex6q.png)

- Customizable Breeding Logic with `compute` interface
- **Write attributes to `BreedingMeta` (PDA)**

## 3. Mint Child NFT

![](https://hackmd.io/_uploads/SJA7rlgpc.png)

- **Write Metaplex metadata (without URI)**
- Transfer upgrade authority to Breeding program PDA Signer
- Burn Parent NFTs(optional)
- Read attributes (off-chain)
- Upload image to web3 storage (off-chain)

## 4. Update URI of child NFT

![](https://hackmd.io/_uploads/B1ONSgl6q.png)

- Update URI in Metaplex metadata
