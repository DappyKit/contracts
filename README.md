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

Network: [Optimism Sepolia](https://sepolia-optimism.etherscan.io/)

- `SocialConnections.sol`: [0xD8FC858221428B6b8ce304CE7aF1E838067Ea806](https://sepolia-optimism.etherscan.io/address/0xD8FC858221428B6b8ce304CE7aF1E838067Ea806)
- `FilesystemChanges.sol`: [0x204B8968E70084cDCBad327614334F1D7553aaF2](https://sepolia-optimism.etherscan.io/address/0x204B8968E70084cDCBad327614334F1D7553aaF2)
- `UserVerification.sol`: [0xBA44aaa2809931401ec099D798A5376cd678a12a](https://sepolia-optimism.etherscan.io/address/0xBA44aaa2809931401ec099D798A5376cd678a12a)

## Deploy contracts

```shell
# copy and fill the env file with the correct data
cp example.env .env
# deploy all the contracts to the testnet
npx hardhat run --network testnet scripts/deploy-dappy.ts
```

## Testing smart contracts without ERC-4337

```shell
npm ci
npx hardhat test
```

## Testing smart contracts with ERC-4337

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
