import { ethers, upgrades } from "hardhat";
import { getMultiHash } from '../utils/data'
import { SocialConnections, TestSocialConnections } from '../../typechain-types'
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("SocialConnections Upgradeability", function () {
  it("should preserve state and add new functionality after upgrade", async function () {
    const [owner] = await ethers.getSigners();

    // Deploy the initial contract
    const SocialConnectionsV1 = await ethers.getContractFactory("SocialConnections");
    const socialConnectionsV1 = await upgrades.deployProxy(SocialConnectionsV1, [owner.address],{ initializer: 'initialize' });
    await socialConnectionsV1.waitForDeployment();

    // Interact with V1
    const multihashV1 = getMultiHash('test');
    const v1 = socialConnectionsV1.connect(owner) as SocialConnections
    await v1.setUserConnection(multihashV1);

    // Deploy the upgraded contract (V2)
    const SocialConnectionsV2 = await ethers.getContractFactory("TestSocialConnections");
    const socialConnectionsV2 = await upgrades.upgradeProxy(socialConnectionsV1, SocialConnectionsV2);

    // Verify state preservation
    expect(await socialConnectionsV2.userConnections(owner.address)).to.deep.equal(Object.values(multihashV1));
    expect(v1.target).equal(socialConnectionsV2.target);

    const aValue = 11
    const bValue = 22
    const cValue = 33
    const v2 = socialConnectionsV2.connect(owner) as TestSocialConnections
    await v2.setA(aValue);
    await v2.setB(bValue);
    await v2.setC(cValue);
    expect(await v2.a(owner.address)).to.deep.equal(aValue);
    expect(await v2.b(owner.address)).to.deep.equal(bValue);
    expect(await v2.c(owner.address)).to.deep.equal(cValue);

    // method only available in V1
    await expect(v1.setUserConnection(multihashV1)).to.eventually.be.rejected;
    // can't upgrade to the old version as in the new version added new variables
    await expect(upgrades.upgradeProxy(socialConnectionsV2, SocialConnectionsV1)).to.eventually.be.rejectedWith('New storage layout is incompatible');
  });

  it("should transfer ownership and allow only new owner to upgrade the contract", async function () {
    const [owner1, owner2] = await ethers.getSigners();

    // Deploy the initial contract
    const SocialConnectionsV1 = await ethers.getContractFactory("SocialConnections");
    const socialConnectionsV1 = await upgrades.deployProxy(SocialConnectionsV1, [owner1.address], { initializer: 'initialize' });
    await socialConnectionsV1.waitForDeployment();

    // Transfer ownership to owner2
    const v1 = socialConnectionsV1.connect(owner1) as SocialConnections
    await v1.transferOwnership(owner2.address);
    expect(await v1.owner()).to.equal(owner2.address);

    // Deploy the upgraded contract (V2)
    const SocialConnectionsV2 = await ethers.getContractFactory("TestSocialConnections");

    // Attempt upgrade by old owner
    await expect(upgrades.upgradeProxy(socialConnectionsV1, SocialConnectionsV2)).to.eventually.be.rejected;
  });
});
