const { ethers } = require("hardhat")

const networkConfig = {
    11155111: {
        name: "Sapoila",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        entryFee: ethers.utils.parseEther("0.3"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId: "2992",
        gasLimit: ethers.utils.parseEther("0.000000003"),
        updateInterval: "60"
    },
    31337: {
        name: "localhost",
        entryFee: ethers.utils.parseEther("3"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        gasLimit: ethers.utils.parseEther("0.000000003"),
        updateInterval: "30"
    }
}

const devChains = ["hardhat", "localHost", "ganache"]

module.exports = {
    networkConfig,
    devChains
}