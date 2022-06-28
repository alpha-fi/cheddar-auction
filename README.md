# NFT Market Reference Implementation

A PoC backbone for NFT Marketplaces on NEAR Protocol.

[Reference](https://nomicon.io/Standards/NonFungibleToken/README.html)

# Changelog

[Changelog](changelog.md)

## Progress:
- [x] basic purchase of NFT with FT
- [x] demo pay out royalties (FTs and NEAR)
- [x] test and determine standards for markets (best practice?) to buy/sell NFTs (finish standard) with FTs (already standard)
- [x] demo some basic auction types, secondary markets and 
- [x] frontend example
- [x] first pass / internal audit
- [ ] connect with bridged tokens e.g. buy and sell with wETH/nDAI (or whatever we call these)

## Known Issues / Implementation Details for Markets

* approve NFT on marketplace A and B
* it sells on B
* still listed on A
* user Alice goes to purchase on marketplace A but this will fail
* the token has been transferred already and marketplace A has an incorrect approval ID for this NFT

There are 3 potential solutions:

1. handle in market contract - When it fails because nft_transfer fails, marketplace could make promise call that checks nft_token owner_id is still sale owner_id and remove sale. This means it will still fail for 1 user.
2. handle with backend - run a cron job to check sales on a regular interval. This potentially avoids failing for any user.
3. remove from frontend (use frontend or backend) - for every sale, check that sale.owner_id == nft.owner_id and then hide these sale options in the frontend UI. Heavy processing for client side, so still needs a backend.
4. let it fail client side then alert backend to remove sale. No cron. Still fails for 1 user.

Matt's opinion:
Option (2/3) is the best UX and also allows your sale listings to be the most accurate and up to date. If you're implementing a marketplace, you most likely are running backend somewhere with the marketplace owner account. If you go with Option 3 you can simply update a list of "invalid sales" and filter these before you send the sales listings to the client. If you decided to go with 2, modify the marketplace remove_sale to allow your marketplace owner account to remove any sales. 