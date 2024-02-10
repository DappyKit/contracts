import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { getBytes32Hash, ONE_YEAR } from '../utils/data'
import { Wallet } from 'alchemy-sdk'

const EXPIRED_TOKEN_SECONDS = 100

describe('UserVerification', () => {
  async function deployUserVerificationFixture(expired = EXPIRED_TOKEN_SECONDS) {
    const [owner, otherAccount] = await ethers.getSigners()

    const tokenId = getBytes32Hash('google.1234567890098765')
    const tokenId2 = getBytes32Hash('google.1234567890098766')
    const UserVerification = await ethers.getContractFactory('UserVerification')
    const userVerification = await UserVerification.deploy()
    await userVerification.initialize(owner.address, 'UserVerificationToken', 'UVT', expired)

    return { userVerification, owner, otherAccount, tokenId, tokenId2 }
  }

  describe('initialize', () => {
    it('should not initialize more than once', async () => {
      const { userVerification, owner } = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.initialize(owner.address, 'UserVerificationToken', 'UVT', ONE_YEAR)).to.be.reverted
    })
  })

  describe('issueToken', () => {
    it('should issue a new token', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      expect(await userVerification.balanceOf(owner.address)).to.equal(0)
      await userVerification.issueToken(owner.address, tokenId)
      expect(await userVerification.balanceOf(owner.address)).to.equal(1)
    })

    it('should not issue a token if one already exists for the user', async () => {
      const { userVerification, owner, tokenId, tokenId2 } = await loadFixture(deployUserVerificationFixture)
      const wallet2 = Wallet.createRandom()

      await userVerification.issueToken(owner.address, tokenId)
      await expect(userVerification.issueToken(owner.address, tokenId2)).to.be.revertedWith('User already has a token')
      await expect(userVerification.issueToken(wallet2.address, tokenId)).to.be.revertedWith('Token should not exist')
    })
  })

  describe('revokeToken', () => {
    it('should revoke a token', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      expect(await userVerification.ownerOf(tokenId)).to.equal(owner.address)
      expect(await userVerification.getTokenId(owner.address)).to.equal(tokenId)
      await userVerification.revokeToken(tokenId)
      expect(await userVerification.balanceOf(owner.address)).to.equal(0)
    })

    it('should fail to revoke a non-existent token', async () => {
      const { userVerification, tokenId } = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.revokeToken(tokenId)).to.be.revertedWith('Token does not exist')
    })
  })

  describe('extendTokenExpiry', () => {
    it('should extend the expiry of a token', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      expect(await userVerification.getTokenId(owner.address)).to.equal(tokenId)
      expect(await userVerification.isTokenExpired(tokenId)).to.equal(false)
      const timeToAdvance = EXPIRED_TOKEN_SECONDS + 1
      await ethers.provider.send('evm_increaseTime', [timeToAdvance])
      await ethers.provider.send('evm_mine')
      expect(await userVerification.isTokenExpired(tokenId)).to.equal(true)

      await userVerification.extendTokenExpiry(tokenId)
      expect(await userVerification.isTokenExpired(tokenId)).to.equal(false)
    })
  })

  describe('hasToken', () => {
    it('should return true if a user has a token', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      expect(await userVerification.balanceOf(owner.address)).to.equal(1)
    })

    it('should return false if a user does not have a token', async () => {
      const { userVerification, otherAccount } = await loadFixture(deployUserVerificationFixture)

      expect(await userVerification.balanceOf(otherAccount.address)).to.equal(0)
    })
  })

  describe('getTokenId', () => {
    it('should return the token ID for a user', async () => {
      const { userVerification, otherAccount, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(otherAccount.address, tokenId)
      expect(await userVerification.getTokenId(otherAccount.address)).to.equal(tokenId)
    })

    it('should revert if the user does not have a token', async () => {
      const { userVerification, otherAccount } = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.getTokenId(otherAccount.address)).to.be.revertedWith('User does not have a token')
    })
  })

  describe('isTokenExpired', () => {
    it('should return true if a token is expired', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      expect(await userVerification.isTokenExpired(tokenId)).to.equal(false)
      // Advance the blockchain time by the required amount
      const timeToAdvance = EXPIRED_TOKEN_SECONDS + 1
      await ethers.provider.send('evm_increaseTime', [timeToAdvance])
      await ethers.provider.send('evm_mine') // This command forces a new block to be mined, applying the time increase

      expect(await userVerification.isTokenExpired(tokenId)).to.equal(true)
    })

    it('should return false if a token is not expired', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      expect(await userVerification.isTokenExpired(tokenId)).to.equal(false)
    })
  })

  describe('tokenExists', () => {
    it('should return true if a token exists', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      expect(await userVerification.tokenExists(tokenId)).to.equal(true)
    })

    it('should return false if a token does not exist', async () => {
      const { userVerification, tokenId } = await loadFixture(deployUserVerificationFixture)

      expect(await userVerification.tokenExists(tokenId)).to.equal(false)
    })
  })

  describe('timeBeforeExpiration', () => {
    it('should return positive time for a token not yet expired', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      const timeLeft = await userVerification.timeBeforeExpiration(tokenId)
      expect(timeLeft).to.be.above(0)
    })

    it('should closely match default expiry for a just issued token', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      const timeLeft = await userVerification.timeBeforeExpiration(tokenId)
      expect(timeLeft).to.be.closeTo(EXPIRED_TOKEN_SECONDS, 5) // Allowing a small delta for transaction execution time
    })

    it('should return 0 for an expired token', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      // Simulate time passage to expire the token
      await ethers.provider.send('evm_increaseTime', [EXPIRED_TOKEN_SECONDS + 1])
      await ethers.provider.send('evm_mine')
      const timeLeft = await userVerification.timeBeforeExpiration(tokenId)
      expect(timeLeft).to.equal(0)
    })

    it('should revert for a nonexistent token', async () => {
      const { userVerification, tokenId } = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.timeBeforeExpiration(tokenId)).to.be.revertedWith('Token does not exist')
    })

    it('should return updated time after extending token expiry', async () => {
      const { userVerification, owner, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      // Simulate time passage to expire the token
      await ethers.provider.send('evm_increaseTime', [EXPIRED_TOKEN_SECONDS + 1])
      await ethers.provider.send('evm_mine')
      // Extend the token's expiry
      await userVerification.extendTokenExpiry(tokenId)
      const timeLeft = await userVerification.timeBeforeExpiration(tokenId)
      expect(timeLeft).to.be.closeTo(EXPIRED_TOKEN_SECONDS, 5) // Assuming the extension is by another defaultExpiryDuration
    })
  })

  describe('Transfer Restrictions', () => {
    it('should not allow direct transfer of a token', async () => {
      const { userVerification, owner, otherAccount, tokenId } = await loadFixture(deployUserVerificationFixture)

      await userVerification.issueToken(owner.address, tokenId)
      await expect(userVerification.transferFrom(owner.address, otherAccount.address, tokenId)).to.be.revertedWith(
        'Token not transferable',
      )
    })

    it('should not allow safe transfer of a token', async () => {
      const { userVerification, owner, otherAccount, tokenId } = await loadFixture(deployUserVerificationFixture)

      // to prevent error: TypeError: ambiguous function description (i.e. matches "safeTransferFrom(address,address,uint256)", "safeTransferFrom(address,address,uint256,bytes)") (argument="key", value="safeTransferFrom", code=INVALID_ARGUMENT, version=6.8.1)
      const method = 'safeTransferFrom(address,address,uint256,bytes)'
      await expect(userVerification[method](owner.address, otherAccount.address, tokenId, '0x')).to.be.revertedWith(
        'Soulbound tokens cannot be transferred',
      )
    })

    it('should not allow transfer via approval', async () => {
      const { userVerification, otherAccount, tokenId } = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.approve(otherAccount.address, tokenId)).to.be.revertedWith(
        'Soulbound tokens cannot be approved for transfer',
      )
    })

    it('should not allow transfer via operator approval', async () => {
      const { userVerification, otherAccount } = await loadFixture(deployUserVerificationFixture)

      await expect(userVerification.setApprovalForAll(otherAccount.address, true)).to.be.revertedWith(
        'Soulbound tokens cannot set operator approvals',
      )
    })
  })
})
