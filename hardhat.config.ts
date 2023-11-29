import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import 'dotenv/config'

if (!process.env.DEPLOYER_GATEWAY_URL) {
  throw new Error('DEPLOYER_GATEWAY_URL env variable not set')
}

if (!process.env.DEPLOYER_PRIVATE_KEY) {
  throw new Error('DEPLOYER_PRIVATE_KEY env variable not set')
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000
      },
      evmVersion: 'shanghai'
    },
  },
  networks: {
    testnet: {
      url: process.env.DEPLOYER_GATEWAY_URL,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
      // 5000000000 = 5 gwei
      gasPrice: 5000000000,
    }
  },
}

export default config
