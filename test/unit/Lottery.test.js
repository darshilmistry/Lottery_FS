const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { devChains, networkConfig } = require("../../helper-hardhat.config")

!devChains.includes(network.name)
    ? describe.skip:
describe("Lottery Tests", function () {

    let lottery, testerslottery, VRFCoordinatorV2Mock, interval, entryFee, gasLane, gasLimit, timestamp 
    const chainId = network.config.chainId

    beforeEach(async () => {
        const { deployer, tester } = await getNamedAccounts()
        await deployments.fixture(["all"])
        VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        lottery = await ethers.getContract("Lottery", deployer)
    })

    describe("Constructs the Lottery corectly", () => {
        
        it("initializes state corectly", async () => {
            const state = String(await lottery.getLotteryState())
            assert.equal(state, "0")
        })

        it("initializes the timestamp", async () => {
            timestamp = String(await lottery.getLastTimeStamp())
            console.log("Time Stamp >>>>>>>>" + timestamp)
        })

        it("initializes entryFee corectly", async () => {
            entryFee = String(await lottery.getEntryFee())
            assert.equal(entryFee, String(networkConfig[chainId]["entryFee"]))
        })

        it("initializes gaslane correctly", async () => {
            gasLane = String(await lottery.getGasLane())
            assert.equal(gasLane,  String(networkConfig[chainId]["gasLane"]))
        })

        // it("initialies the subId correctly", async () => {
        //     const address = VRFCoordinatorV2Mock.address
        //     const response = await VRFCoordinatorV2Mock.createSubscription()
        //     const receipt = await response.wait(1)
        //     const subId = receipt.events[0].args.subId
        //     await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, subamt)
    
        // })

        it("initializes gasLimit correctly", async () => {
            gasLane = String(await lottery.getGasLane()) 
            assert.equal(gasLane, String(networkConfig[chainId]["gasLane"]))
        })

        it("initializes gasLimit correctly", async () => {
            gasLimit = String(await lottery.getCallbackGasLimit())
            assert.equal(gasLimit, String(networkConfig[chainId]["gasLimit"]))
        })

        it("initializes interval corectly", async () => {
            interval = await lottery.getInterval()
            assert.equal(interval.toString(), networkConfig[chainId]["updateInterval"])
        })
    })

    describe("Lottery Entry", () => {

        let tester, entryFee

        beforeEach(async () => {
            const signers = await ethers.getSigners()
            tester = signers[9]
            testerslottery = await ethers.getContract("Lottery", tester)
            entryFee = String(await testerslottery.getEntryFee())
        })

        it("Fails on getting not enough fund", async () => {
            await expect(testerslottery.enterLottery()).to.be.revertedWith("Lottery__NotEnoughEntryFee")
        })

        it("Records player entry", async () => {
            await testerslottery.enterLottery({value: entryFee})
            const response = await testerslottery.getPlayer(0)
            assert.equal(String(tester.address), String(response))
        })

        it("Evaluates the emited event", async () => {
            const trx = await testerslottery.enterLottery({value: entryFee})
            expect(trx).to.emit(
                "Lottery",
                "LotteryEntry"
            )
        })

        it("Allows no entry after lottery is closeed", async () => {
            await testerslottery.enterLottery({value: entryFee})
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 2])
            await network.provider.send("evm_mine", [])
//       or await network.provider.request({method: "evm_mine", perams: []})
            expect(testerslottery.enterLottery({value: entryFee}))
            .to.be.revertedWith("Lottery__LotteryClosed")
        })

    })

    describe("check up keep", () => {
        it("fails if no funds are deposited", async () => {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 2])
            await network.provider.send("evm_mine", [])

            expect( await testerslottery.callStatic.checkUpkeep([]) ).to.emit(
                "Lottery",
                "UpkeepNotNeeded"
            )
        })

        it("emits event on sucessfull check", async () => {
            await testerslottery.enterLottery({value: entryFee})
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 2])
            await network.provider.send("evm_mine", [])
            expect( await testerslottery.callStatic.checkUpkeep([]) ).to.emit(
                "Lottery",
                "PerformUpKeep"
            )
        })
    })

    describe("perform up keep", () => {
        
        it("Should fail with upkeep not needed", async () => {            
            expect(await testerslottery.callStatic.performUpkeep([]))
            .to.be.reverted("Lottery__UpkeeppNotNeeded")
        })

        //todo chech for posetive


    })

    describe("Fulfill random word", () => {

// test for invalid request id

        beforeEach(async () => {
            let signersLottery
            const signers = await ethers.getSigners()
            let signer = 1
            for(signer; signer <= 6; signer += 1) {
                signersLottery = await ethers.getContract("Lottery", signers[signer])
                signersLottery.enterLottery({value: entryFee})
            }
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 2])
            await network.provider.send("evm_mine", [])
        })

        it("Picks a winner and resets Lottery", async () => {
            const curtimestamp = await testerslottery.getLastTimeStamp()

            await new Promise(async (resolve, reject) => {
                testerslottery.once("WinnerPicked", () => {})
                console.log("Found the winner >>>>>>>>>>>>>>>>")
                try{
                    
                }catch (e) {
                    reject(e)
                }
            })

            const trx = await testerslottery.performUpkeep([])
            const receipt = await trx.wait(1)
            await VRFCoordinatorV2Mock.fulfillRandinWords(
                receipt.events[1].args.requestId,
                lottery.address
            )

        })
    })
})