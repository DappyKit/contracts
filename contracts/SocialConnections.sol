// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title SocialConnections
 * @dev Store and manage social connections (in form of Multihash) for users and services.
 */
contract SocialConnections is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    struct Multihash {
        bytes32 hash;
        uint8 hashFunction;
        uint8 size;
    }

    // todo use ERC-7201 for storage https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#modifying-your-contracts
    // Mapping for service smart accounts' connections
    mapping(address => Multihash) public serviceConnections;

    // Mapping for user smart accounts' connections
    mapping(address => Multihash) public userConnections;

    /**
     * @dev Initialize the contract. This serves as a constructor for upgradeable contracts.
     */
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation)
    internal
    onlyOwner
    override
    {}

    /**
     * @dev Set a Multihash for the service smart account of the sender.
     * @param multihash Multihash to be stored.
     */
    function setServiceConnection(Multihash memory multihash) public {
        serviceConnections[msg.sender] = multihash;
    }

    /**
     * @dev Set a Multihash for the user smart account of the sender.
     * @param multihash Multihash to be stored.
     */
    function setUserConnection(Multihash memory multihash) public {
        userConnections[msg.sender] = multihash;
    }

    /**
     * @dev Delete the Multihash associated with the sender's smart account.
     * @param isService Indicates whether the sender's account is a service account.
     */
    function deleteConnection(bool isService) public {
        if (isService) {
            delete serviceConnections[msg.sender];
        } else {
            delete userConnections[msg.sender];
        }
    }
}
