import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import 'dotenv/config'

const userVerificationOwner = process.env.USER_VERIFICATION_OWNER
const userVerificationTokenName = process.env.USER_VERIFICATION_TOKEN_NAME as string
const userVerificationTokenSymbol = process.env.USER_VERIFICATION_TOKEN_SYMBOL as string
const userVerificationTokenExpirationTime = Number(process.env.USER_VERIFICATION_TOKEN_EXPIRATION_TIME)

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

export default buildModule('DeployUserVerification', m => {
  const userVerification = m.contract('UserVerification', [])

  m.call(userVerification, 'initialize', [
    userVerificationOwner,
    userVerificationTokenName,
    userVerificationTokenSymbol,
    userVerificationTokenExpirationTime,
  ])

  return { userVerification }
})
