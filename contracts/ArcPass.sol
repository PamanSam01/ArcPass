// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ArcPass Identity Registry (Mature Version)
 * @dev Professional ERC-721 contract for managing .arc identities with sequential IDs and metadata
 */
contract ArcPass is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId = 1; // Start from 1 for clean explorer display
    
    // USDC Token Address on Arc Testnet
    IERC20 public usdcToken;
    
    // Mappings for identity management
    mapping(string => uint256) private _nameToTokenId;
    mapping(uint256 => string) private _tokenIdToName;
    mapping(string => bool) private _isNameTaken;

    event IdentityRegistered(address indexed owner, uint256 indexed tokenId, string name);

    constructor(address _usdcAddress) ERC721("ArcPass", "ARCPASS") Ownable(msg.sender) {
        usdcToken = IERC20(_usdcAddress);
    }

    /**
     * @dev Tiered pricing logic based on name length
     */
    function getRegistrationFee(string memory name) public pure returns (uint256) {
        uint256 len = bytes(name).length;
        if (len <= 3) return 5 * 10**6;  // 3 letters: 5 USDC
        if (len == 4) return 3 * 10**6;  // 4 letters: 3 USDC
        if (len == 5) return 1 * 10**6;  // 5 letters: 1 USDC
        return 0;                        // 6+ letters: FREE
    }

    /**
     * @dev Registers a new .arc identity with sequential tokenId and rich metadata.
     */
    function register(string memory name, string memory metadataURI) external {
        require(!_isNameTaken[name], "Name already taken");
        require(bytes(name).length >= 3, "Name too short");
        
        uint256 fee = getRegistrationFee(name);
        
        // Transfer USDC fee to owner if fee > 0
        if (fee > 0) {
            require(usdcToken.transferFrom(msg.sender, owner(), fee), "Payment failed");
        }
        
        // Use sequential ID for better explorer indexing
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Store mappings
        _nameToTokenId[name] = tokenId;
        _tokenIdToName[tokenId] = name;
        _isNameTaken[name] = true;

        emit IdentityRegistered(msg.sender, tokenId, name);
    }

    /**
     * @dev Resolves a name to an owner address
     */
    function resolve(string memory name) public view returns (address) {
        require(_isNameTaken[name], "Name not registered");
        return ownerOf(_nameToTokenId[name]);
    }

    /**
     * @dev Gets the name associated with a tokenId
     */
    function getNameByTokenId(uint256 tokenId) public view returns (string memory) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Token does not exist");
        return _tokenIdToName[tokenId];
    }

    /**
     * @dev Checks if a name is available
     */
    function isAvailable(string memory name) public view returns (bool) {
        return !_isNameTaken[name];
    }

    /**
     * @dev Unregisters an identity and burns the associated NFT.
     */
    function unregister(string memory name) external {
        uint256 tokenId = _nameToTokenId[name];
        require(ownerOf(tokenId) == msg.sender, "Only owner can unregister");
        
        // Clean up data
        delete _isNameTaken[name];
        delete _nameToTokenId[name];
        delete _tokenIdToName[tokenId];
        
        // Burn the NFT
        _burn(tokenId);
    }

    // Required overrides for ERC721URIStorage and ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Admin: Withdraw USDC funds
     */
    function withdrawUSDC() public onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(usdcToken.transfer(owner(), balance), "Withdraw failed");
    }
}
