# DappyKit Contracts

**Development Stage Warning: The contracts in this repository are currently under development. Use them at your own risk.**

This repository contains EVM contracts that form the foundation of the DappyKit ecosystem. These contracts are designed to allow billions of users to use DappyKit without any scaling, speed, or cost issues with transactions.

The core idea is to give users a choice in how they interact with smart contracts:
- **Fully Decentralized**: By using their own node infrastructure and paying for each operation individually.
- **Through a Gateway**: Gateways accept user modifications in the form of signed data, package them into a data block, and store a reference to it. This approach saves users' finances, as gateways pay for the transaction to store the reference only.
- **Hybrid Approach**: Users can use their own infrastructure in combination with gateways for greater flexibility and cost optimization.

The following contracts are available in the repository:
- `SocialConnections.sol`: Designed to store references to data about people's social connections.
- `FilesystemChanges.sol`: Intended for storing references to data about changes in people's file systems.
- `UserVerification.sol`: Used to issue a verification token to the user, confirming their registration in an external system.

## Deployed contracts

### Superchain (CREATE2) Addresses
| Contract                         | Superchain Address                                                                                                     |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------|
| SocialConnections.sol            | [0xB7C1C10A71d3C90f42351bec7E4BCd647C992743](https://blockscan.com/address/0xB7C1C10A71d3C90f42351bec7E4BCd647C992743)                                                                                 |
| FilesystemChanges.sol            | [0x55043C8f3e8Ec55D2d60Acef83024F3b6da5AAf0](https://blockscan.com/address/0x55043C8f3e8Ec55D2d60Acef83024F3b6da5AAf0) |

### Addresses
| Contract                         | Address                      |
|----------------------------------|-----------------------------------------|
| UserVerification.sol - Google    | [0xf9bEDeCc559EC47D0Ffb7341dcaefc74450612A7](https://optimistic.etherscan.io/address/0xf9bEDeCc559EC47D0Ffb7341dcaefc74450612A7)  |
| UserVerification.sol - Farcaster | [0x02e4227ed20379db2999511609b8e2b28f73f0e0](https://optimistic.etherscan.io/address/0x02e4227ed20379db2999511609b8e2b28f73f0e0)  |
| UserVerification.sol - Telegram  | [0x1bf480128191963ba004f325fc02363ca0bb1fff](https://optimistic.etherscan.io/address/0x1bf480128191963ba004f325fc02363ca0bb1fff)  |

[Old contracts](/docs/OLD_CONTRACTS.md).

## Deploy contracts

### With Create2 (preferable)

```shell
# localhost
npm run deploy-all-localhost

# OP Sepolia
npm run deploy-all-testnet-op

# OP Mainnet
npm run deploy-all-mainnet
```

### Local

```shell
# copy and fill the env file with the correct data
cp example.env .env

# deploy all the contracts to the test node
npm run deploy-test

# the deployed addresses will be saved in `dappy-contracts/deployed-contracts.json`
```

### Testnet

```shell
# copy and fill the env file with the correct data
cp example.env .env

# deploy all the contracts to Optimism Sepolia
npm run deploy-op-sepolia

# verify on Sourcify and Etherscan
npx hardhat verify --network testnet DEPLOYED_CONTRACT_ADDRESS

# the deployed addresses will be saved in `./deployed-contracts.json`
```

### Mainnet

```shell
# copy and fill the env file with the correct data
cp example.env .env

# deploy all the contracts to Optimism Mainnet
npm run deploy-op-mainnet

# verify on Sourcify and Etherscan
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS

# the deployed addresses will be saved in `./deployed-contracts.json`
```

## Testing smart contracts

```shell
# install dependencies
npm ci

# test the contracts
npx hardhat test
```

## Other

[Superchain Chains](https://www.superchain.eco/chains)
