// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Nftmarketplace is ERC721URIStorage, Ownable {
    address contractor = payable(address(this));
    
    using Counters for Counters.Counter; 
    Counters.Counter public _tokenIds;

    struct NftDetails {
        uint256 tokenId;
        address payable owner;
        address user;
        uint256 rentPrice;
        uint256 buyPrice;
        bool forSale;
        bool forRent;
        bool isRented;
        uint256 timeUnit;
        uint256 expires;
    }

    mapping(uint256 => NftDetails) public nftDetail;

    constructor(string memory _name, string memory _symbol) payable ERC721("_name", "_symbol") {}

    function mint(string memory _tokenURI) public {
        uint256 tokenId = _tokenIds.current();

        _tokenIds.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // pass internal list function
        list(tokenId);
    }

    function list(uint256 _tokenId) private {
        // set struct details
        nftDetail[_tokenId] = NftDetails(
            _tokenId,
            payable(msg.sender),
            address(0),
            0,
            0,
            false,
            false,
            false,
            0,
            0
        );

    }

    function rent(uint256 _index, uint256 _duration) public payable {
        NftDetails storage nft = nftDetail[_index];
        require(msg.sender != nft.owner, "You can't rent your NFT");
        require(nft.forRent == true, "Not for rent");

        uint256 _rentPrice = nft.rentPrice * _duration;
        nft.owner.transfer(_rentPrice);
        nft.user = msg.sender;
        nft.isRented = true;

        uint256 currentTime = block.timestamp;
        nft.expires = currentTime + _duration;
    }

    function buy(uint256 _index) public payable {
        NftDetails storage nft = nftDetail[_index];
        require(msg.sender != nft.owner, "You can't buy your NFT");
        require(nft.forSale == true, "Not for sale");
        require(nft.buyPrice > 0, "Price must be greater than zero");

        nft.owner.transfer(nft.buyPrice);
        _transfer(nft.owner, msg.sender, nft.tokenId);

        nft.owner = payable(msg.sender);
        nft.forSale = false;
        nft.buyPrice = 0;
    }
    
    function getNfts(uint256 _index) public view returns(NftDetails memory) {
        return nftDetail[_index];
    }

    function toggleForRent(uint256 _index) public {
        NftDetails storage nft = nftDetail[_index];
        require(msg.sender == nft.owner, "Only Owner");
        require(nft.isRented == false, "The NFT is rented");

        nft.forRent = !nft.forRent;
    }

    function toggleForSale(uint256 _index) public {
        NftDetails storage nft = nftDetail[_index];
        require(msg.sender == nft.owner, "Only Owner");
        require(nft.buyPrice > 0, "Price should be greater than zero");

        nft.forSale = !nft.forSale;
    }

    function setBuyPrice(uint256 _index, uint256 _price) public {
        NftDetails storage nft = nftDetail[_index];
        require(msg.sender == nft.owner, "Only Owner");
        require(_price > 0, "Price should be greater than zero");
        nft.buyPrice = _price;
    }

    function setRentPrice(uint256 _index, uint256 _price) public {
        NftDetails storage nft = nftDetail[_index];
        require(msg.sender == nft.owner, "Only Owner");
        require(_price > 0, "Price should be greater than zero");
        nft.rentPrice = _price;
    }

    function endRent(uint256 _index) public {
        NftDetails storage nft = nftDetail[_index];
        require(msg.sender == nft.owner || msg.sender == nft.user, "Not authorized");
        require(block.timestamp >= nft.expires, "Rent has not expired");

        nft.expires = 0;
        nft.user = address(0);
        nft.isRented = false;
    }

    function withdraw() public onlyOwner {
        uint amount = address(this).balance;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw Matic");
    } 
}