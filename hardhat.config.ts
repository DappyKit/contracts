import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import '@openzeppelin/hardhat-upgrades'
import 'dotenv/config'

if (!process.env.DEPLOYER_GATEWAY_URL) {
  throw new Error('DEPLOYER_GATEWAY_URL env variable not set')
}

if (!process.env.DEPLOYER_GATEWAY_URL_MAINNET) {
  throw new Error('DEPLOYER_GATEWAY_URL_MAINNET env variable not set')
}

if (!process.env.DEPLOYER_PRIVATE_KEY_MAINNET) {
  throw new Error('DEPLOYER_PRIVATE_KEY_MAINNET env variable not set')
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
        runs: 1000000,
      },
      // https://soliditylang.org/blog/2023/05/10/solidity-0.8.20-release-announcement
      evmVersion: 'shanghai',
    },
  },
  networks: {
    testnet: {
      url: process.env.DEPLOYER_GATEWAY_URL,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
      // 5000000000 = 5 gwei
      gasPrice: 5000000000,
    },
    mainnet: {
      url: process.env.DEPLOYER_GATEWAY_URL_MAINNET,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY_MAINNET}`],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
      {
        network: 'sepoliaOptimism',
        chainId: 11155420,
        urls: {
          apiURL: 'https://api-sepolia-optimism.etherscan.io/api?module=contract',
          browserURL: 'https://sepolia-optimism.etherscan.io/',
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
}

export default config
