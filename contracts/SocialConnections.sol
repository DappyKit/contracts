// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SocialConnections
 * @dev Store and manage social connections (in form of Multihash) for users and services.
 */
contract SocialConnections {
    // Event for setting a service connection
    event ServiceConnectionSet(address indexed serviceAddress, bytes32 hash, uint8 hashFunction, uint8 size);

    // Event for setting a user connection
    event UserConnectionSet(address indexed userAddress, bytes32 hash, uint8 hashFunction, uint8 size);

    // Event for removing a connection
    event ConnectionRemoved(address indexed accountAddress, bool isService);

    struct Multihash {
        bytes32 hash;
        uint8 hashFunction;
        uint8 size;
    }

    // Mapping for service smart accounts' connections
    mapping(address => Multihash) public serviceConnections;

    // Mapping for user smart accounts' connections
    mapping(address => Multihash) public userConnections;

    /**
     * @dev Set a Multihash for the service smart account of the sender.
     * @param multihash Multihash to be stored.
     */
    function setServiceConnection(Multihash memory multihash) public {
        serviceConnections[msg.sender] = multihash;
        emit ServiceConnectionSet(msg.sender, multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
     * @dev Set a Multihash for the user smart account of the sender.
     * @param multihash Multihash to be stored.
     */
    function setUserConnection(Multihash memory multihash) public {
        userConnections[msg.sender] = multihash;
        emit UserConnectionSet(msg.sender, multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
     * @dev Remove the Multihash associated with the sender's smart account.
     * @param isService Indicates whether the sender's account is a service account.
     */
    function removeConnection(bool isService) public {
        if (isService) {
            delete serviceConnections[msg.sender];
        } else {
            delete userConnections[msg.sender];
        }

        emit ConnectionRemoved(msg.sender, isService);
    }
}
