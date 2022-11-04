// This is cloned and modified from https://docs.ens.domains/deploying-ens-on-a-private-chain#script-deploy.js
// Lines modified have been commented out as // old
// Summary of changes
// Added in console.log to display all contract addresses deployed
// For PublicResolver have populated two fields not in the documentation  _trustedETHController and _trustedReverseRegistrar
// For reverseRegistrar have removed resolver.address
// Added in deploy StaticMetadataService.sol and NameWrapper.sol to support ens-metadata service

const hre = require("hardhat");
const namehash = require('eth-ens-namehash');
const tld = "test";
const ethers = hre.ethers;
const utils = ethers.utils;
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
async function main() {
  const ENSRegistry = await ethers.getContractFactory("ENSRegistry")
  const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar")
  const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar")
  const PublicResolver = await ethers.getContractFactory("PublicResolver")
  const StaticMetadataService = await ethers.getContractFactory("StaticMetadataService")
  const NameWrapper = await ethers.getContractFactory("NameWrapper")
  const signers = await ethers.getSigners();
  const accounts = signers.map(s => s.address)

  const ens = await ENSRegistry.deploy()
  await ens.deployed()
  console.log(`ens.address: ${ens.address}`)
// old:   const resolver = await PublicResolver.deploy(ens.address, ZERO_ADDRESS);
// TOD: Update last two resolver parameters for _trustedETHController and _trustedReverseRegistrar
  const resolver = await PublicResolver.deploy(ens.address, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS);
  await resolver.deployed()
  console.log(`resolver.address: ${resolver.address}`)
  await setupResolver(ens, resolver, accounts)
  const registrar = await  FIFSRegistrar.deploy(ens.address, namehash.hash(tld));
  await registrar.deployed()
  console.log(`registrar.address: ${registrar.address}`)
  await setupRegistrar(ens, registrar);
//old   const reverseRegistrar = await ReverseRegistrar.deploy(ens.address, resolver.address);
  const reverseRegistrar = await ReverseRegistrar.deploy(ens.address);
  await reverseRegistrar.deployed()
  await setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts);
// Added in deploy StaticMetadataService.sol and NameWrapper.sol to support ens-metadata service
  let metadataHost = process.env.METADATA_HOST || 'ens-metadata-service.appspot.com'
  if (network.name === 'localhost') {
    metadataHost = 'http://localhost:8080'
  }
  const metadataUrl = `${metadataHost}/name/0x{id}`
  const staticMetadataService = await StaticMetadataService.deploy(metadataUrl)
  await staticMetadataService.deployed()
  console.log(`staticMetadataService.address: ${staticMetadataService.address}`)
  const nameWrapper = await NameWrapper.deploy(ens.address, registrar.address, staticMetadataService.address)
  await nameWrapper.deployed()
  console.log(`nameWrapper.address: ${nameWrapper.address}`)
};

async function setupResolver(ens, resolver, accounts) {
  const resolverNode = namehash.hash("resolver");
  const resolverLabel = labelhash("resolver");
  await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, accounts[0]);
  await ens.setResolver(resolverNode, resolver.address);
  await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address);
}

async function setupRegistrar(ens, registrar) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash(tld), registrar.address);
}

async function setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash("reverse"), accounts[0]);
  await ens.setSubnodeOwner(namehash.hash("reverse"), labelhash("addr"), reverseRegistrar.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });