import { ethers } from 'hardhat'
import 'dotenv/config'
import { AddressLike } from 'ethers'

const socialConnectionsOwner = process.env.SOCIAL_CONNECTIONS_OWNER as AddressLike
const filesystemChangesOwner = process.env.FILESYSTEM_CHANGES_OWNER as AddressLike
const userVerificationOwner = process.env.USER_VERIFICATION_OWNER as AddressLike
const userVerificationTokenName = process.env.USER_VERIFICATION_TOKEN_NAME as string
const userVerificationTokenSymbol = process.env.USER_VERIFICATION_TOKEN_SYMBOL as string
const userVerificationTokenExpirationTime = Number(process.env.USER_VERIFICATION_TOKEN_EXPIRATION_TIME)

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

console.log('SOCIAL_CONNECTIONS_OWNER', socialConnectionsOwner)
console.log('FILESYSTEM_CHANGES_OWNER', filesystemChangesOwner)
console.log('USER_VERIFICATION_OWNER', userVerificationOwner)

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  // deploy SocialConnections
  console.log('Deploying SocialConnections...')
  const socialConnections = await ethers.deployContract('SocialConnections')
  await socialConnections.waitForDeployment()
  await socialConnections.initialize(socialConnectionsOwner)
  console.log(`SocialConnections deployed to ${socialConnections.target}`)

  // deploy FilesystemChanges
  console.log('Deploying FilesystemChanges...')
  const filesystemChanges = await ethers.deployContract('FilesystemChanges')
  await filesystemChanges.waitForDeployment()
  await filesystemChanges.initialize(filesystemChangesOwner)
  console.log(`FilesystemChanges deployed to ${filesystemChanges.target}`)

  // deploy UserVerification
  console.log('Deploying UserVerification...')
  const userVerification = await ethers.deployContract('UserVerification')
  await userVerification.waitForDeployment()
  await userVerification.initialize(userVerificationOwner, userVerificationTokenName, userVerificationTokenSymbol, userVerificationTokenExpirationTime)
  console.log(`UserVerification deployed to ${userVerification.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
