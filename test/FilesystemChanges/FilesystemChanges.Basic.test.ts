import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { getMultiHash } from '../utils/data'

describe('FilesystemChanges', () => {
  async function deployFilesystemChangesFixture() {
    const [owner, otherAccount] = await ethers.getSigners()

    const FilesystemChanges = await ethers.getContractFactory('FilesystemChanges')
    const filesystemChanges = await FilesystemChanges.deploy()

    return { filesystemChanges, owner, otherAccount }
  }

  describe('setServiceChange', () => {
    it('should set a Multihash for the service account', async () => {
      const { filesystemChanges, owner } = await loadFixture(deployFilesystemChangesFixture)

      const multihash = getMultiHash('hello')
      await expect(filesystemChanges.connect(owner).setServiceChange(multihash))
        .to.emit(filesystemChanges, 'ServiceConnectionSet')
        .withArgs(owner.address, ...Object.values(multihash))
      expect(await filesystemChanges.serviceChanges(owner.address)).to.deep.equal(Object.values(multihash))
    })
  })

  describe('setUserChange', () => {
    it('should set a Multihash for the user account', async () => {
      const { filesystemChanges, owner } = await loadFixture(deployFilesystemChangesFixture)

      const multihash = getMultiHash('hello')
      await expect(filesystemChanges.connect(owner).setUserChange(multihash))
        .to.emit(filesystemChanges, 'UserConnectionSet')
        .withArgs(owner.address, ...Object.values(multihash))
      expect(await filesystemChanges.userChanges(owner.address)).to.deep.equal(Object.values(multihash))
    })

    it('should overwrite existing data with new data for the same user account', async () => {
      const { filesystemChanges, owner } = await loadFixture(deployFilesystemChangesFixture)

      const initialMultihash = getMultiHash('initial')
      await expect(filesystemChanges.connect(owner).setUserChange(initialMultihash))
        .to.emit(filesystemChanges, 'UserConnectionSet')
        .withArgs(owner.address, ...Object.values(initialMultihash))

      const newMultihash = getMultiHash('new')
      await expect(filesystemChanges.connect(owner).setUserChange(newMultihash))
        .to.emit(filesystemChanges, 'UserConnectionSet')
        .withArgs(owner.address, ...Object.values(newMultihash))

      expect(await filesystemChanges.userChanges(owner.address)).to.deep.equal(Object.values(newMultihash))
    })

    it("should prevent a user from storing a Multihash for another user's account", async () => {
      const { filesystemChanges, owner, otherAccount } = await loadFixture(deployFilesystemChangesFixture)

      const initialMultihash = getMultiHash('initial')
      const initialMultihash2 = getMultiHash('initial2')
      await filesystemChanges.connect(owner).setUserChange(initialMultihash)
      await filesystemChanges.connect(otherAccount).setUserChange(initialMultihash2)

      expect(await filesystemChanges.userChanges(owner.address)).to.deep.equal(Object.values(initialMultihash))
      expect(await filesystemChanges.userChanges(otherAccount.address)).to.deep.equal(Object.values(initialMultihash2))
    })
  })

  describe('removeChange', () => {
    it("should remove the Multihash associated with the user's account", async () => {
      const { filesystemChanges, owner } = await loadFixture(deployFilesystemChangesFixture)

      const multihash = getMultiHash('hello')

      await filesystemChanges.connect(owner).setUserChange(multihash)
      await expect(filesystemChanges.connect(owner).removeChange(false))
        .to.emit(filesystemChanges, 'ConnectionRemoved')
        .withArgs(owner.address, false)

      expect(await filesystemChanges.userChanges(owner.address)).to.deep.equal([ethers.ZeroHash, 0, 0])
    })
  })
})
