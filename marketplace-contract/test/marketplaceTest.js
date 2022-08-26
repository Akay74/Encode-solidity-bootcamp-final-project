const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('tests', () => {
  // let Nftmarketplace, owner, user;

  beforeEach(async () => {
    const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
    const nftmarketplace = await Nftmarketplace.deploy("name", "symbol");
    nftmarketplace.wait();
    const [owner, user, _] = await ethers.getSigners();
  });

  describe('transaction', () => {
    let index;
    let tokenId;
    let duration;

    it('should mint NFT', async () => {
      const mintTx = await nftmarketplace.mint("");
      mintTx.wait();
      const tokenExists = await nftmarketplace._exists(1);
      expect(tokenExists).to.eq(true);
    });

    it('should rent NFT', async () => {
      
      const rentTx = await nftmarketplace.rent(tokenId, duration);
      rentTx.wait();
      const nftIsRented = await nftmarketplace.nftDetail[index].isRented;
      expect(nftIsRented).to.eq(true);
    });

    it('should buy NFT', async () => {
      const buyTx = await nftmarketplace.buy(index);
      buyTx.wait();
      const isOwner = await nftmarketplace.ownerOf(index);
      expect(isOwner).to.eq(true);
    });
  });

  describe('toggle NFT state', async () => {
    it('should toggle rent state', async () => {
      'Not described'
    });

    it('should toggle sale state', async () => {
      'Not described'
    });
  });
})