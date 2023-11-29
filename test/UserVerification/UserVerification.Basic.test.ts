import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { ONE_YEAR } from '../utils/data'

const EXPIRED_TOKEN_SECONDS = 100

describe('UserVerification', function () {
  async function deployUserVerificationFixture(expired = EXPIRED_TOKEN_SECONDS) {
    const [owner, otherAccount] = await ethers.getSigners()

    const UserVerification = await ethers.getContractFactory('UserVerification')
    const userVerification = await UserVerification.deploy()
    await userVerification.initialize(owner.address, 'UserVerificationToken', 'UVT', expired)

    return {userVerification, owner, otherAccount}
  }

  describe('initialize', function () {
    it('should not initialize more than once', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.initialize(owner.address, 'UserVerificationToken', 'UVT', ONE_YEAR))
          .to.be.reverted
    })
  })

  describe('issueToken', function () {
    it('should issue a new token', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      expect(await userVerification.hasToken(owner.address)).to.equal(true)
    })

    it('should not issue a token if one already exists for the user', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      await expect(userVerification.issueToken(owner.address))
          .to.be.revertedWith('User already has a token')
    })
  })

  describe('revokeToken', function () {
    it('should revoke a token', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      const tokenId = await userVerification.getTokenId(owner.address)
      await userVerification.revokeToken(tokenId)
      expect(await userVerification.hasToken(owner.address)).to.equal(false)
    })

    it('should fail to revoke a non-existent token', async function () {
      const {userVerification} = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.revokeToken(9999)).to.be.revertedWith('Token does not exist')
    })
  })

  describe('reissueToken', function () {
    it('should reissue a token to a new user', async function () {
      const {userVerification, owner, otherAccount} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      const oldTokenId = await userVerification.getTokenId(owner.address)
      await userVerification.reissueToken(owner.address, otherAccount.address)
      expect(await userVerification.hasToken(otherAccount.address)).to.equal(true)
      expect(await userVerification.hasToken(owner.address)).to.equal(false)
    })

    it('should skip reissue if the new user already has a token', async function () {
      const {userVerification, owner, otherAccount} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      await userVerification.issueToken(otherAccount.address)
      await userVerification.reissueToken(owner.address, otherAccount.address)
      expect(await userVerification.hasToken(owner.address)).to.equal(false)
      expect(await userVerification.hasToken(otherAccount.address)).to.equal(true)
    })
  })

  describe('extendTokenExpiry', function () {
    it('should extend the expiry of a token', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      const tokenId = await userVerification.getTokenId(owner.address)
      await userVerification.extendTokenExpiry(tokenId)
      expect(await userVerification.isTokenExpired(tokenId)).to.equal(false)
    })
  })

  describe('hasToken', function () {
    it('should return true if a user has a token', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      expect(await userVerification.hasToken(owner.address)).to.equal(true)
    })

    it('should return false if a user does not have a token', async function () {
      const {userVerification, otherAccount} = await loadFixture(deployUserVerificationFixture)

      expect(await userVerification.hasToken(otherAccount.address)).to.equal(false)
    })
  })

  describe('getTokenId', function () {
    it('should return the token ID for a user', async function () {
      const {userVerification, owner, otherAccount} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(otherAccount.address)
      const tokenId = await userVerification.getTokenId(otherAccount.address)
      expect(tokenId).to.be.equal(1)
    })

    it('should revert if the user does not have a token', async function () {
      const {userVerification, otherAccount} = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.getTokenId(otherAccount.address)).to.be.revertedWith('User does not have a token')
    })
  })

  describe('isTokenExpired', function () {
    it('should return true if a token is expired', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      const tokenId = await userVerification.getTokenId(owner.address)
      expect(await userVerification.isTokenExpired(tokenId)).to.equal(false)
      // Advance the blockchain time by the required amount
      const timeToAdvance = EXPIRED_TOKEN_SECONDS + 1
      await ethers.provider.send('evm_increaseTime', [timeToAdvance])
      await ethers.provider.send('evm_mine') // This command forces a new block to be mined, applying the time increase

      expect(await userVerification.isTokenExpired(tokenId)).to.equal(true)
    })

    it('should return false if a token is not expired', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      const tokenId = await userVerification.getTokenId(owner.address)
      expect(await userVerification.isTokenExpired(tokenId)).to.equal(false)
    })
  })

  describe('tokenExists', function () {
    it('should return true if a token exists', async function () {
      const {userVerification, owner} = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address)
      const tokenId = await userVerification.getTokenId(owner.address)
      expect(await userVerification.tokenExists(tokenId)).to.equal(true)
    })

    it('should return false if a token does not exist', async function () {
      const {userVerification} = await loadFixture(deployUserVerificationFixture)

      expect(await userVerification.tokenExists(9999)).to.equal(false)
    })
  })
})
