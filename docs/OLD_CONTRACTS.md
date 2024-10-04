
### Old contracts

|                                  | OP Mainnet                                                                                                                       | OP Sepolia                                                                                                                                      |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| SocialConnections.sol            | [0xEbA1B39F0d9CF5B2619F95dEc6543eC258767fC2](https://optimistic.etherscan.io/address/0xeba1b39f0d9cf5b2619f95dec6543ec258767fc2) | [0xD8FC858221428B6b8ce304CE7aF1E838067Ea806](https://sepolia-optimism.etherscan.io/address/0xD8FC858221428B6b8ce304CE7aF1E838067Ea806) (v1.0.0) |
| FilesystemChanges.sol            | [0x831EB58fA6b6E488811179B3dC19c5524059bA58](https://optimistic.etherscan.io/address/0x831EB58fA6b6E488811179B3dC19c5524059bA58) | [0x204B8968E70084cDCBad327614334F1D7553aaF2](https://sepolia-optimism.etherscan.io/address/0x204B8968E70084cDCBad327614334F1D7553aaF2) (v1.0.0) |
| UserVerification.sol - Google    | [0xf9bEDeCc559EC47D0Ffb7341dcaefc74450612A7](https://optimistic.etherscan.io/address/0xf9bEDeCc559EC47D0Ffb7341dcaefc74450612A7) | [0x721462E34DCC00F8Bd0f0cD07762cfd482a0Fcb4](https://sepolia-optimism.etherscan.io/address/0x721462E34DCC00F8Bd0f0cD07762cfd482a0Fcb4) (v1.0.3) |
| UserVerification.sol - Farcaster | [0x02e4227ed20379db2999511609b8e2b28f73f0e0](https://optimistic.etherscan.io/address/0x02e4227ed20379db2999511609b8e2b28f73f0e0) | N/A                                                                                                                                             |
| UserVerification.sol - Telegram  | [0x1bf480128191963ba004f325fc02363ca0bb1fff](https://optimistic.etherscan.io/address/0x1bf480128191963ba004f325fc02363ca0bb1fff) | N/A                                                                                                                                             |

- `LightAccountFactory.sol`: [0x00000055C0b4fA41dde26A74435ff03692292FBD](https://sepolia-optimism.etherscan.io/address/0x00000055C0b4fA41dde26A74435ff03692292FBD) by [Alchemy](https://docs.alchemy.com/reference/factory-addresses#testnet-deployments)


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

