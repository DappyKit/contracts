// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title UserVerification
 * @dev This contract issues and manages Soulbound Tokens (SBTs) for user identity verification.
 * SBTs are non-transferable and have an expiration mechanism. The contract allows for the issuance,
 * revocation, and reissuance of tokens, as well as checking their validity and expiration status.
 */
contract UserVerification is Initializable, ERC721Upgradeable, ERC721BurnableUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    mapping(address => uint256) private _userTokens;
    mapping(uint256 => uint256) private _tokenExpiryTimes;
    uint256 private _defaultExpiryDuration;

    /**
     * @dev Initializes the contract with the given name, symbol, and default expiry duration.
     * @param initialOwner The address of the initial owner.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     * @param defaultExpiryDuration The default duration (in seconds) until a token expires.
     */
    function initialize(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint256 defaultExpiryDuration
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Burnable_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        _defaultExpiryDuration = defaultExpiryDuration;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Issues a new token to a user if they don't already have one.
     * @param user The address to which the token will be issued.
     * @param tokenId The ID of the token to be issued.
     */
    function issueToken(address user, bytes32 tokenId) external onlyOwner {
        uint256 _tokenId = uint256(tokenId);
        require(!tokenExists(_tokenId), "Token should not exist");
        require(balanceOf(user) == 0, "User already has a token");

        _safeMint(user, _tokenId);
        _userTokens[user] = _tokenId;
        _setTokenExpiry(_tokenId, block.timestamp + _defaultExpiryDuration);
    }

    /**
     * @dev Revokes a token from a user.
     * @param tokenId The ID of the token to be revoked.
     */
    function revokeToken(bytes32 tokenId) external onlyOwner {
        uint256 _tokenId = uint256(tokenId);
        require(tokenExists(_tokenId), "Token does not exist");
        address tokenOwner = ownerOf(_tokenId);
        _burn(_tokenId);
        delete _userTokens[tokenOwner];
        delete _tokenExpiryTimes[_tokenId];
    }

    /**
     * @dev Extends the expiry time of a token.
     * @param tokenId The ID of the token whose expiry is to be extended.
     */
    function extendTokenExpiry(uint256 tokenId) external onlyOwner {
        require(tokenExists(tokenId), "Token does not exist");
        _setTokenExpiry(tokenId, block.timestamp + _defaultExpiryDuration);
    }

    /**
     * @dev Returns the token ID associated with a user.
     * @param user The address of the user.
     * @return uint256 The token ID.
     */
    function getTokenId(address user) public view returns (uint256) {
        require(_userTokens[user] != 0, "User does not have a token");
        return _userTokens[user];
    }

    /**
     * @dev Checks if a token is expired.
     * @param tokenId The ID of the token to check.
     * @return bool True if the token is expired, false otherwise.
     */
    function isTokenExpired(uint256 tokenId) public view returns (bool) {
        require(tokenExists(tokenId), "Token does not exist");
        return block.timestamp > _tokenExpiryTimes[tokenId];
    }

    /**
     * @dev Returns the time remaining before the token expires.
     * @param tokenId The ID of the token to check.
     * @return uint256 The time in seconds until the token expires, or 0 if it is already expired.
     */
    function timeBeforeExpiration(uint256 tokenId) public view returns (uint256) {
        require(tokenExists(tokenId), "Token does not exist");

        if(block.timestamp > _tokenExpiryTimes[tokenId]) {
            return 0;
        }

        return _tokenExpiryTimes[tokenId] - block.timestamp;
    }

    /**
     * @dev Checks if a token exists.
     * Utilizes the ownerOf function from the ERC721Upgradeable implementation which reverts if the token does not exist.
     * @param tokenId The ID of the token to check.
     * @return bool Returns true if the token exists, false otherwise.
     */
    function tokenExists(uint256 tokenId) public view returns (bool) {
        try this.ownerOf(tokenId) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Sets the expiry time for a token.
     * @param tokenId The ID of the token.
     * @param expiryTime The expiry time to be set for the token.
     */
    function _setTokenExpiry(uint256 tokenId, uint256 expiryTime) private {
        _tokenExpiryTimes[tokenId] = expiryTime;
    }

    /**
     * @dev Overrides the `_update` function to enforce non-transferability of tokens.
     * Allows only minting (when `from` is the zero address) and burning (when `to` is the zero address).
     * Reverts on attempts to transfer tokens between non-zero addresses.
     * @param to The address receiving the token. For minting, this is the new owner's address; for burning, it should be the zero address.
     * @param tokenId The ID of the token being minted, burned, or erroneously transferred.
     * @param auth The address authorized to perform the operation. Unused in this override.
     * @return The address from which the token is being transferred. Returns the zero address for minting operations.
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Token not transferable");
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override the approve function to prevent token approvals.
     */
    function approve(address /* to */, uint256 /* tokenId */) public pure override {
        revert("Soulbound tokens cannot be approved for transfer");
    }

    /**
     * @dev Override the setApprovalForAll function to prevent setting operator approvals.
     */
    function setApprovalForAll(address /* operator */, bool /* approved */) public pure override {
        revert("Soulbound tokens cannot set operator approvals");
    }

    /**
     * @dev Override the getApproved function to indicate no approvals are allowed.
     */
    function getApproved(uint256 /* tokenId */) public pure override returns (address) {
        return address(0);
    }

    /**
     * @dev Override the isApprovedForAll function to indicate no operator approvals are allowed.
     */
    function isApprovedForAll(address /* owner */, address /* operator */) public pure override returns (bool) {
        return false;
    }

    /**
     * @dev Override the safeTransferFrom function to prevent token transfers.
     */
    function safeTransferFrom(address /* from */, address /* to */, uint256 /* tokenId */, bytes memory /* data */) public pure override {
        revert("Soulbound tokens cannot be transferred");
    }

    /**
     * @dev Override the transferFrom function to prevent token transfers.
     */
    function transferFrom(address /* from */, address /* to */, uint256 /* tokenId */) public pure override {
        revert("Soulbound tokens cannot be transferred");
    }
}
