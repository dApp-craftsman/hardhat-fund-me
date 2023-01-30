const {
  networkConfig,
  developmentChains,
} = require('../helper-hardhat-config');
const { network } = require('hardhat');

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const { verify } = require('../utils/verify');
  const chainId = network.config.chainId;

  let ethUsdPriceFeed;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator');
    ethUsdPriceFeed = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeed = networkConfig[chainId].ethUsdPriceFeed;
  }
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeed],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (!developmentChains.includes(network.name) && process.env.ETHER) {
    await verify(fundMe.address, [ethUsdPriceFeed]);
  }

  log('---------------------------------');
};

module.exports.tags = ['all', 'fundme'];
