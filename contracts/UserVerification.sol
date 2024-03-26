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
    /// @notice Indicates if an address is a manager
    mapping(address => bool) public isManager;

    /// @notice Default duration until a token expires in seconds
    uint256 public defaultExpiryDuration;

    /// @dev Mapping from user address to their token ID
    mapping(address => uint256) private _userTokens;

    /// @dev Mapping from token ID to its expiry time
    mapping(uint256 => uint256) private _tokenExpiryTimes;

    /// @notice Ensures the function is called by a manager
    /// @dev Modifier that requires the caller to be marked as a manager in `isManager` mapping.
    modifier onlyManagers() {
        require(isManager[_msgSender()], "Only managers can call this function");
        _;
    }

    /// @notice Emitted when a manager is set or unset
    event ManagerSet(address manager, bool flag);

    /// @notice Emitted when the default expiry duration is changed
    event DefaultExpiryDurationChanged(uint256 newDuration);

    /**
     * @dev Initializes the contract with the given name, symbol, and default expiry duration.
     * @param initialOwner The address of the initial owner.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     * @param expiryDuration The default duration (in seconds) until a token expires.
     */
    function initialize(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint256 expiryDuration
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Burnable_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        address[] memory managers = new address[](1);
        managers[0] = initialOwner;
        _setManagers(managers, true);
        _setDefaultExpiryDuration(expiryDuration);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @notice Sets the manager status for a list of addresses
     * @dev Can only be called by the contract owner.
     * @param managers An array of addresses whose manager status will be set
     * @param flag True to set as managers, false to remove manager status
     */
    function setManagers(address[] calldata managers, bool flag) external onlyOwner {
        _setManagers(managers, flag);
    }

    // @dev Private function to set or unset the manager status for a list of addresses.
    // @param managers An array of addresses whose manager status is being modified.
    // @param flag If true, the addresses are set as managers; if false, the manager status is removed.
    function _setManagers(address[] memory managers, bool flag) private {
        for (uint256 i = 0; i < managers.length; i++) {
            isManager[managers[i]] = flag;
            emit ManagerSet(managers[i], flag);
        }
    }

    /**
     * @notice Sets the default expiry duration for new tokens
     * @dev Can only be called by the contract owner. Emits `DefaultExpiryDurationChanged` event upon success.
     * @param newDuration The new default expiry duration in seconds
     */
    function setDefaultExpiryDuration(uint256 newDuration) external onlyOwner {
        _setDefaultExpiryDuration(newDuration);
    }

    /**
     * @dev Sets the default expiry duration for tokens. This internal function updates the state variable and emits an event.
     * @param newDuration The new default expiry duration in seconds. This duration will apply to all tokens issued after the change.
     */
    function _setDefaultExpiryDuration(uint256 newDuration) private {
        defaultExpiryDuration = newDuration;
        emit DefaultExpiryDurationChanged(newDuration);
    }

    /**
     * @notice Issues a new Soulbound Token to a user
     * @dev Mints a new token and sets its expiry. Reverts if the user already has a token or the token ID exists.
     * @param user Address to which the token will be issued
     * @param tokenId ID of the token to be issued
     */
    function issueToken(address user, uint256 tokenId) external onlyManagers {
        require(_ownerOf(tokenId) == address(0), "Token already exists");
        require(balanceOf(user) == 0, "User already has a token");

        _safeMint(user, tokenId);
        _userTokens[user] = tokenId;
        _setTokenExpiry(tokenId, block.timestamp + defaultExpiryDuration);
    }

    /**
     * @notice Revokes a token from a user
     * @dev Burns the token and clears its associated data. Reverts if the token doesn't exist.
     * @param tokenId ID of the token to be revoked
     */
    function revokeToken(uint256 tokenId) external onlyManagers {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        address tokenOwner = ownerOf(tokenId);
        _burn(tokenId);
        delete _userTokens[tokenOwner];
        delete _tokenExpiryTimes[tokenId];
    }

    /**
     * @notice Extends the expiry time of a token
     * @dev Sets the token's expiry time to the current block timestamp plus the default expiry duration.
     * @param tokenId ID of the token whose expiry is to be extended
     */
    function extendTokenExpiry(uint256 tokenId) external onlyManagers {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenExpiry(tokenId, block.timestamp + defaultExpiryDuration);
    }

    /**
     * @notice Returns the token ID associated with a user address
     * @dev Reverts if the user does not have a token.
     * @param user Address of the user
     * @return uint256 ID of the token owned by the user
     */
    function getTokenId(address user) external view returns (uint256) {
        require(_userTokens[user] != 0, "User does not have a token");
        return _userTokens[user];
    }

    /**
     * @notice Checks if a token is expired
     * @dev Compares the current block timestamp with the token's expiry time.
     * @param tokenId ID of the token to check
     * @return bool True if the token is expired, false otherwise
     */
    function isTokenExpired(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return block.timestamp > _tokenExpiryTimes[tokenId];
    }

    /**
     * @notice Calculates the time remaining before a token expires
     * @dev Returns 0 if the token is already expired.
     * @param tokenId ID of the token to check
     * @return uint256 Time in seconds until the token expires, or 0 if it is already expired
     */
    function timeBeforeExpiration(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        if (block.timestamp > _tokenExpiryTimes[tokenId]) {
            return 0;
        }

        return _tokenExpiryTimes[tokenId] - block.timestamp;
    }

    /**
     * @notice Checks if a token exists
     * @dev Utilizes the `ownerOf` function which reverts if the token does not exist.
     * @param tokenId ID of the token to check
     * @return bool True if the token exists, false otherwise
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
