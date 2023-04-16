const { assert } = require("chai")
const { getNamedAccounts, deployments, ethers } = require("hardhat")
const { devChains, networkConfig } = require("../../helper-hardhat.config")


!devChains.includes(network.name)
    ? describe.skip:
describe("Lottery Tests", function () {

    let lottery, VRFCoordinatorV2Mock, testersLottery, interval

    beforeEach(async () => {
        const { deployer, tester } = await getNamedAccounts()
        await deployments.fixture(["all"])
        VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        lottery = await ethers.getContract("Lottery", deployer)
        interval = await lottery.getInterval()
        console.log(interval)
    })

    describe("constructor", function () {
        it("initializes the lottery correctly", async () => {
            
            const state = (await lottery.getLotteryState()).toString()

            assert.equal(state, "0")
            assert.equal(interval.toString(), networkConfig[chainId][updateInterval])
        })
    })

})