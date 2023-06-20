const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { devChains, networkConfig } = require("../../helper-hardhat.config")

devChains.includes(network.name)
    ? describe.skip:
describe("Lottery Staging Tests", function () {
    console.log("Staging Test initiatedd")
    
    let lottery, entryFees, deployer

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        lottery = await ethers.getContract("Lottery", deployer)
        const chainId = await network.config.chainId
        entryFees = networkConfig[chainId]["entryFee"]
    })

    describe("fulfill Random Words", () => {

        it("does the job", async() => {
            const startingTime = await lottery.getLastTimeStamp()
            let winnerStartingBalance, winnerEndingBalace
            const signers = await ethers.getSigners()

            console.log("setting up listener>>>>>>>>>>>>>>>>>>>>>")
            await new Promise (async (resolve, reject) => {
                
                lottery.once("WinnerPicked", async () => {
                    console.log("Winner picked")
                    
                    try {
                        const winner = String(await lottery.getLastWinner())
                        winnerEndingBalace = await sigers[0].getBalance() 
                        const players = String(await lottery.getPlayerCount())
                        const state = String(await lottery.getLotteryState())
                        const endingTimeStamp = await lottery.getLastTimeStamp()

                        assert.equal(winner, deployer.address)
                        assert.equal(state, 0)
                        assert.equal(
                            winnerEndingBalace.toString(),
                            winnerStartingBalance.add(entryFees).toString()
                        )
                        assert(endingTimeStamp > startingTime)
                        assert.equal(players, "0")
                        resolve()
                    } catch(exception) {
                        reject()
                        console.log(exception)
                    }

                }) 

                winnerStartingBalance = await signers[0].getBalance()
                const tx = await lottery.enterRaffle({ value: entryFees })
                await tx.wait(1)
                console.log("entered Lottery>>>>>>>>>>>>>>>>>>>>>")

            })
        })

    })

})