// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title TestSocialConnections
 * @dev Store and manage social connections (Multihash) for users and services.
 */
contract TestSocialConnections is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    struct Multihash {
        bytes32 hash;
        uint8 hashFunction;
        uint8 size;
    }

    mapping(address => Multihash) public serviceConnections;
    mapping(address => Multihash) public userConnections;
    mapping(address => uint8) public a;
    mapping(address => uint8) public b;
    mapping(address => uint8) public c;

    /**
     * @dev Initialize the contract. This serves as a constructor for upgradeable contracts.
     */
    function initialize(address initialOwner) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init(initialOwner);
    }

    function _authorizeUpgrade(address newImplementation)
    internal
    onlyOwner
    override
    {}

    function setA(uint8 data) public {
        a[msg.sender] = data;
    }

    function setB(uint8 data) public {
        b[msg.sender] = data;
    }

    function setC(uint8 data) public {
        c[msg.sender] = data;
    }
}
