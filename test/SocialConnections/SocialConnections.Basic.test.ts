import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { getMultiHash } from '../utils/data'

describe('SocialConnections', function () {
  async function deploySocialConnectionsFixture() {
    const [owner, otherAccount] = await ethers.getSigners()

    const SocialConnections = await ethers.getContractFactory('SocialConnections')
    const socialConnections = await SocialConnections.deploy()
    await socialConnections.initialize(owner.address)

    return {socialConnections, owner, otherAccount}
  }

  describe('initialize', function () {
    it('should not initialize more than once', async function () {
      const [owner, otherAccount] = await ethers.getSigners()
      const {socialConnections} = await loadFixture(deploySocialConnectionsFixture)

      await expect(socialConnections.initialize(owner.address)).to.eventually.be.rejectedWith('VM Exception while processing transaction: reverted with custom error \'InvalidInitialization()')
    })
  })

  describe('setServiceConnection', function () {
    it('should set a Multihash for the service account', async function () {
      const {socialConnections, owner} = await loadFixture(deploySocialConnectionsFixture)

      const multihash = getMultiHash('hello')
      await socialConnections.connect(owner).setServiceConnection(multihash)
      expect(await socialConnections.serviceConnections(owner.address)).to.deep.equal(Object.values(multihash))
    })
  })

  describe('setUserConnection', function () {
    it('should set a Multihash for the user account', async function () {
      const {socialConnections, owner} = await loadFixture(deploySocialConnectionsFixture)

      const multihash = getMultiHash('hello')
      await socialConnections.connect(owner).setUserConnection(multihash)
      expect(await socialConnections.userConnections(owner.address)).to.deep.equal(Object.values(multihash))
    })

    it('should overwrite existing data with new data for the same user account', async function () {
      const {socialConnections, owner} = await loadFixture(deploySocialConnectionsFixture)

      const initialMultihash = getMultiHash('initial')
      await socialConnections.connect(owner).setUserConnection(initialMultihash)

      const newMultihash = getMultiHash('new')
      await socialConnections.connect(owner).setUserConnection(newMultihash)

      expect(await socialConnections.userConnections(owner.address)).to.deep.equal(Object.values(newMultihash))
    })

    it('should prevent a user from storing a Multihash for another user\'s account', async function () {
      const {socialConnections, owner, otherAccount} = await loadFixture(deploySocialConnectionsFixture)

      const initialMultihash = getMultiHash('initial')
      const initialMultihash2 = getMultiHash('initial2')
      await socialConnections.connect(owner).setUserConnection(initialMultihash)
      await socialConnections.connect(otherAccount).setUserConnection(initialMultihash2)

      expect(await socialConnections.userConnections(owner.address)).to.deep.equal(Object.values(initialMultihash))
      expect(await socialConnections.userConnections(otherAccount.address)).to.deep.equal(Object.values(initialMultihash2))
    })
  })

  describe('removeConnection', function () {
    it('should remove the Multihash associated with the user\'s account', async function () {
      const {socialConnections, owner} = await loadFixture(deploySocialConnectionsFixture)

      const multihash = getMultiHash('hello')

      await socialConnections.connect(owner).setUserConnection(multihash)
      await socialConnections.connect(owner).deleteConnection(false)

      expect(await socialConnections.userConnections(owner.address)).to.deep.equal([ethers.ZeroHash, 0, 0])
    })
  })
})
