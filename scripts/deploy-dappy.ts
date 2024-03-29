import { ethers } from 'hardhat'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const socialConnectionsOwner = process.env.SOCIAL_CONNECTIONS_OWNER as string
const filesystemChangesOwner = process.env.FILESYSTEM_CHANGES_OWNER as string
const userVerificationOwner = process.env.USER_VERIFICATION_OWNER as string
const userVerificationTokenName = process.env.USER_VERIFICATION_TOKEN_NAME as string
const userVerificationTokenSymbol = process.env.USER_VERIFICATION_TOKEN_SYMBOL as string
const userVerificationTokenExpirationTime = Number(process.env.USER_VERIFICATION_TOKEN_EXPIRATION_TIME)
const deployContracts = process.env.DEPLOY_CONTRACTS as string

if (!socialConnectionsOwner) {
  throw new Error('SOCIAL_CONNECTIONS_OWNER env variable not set')
}

if (!filesystemChangesOwner) {
  throw new Error('FILESYSTEM_CHANGES_OWNER env variable not set')
}

if (!userVerificationOwner) {
  throw new Error('USER_VERIFICATION_OWNER env variable not set')
}

if (!userVerificationTokenName) {
  throw new Error('USER_VERIFICATION_TOKEN_NAME env variable not set')
}

if (!userVerificationTokenSymbol) {
  throw new Error('USER_VERIFICATION_TOKEN_SYMBOL env variable not set')
}

if (!userVerificationTokenExpirationTime || userVerificationTokenExpirationTime <= 0) {
  throw new Error('USER_VERIFICATION_TOKEN_EXPIRATION_TIME env variable not set or invalid')
}

if (!deployContracts) {
  throw new Error('DEPLOY_CONTRACTS env variable not set')
}

let deploySocialConnections = false
let deployFilesystemChanges = false
let deployUserVerification = false

if (deployContracts === 'all') {
  deploySocialConnections = true
  deployFilesystemChanges = true
  deployUserVerification = true
} else {
  const contracts = deployContracts.split(',')
  for (const contract of contracts) {
    if (contract === 'SocialConnections') {
      deploySocialConnections = true
    } else if (contract === 'FilesystemChanges') {
      deployFilesystemChanges = true
    } else if (contract === 'UserVerification') {
      deployUserVerification = true
    } else {
      throw new Error(`Invalid contract type: ${contract}`)
    }
  }
}

// eslint-disable-next-line no-console
console.log('SOCIAL_CONNECTIONS_OWNER', socialConnectionsOwner)
// eslint-disable-next-line no-console
console.log('FILESYSTEM_CHANGES_OWNER', filesystemChangesOwner)
// eslint-disable-next-line no-console
console.log('USER_VERIFICATION_OWNER', userVerificationOwner)

async function main() {
  const [deployer] = await ethers.getSigners()
  // eslint-disable-next-line no-console
  console.log('Deploying contracts with the account:', deployer.address)

  let socialConnections

  if (deploySocialConnections) {
    // deploy SocialConnections
    // eslint-disable-next-line no-console
    console.log('Deploying SocialConnections...')
    socialConnections = await ethers.deployContract('SocialConnections')
    await socialConnections.waitForDeployment()
    await socialConnections.initialize(socialConnectionsOwner)
    // eslint-disable-next-line no-console
    console.log(`SocialConnections deployed to ${socialConnections.target}`)
  }

  let filesystemChanges

  if (deployFilesystemChanges) {
    // deploy FilesystemChanges
    // eslint-disable-next-line no-console
    console.log('Deploying FilesystemChanges...')
    filesystemChanges = await ethers.deployContract('FilesystemChanges')
    await filesystemChanges.waitForDeployment()
    await filesystemChanges.initialize(filesystemChangesOwner)
    // eslint-disable-next-line no-console
    console.log(`FilesystemChanges deployed to ${filesystemChanges.target}`)
  }

  let userVerification

  if (deployUserVerification) {
    // deploy UserVerification
    // eslint-disable-next-line no-console
    console.log('Deploying UserVerification...')
    userVerification = await ethers.deployContract('UserVerification')
    await userVerification.waitForDeployment()
    await userVerification.initialize(
      userVerificationOwner,
      userVerificationTokenName,
      userVerificationTokenSymbol,
      userVerificationTokenExpirationTime,
    )
    // eslint-disable-next-line no-console
    console.log(`UserVerification deployed to ${userVerification.target}`)
  }

  writeContractsJson({
    socialConnections: socialConnections?.target || '',
    filesystemChanges: filesystemChanges?.target || '',
    userVerification: userVerification?.target || '',
  })
}

function writeContractsJson(data: unknown) {
  const filePath = path.join(process.cwd(), 'deployed-contracts.json')
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    // eslint-disable-next-line no-console
    console.log(`File written successfully to ${filePath}`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error writing file:', error)
  }
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exitCode = 1
})
