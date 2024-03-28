# DappyKit Contracts

**Development Stage Warning: The contracts in this repository are currently under development. Use them at your own risk.**

This repository contains Ethereum Virtual Machine (EVM) contracts that form the foundation of the DappyKit ecosystem. These contracts are designed to allow billions of users to use DappyKit without any scaling, speed, or cost issues with transactions.

The core idea is to give users a choice in how they interact with smart contracts:
- **Fully Decentralized**: By using their own node infrastructure and paying for each operation individually.
- **Through a Gateway**: Gateways accept user modifications in the form of signed data, package them into a data block, and store a reference to it. This approach saves users' finances, as gateways pay for the transaction to store the reference only.
- **Hybrid Approach**: Users can use their own infrastructure in combination with gateways for greater flexibility and cost optimization.

The following contracts are available in the repository:
- `SocialConnections.sol`: Designed to store references to data about people's social connections.
- `FilesystemChanges.sol`: Intended for storing references to data about changes in people's file systems.
- `UserVerification.sol`: Used to issue a verification token to the user, confirming their registration in an external system.

## Deployed contracts

|                                  | OP Mainnet                                                                                                                       | OP Sepolia                                                                                                                                      |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| SocialConnections.sol            | [0xEbA1B39F0d9CF5B2619F95dEc6543eC258767fC2](https://optimistic.etherscan.io/address/0xeba1b39f0d9cf5b2619f95dec6543ec258767fc2) | [0xD8FC858221428B6b8ce304CE7aF1E838067Ea806](https://sepolia-optimism.etherscan.io/address/0xD8FC858221428B6b8ce304CE7aF1E838067Ea806) (v1.0.0) |
| FilesystemChanges.sol            | [0x831EB58fA6b6E488811179B3dC19c5524059bA58](https://optimistic.etherscan.io/address/0x831EB58fA6b6E488811179B3dC19c5524059bA58) | [0x204B8968E70084cDCBad327614334F1D7553aaF2](https://sepolia-optimism.etherscan.io/address/0x204B8968E70084cDCBad327614334F1D7553aaF2) (v1.0.0) |
| UserVerification.sol - Google    | [0xf9bEDeCc559EC47D0Ffb7341dcaefc74450612A7](https://optimistic.etherscan.io/address/0xf9bEDeCc559EC47D0Ffb7341dcaefc74450612A7) | [0x721462E34DCC00F8Bd0f0cD07762cfd482a0Fcb4](https://sepolia-optimism.etherscan.io/address/0x721462E34DCC00F8Bd0f0cD07762cfd482a0Fcb4) (v1.0.3) |
| UserVerification.sol - Farcaster | [0x02e4227ed20379db2999511609b8e2b28f73f0e0](https://optimistic.etherscan.io/address/0x02e4227ed20379db2999511609b8e2b28f73f0e0) | N/A                                                                                                                                             |
| UserVerification.sol - Telegram  | [0x1bf480128191963ba004f325fc02363ca0bb1fff](https://optimistic.etherscan.io/address/0x1bf480128191963ba004f325fc02363ca0bb1fff) | N/A                                                                                                                                             |

- `LightAccountFactory.sol`: [0x00000055C0b4fA41dde26A74435ff03692292FBD](https://sepolia-optimism.etherscan.io/address/0x00000055C0b4fA41dde26A74435ff03692292FBD) by [Alchemy](https://docs.alchemy.com/reference/factory-addresses#testnet-deployments)

## Deploy contracts

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

## Testing smart contracts without ERC-4337

```shell
# install dependencies
npm ci

# test the contracts
npx hardhat test
```

## Testing smart contracts with ERC-4337 (not ready)

1. Install dependencies
```shell
npm ci
npx hardhat node
```

2. Install EthInfinitism bundler as a separate project outside

```shell
git clone git@github.com:eth-infinitism/bundler.git
cd bundler
git checkout 3fcc4eff5d9c3ccbf9863fa298e6d565801446cf
yarn && yarn preprocess
yarn hardhat-deploy --network localhost
yarn run bundler --unsafe
```

3. Test Runop

```shell
yarn run runop --deployFactory --network http://localhost:8545/ --entryPoint 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
```
4. To be continued...
