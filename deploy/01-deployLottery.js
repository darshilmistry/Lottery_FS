module.exports = async function ({getNamedAccounts, deployments}) {

    const { devChains, networkConfig } = require("../helper-hardhat.config")
    const { deploy, log } = deployments
    const { network, ethers } = require("hardhat")
    const { verify } = require("../util/verify")


    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let VRFCoordinatorV2Address, subscriptionId
    const entryFee = networkConfig[chainId]["entryFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const gasLimit = networkConfig[chainId]["gasLimit"]
    const interval = networkConfig[chainId]["updateInterval"]
    const subamt = ethers.utils.parseEther("3")


    if(devChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const trxresponse = await VRFCoordinatorV2Mock.createSubscription()
        const receipt = await trxresponse.wait(1)
        subscriptionId = receipt.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, subamt)
    
    } else {
        VRFCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const arguments = [
        VRFCoordinatorV2Address,
        entryFee,
        gasLane, 
        subscriptionId,
        gasLimit,
        interval
    ]
    
    log("Deploying Lottery>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    const lottery = await deploy("Lottery", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfermations: network.config.blockConfirmations || 1
    })
    log("Lottry deployed>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

    const svrfCoordinatorV2 = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625"
    const sentryFee = ethers.utils.parseEther("0.3")
    const sgasLane = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
    const ssubscriptionId = "2992"
    const sgasLimit = ethers.utils.parseEther("0.000000003")
    const supdateInterval = "60"

    const sargs = [svrfCoordinatorV2, sentryFee, sgasLane, ssubscriptionId, sgasLimit, supdateInterval]
        

    log("Lottry verifying>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    await verify(lottery.address, sargs)
    log("Lottry verifieded>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")


}

module.exports.tags = ["main", "all"]