const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe('tests', function () {
  this.timeout(0);
  let index;
  let tokenId;
  let duration;
  let buyPrice;
  let isForSale;
  let isForRent;
  /**
   async function deployNftmarketplace() {
    const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
    const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");
    await nftmarketplace.deployed();

    return { nftmarketplace };
  }
   */

  describe('transaction', function () {
    it('should mint NFT', async function () {
      index = 0;
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");
      await nftmarketplace.deployed();
      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      expect(await nftmarketplace.exists(index)).to.eq(true);
    });

    it('should rent NFT', async () => {
      tokenId = 0;
      duration = 5 * 24 * 60 * 60;
      const [owner, user] = await ethers.getSigners();
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");
      await nftmarketplace.deployed();

      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await nftmarketplace.toggleForRent(tokenId);
      const rentTx = await nftmarketplace.connect(user).rent(tokenId, duration);
      rentTx.wait();
      const nftIsRented = await nftmarketplace.isRented(tokenId);
      expect(nftIsRented).to.eq(true);
    });

    it('should buy NFT', async () => {
      index = 0;
      buyPrice = 2;
      console.log(buyPrice);
      const [owner, user] = await ethers.getSigners();
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");

      await nftmarketplace.deployed();
      const mintTx = await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await mintTx.wait();
      const setBuyPriceTx = await nftmarketplace.setBuyPrice(index, buyPrice);
      await setBuyPriceTx.wait();
      const toggleForSaleTx = await nftmarketplace.toggleForSale(index);
      await toggleForSaleTx.wait();
      const buyTx = await nftmarketplace.connect(user).buy(index);
      await buyTx.wait();

      const isOwner = await nftmarketplace.ownerOf(index);
      expect(isOwner).to.eq(user.address);
    });
  });

  describe('set NFT state', async () => {
    it('should toggle rent state', async () => {
      index = 0;
      isForRent = false;
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");

      await nftmarketplace.deployed();
      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await nftmarketplace.toggleForRent(index);

      expect(await nftmarketplace.isForRent(index)).to.equal(!isForRent);
    });

    it('should set buy price', async () => {
      index = 0;
      buyPrice = 3;
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");

      await nftmarketplace.deployed();
      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await nftmarketplace.setBuyPrice(index, buyPrice);

      expect(await nftmarketplace.getBuyPrice(index)).to.equal(buyPrice);
    });

    it('should toggle sale state', async () => {
      index = 0;
      isForSale = false;
      buyPrice = 3;
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");

      await nftmarketplace.deployed();
      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await nftmarketplace.setBuyPrice(index, buyPrice);
      await nftmarketplace.toggleForSale(index);

      expect(await nftmarketplace.isForSale(index)).to.equal(!isForSale);
    });
  });
  
  describe('revert transactions when requirement is not met', async () => {
    it('should revert when owner tries to buy own NFT', async () => {
      index = 0;
      buyPrice = ethers.utils.parseEther('0.003');
      const [owner, user] = await ethers.getSigners();
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");

      await nftmarketplace.deployed();
      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await nftmarketplace.setBuyPrice(index, buyPrice);
      await nftmarketplace.toggleForSale(index);

      expect(nftmarketplace.buy(index)).to.be.revertedWith('You cant buy your NFT');
    });

    it('should revert toggleForRent transaction if NFT is rented', async () => {
      tokenId = 0;
      duration = 5 * 24 * 60 * 60;
      const [owner, user] = await ethers.getSigners();
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");
      await nftmarketplace.deployed();
      
      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await nftmarketplace.toggleForRent(tokenId);
      await nftmarketplace.connect(user).rent(tokenId, duration);

      expect(nftmarketplace.toggleForRent(tokenId)).to.be.revertedWith('The NFT is rented');
    });

    it('should revert if NFT is not for sale', async () => {
      index = 0;
      buyPrice = ethers.utils.parseEther('0.003');
      const [owner, user] = await ethers.getSigners();
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");

      await nftmarketplace.deployed();
      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await nftmarketplace.setBuyPrice(index, buyPrice);

      await expect(nftmarketplace.connect(user).buy(index)).to.be.revertedWith('Not for sale');
    });

    it('should revert if NFT is not for rent', async () => {
      tokenId = 0;
      duration = 5 * 24 * 60 * 60;
      const [owner, user] = await ethers.getSigners();
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");
      await nftmarketplace.deployed();
      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");

      await expect(nftmarketplace.connect(user).rent(tokenId, duration)).to.be.revertedWith('Not for rent');
    });

    it('should revert if owner tries to rent his own NFT', async () => {
      tokenId = 0;
      duration = 5 * 24 * 60 * 60;
      const [owner, user] = await ethers.getSigners();
      const Nftmarketplace = await hre.ethers.getContractFactory('Nftmarketplace');
      const nftmarketplace = await Nftmarketplace.deploy("NFT", "NFTtest");
      await nftmarketplace.deployed();

      await nftmarketplace.mint("https://ipfs.io/ipfs/Qmc1iZvCSnEUTuPz6iSEngDWbKTzAagRz4U9JfssFSpynf");
      await nftmarketplace.toggleForRent(tokenId);
      await expect(nftmarketplace.rent(tokenId, duration)).to.be.revertedWith("You can't rent your NFT");
    });
  });
})