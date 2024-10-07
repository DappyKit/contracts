// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FilesystemChanges
 * @dev Store and manage filesystem changes (in form of Multihash) for users and services.
 */
contract FilesystemChanges {
    struct Multihash {
        bytes32 hash;
        uint8 hashFunction;
        uint8 size;
    }

    // Mapping for service smart accounts' filesystem changes
    mapping(address => Multihash) public serviceChanges;

    // Mapping for user smart accounts' filesystem changes
    mapping(address => Multihash) public userChanges;

    /**
     * @dev Set a Multihash for the service smart account of the sender.
     * @param multihash Multihash to be stored.
     */
    function setServiceChange(Multihash memory multihash) public {
        serviceChanges[msg.sender] = multihash;
    }

    /**
     * @dev Set a Multihash for the user smart account of the sender.
     * @param multihash Multihash to be stored.
     */
    function setUserChange(Multihash memory multihash) public {
        userChanges[msg.sender] = multihash;
    }

    /**
     * @dev Remove the Multihash associated with the sender's smart account.
     * @param isService Indicates whether the sender's account is a service account.
     */
    function removeChange(bool isService) public {
        if (isService) {
            delete serviceChanges[msg.sender];
        } else {
            delete userChanges[msg.sender];
        }
    }
}
