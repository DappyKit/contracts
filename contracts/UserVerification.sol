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
    uint256 private _tokenId;
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
     */
    function issueToken(address user) public onlyOwner {
        require(_userTokens[user] == 0, "User already has a token");

        _tokenId++;
        _safeMint(user, _tokenId);
        _userTokens[user] = _tokenId;
        _setTokenExpiry(_tokenId, block.timestamp + _defaultExpiryDuration);
    }

    /**
     * @dev Revokes a token from a user.
     * @param tokenId The ID of the token to be revoked.
     */
    function revokeToken(uint256 tokenId) public onlyOwner {
        require(tokenExists(tokenId), "Token does not exist");
        address tokenOwner = ownerOf(tokenId);
        _burn(tokenId);
        delete _userTokens[tokenOwner];
        delete _tokenExpiryTimes[tokenId];
    }

    /**
     * @dev Reissues a token to a new user, burning the old one if it exists.
     * If the new user already has a token, the operation is skipped.
     * @param oldUser The address of the old user account.
     * @param newUser The address of the new user account.
     */
    function reissueToken(address oldUser, address newUser) public onlyOwner {
        uint256 oldUserTokenId = _userTokens[oldUser];
        if (oldUserTokenId != 0) {
            _burn(oldUserTokenId);
            delete _userTokens[oldUser];
        }

        if (_userTokens[newUser] != 0) {
            return;
        }

        _tokenId++;
        _safeMint(newUser, _tokenId);
        _userTokens[newUser] = _tokenId;
        _setTokenExpiry(_tokenId, block.timestamp + _defaultExpiryDuration);
    }

    /**
     * @dev Extends the expiry time of a token.
     * @param tokenId The ID of the token whose expiry is to be extended.
     */
    function extendTokenExpiry(uint256 tokenId) public onlyOwner {
        require(tokenExists(tokenId), "Token does not exist");
        _setTokenExpiry(tokenId, block.timestamp + _defaultExpiryDuration);
    }

    /**
     * @dev Checks if a user has a token.
     * @param user The address of the user.
     * @return bool True if the user has a token, false otherwise.
     */
    function hasToken(address user) public view returns (bool) {
        return _userTokens[user] != 0;
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
     * @dev Sets the expiry time for a token.
     * @param tokenId The ID of the token.
     * @param expiryTime The expiry time to be set for the token.
     */
    function _setTokenExpiry(uint256 tokenId, uint256 expiryTime) private {
        _tokenExpiryTimes[tokenId] = expiryTime;
    }

    /**
     * @dev Public function to check if a token exists.
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
}
