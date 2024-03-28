import { ethers } from 'hardhat'
import 'dotenv/config'
import { Contract } from 'ethers'

const userVerificationAddress = process.env.USER_VERIFICATION_ADDRESS as string
const managersString = process.env.MANAGERS

if (!managersString) {
  throw new Error('MANAGERS env variable not set')
}

if (!userVerificationAddress) {
  throw new Error('USER_VERIFICATION_ADDRESS env variable not set')
}

const managers = managersString
  .split(',')
  .map(manager => manager.trim())
  .filter(manager => manager)

if (!managers.length) {
  throw new Error('managers list is empty')
}

// eslint-disable-next-line no-console
console.log('MANAGERS', managers)
// eslint-disable-next-line no-console
console.log('USER_VERIFICATION_ADDRESS', userVerificationAddress)

async function main() {
  const [deployer] = await ethers.getSigners()
  // eslint-disable-next-line no-console
  console.log('Admin address:', deployer.address)

  // eslint-disable-next-line no-console
  console.log('Setting managers...')
  const contract = new Contract(userVerificationAddress, ['function setManagers(address[], bool)'], deployer)
  await contract.setManagers(managers, true)
  // eslint-disable-next-line no-console
  console.log('Done')
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exitCode = 1
})
