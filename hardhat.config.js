require("@nomiclabs/hardhat-waffle")
// require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
// require("solidity-coverage")
// require("hardhat-gas-reporter")
// require("hardhat-contract-sizer")
require("dotenv").config({ path: __dirname + '/.env' })



const sapoila_rpc = String(process.env.SRPC)
const privateKey = String(process.env.PRIVATEKEY)

module.exports = {
  solidity: "0.8.18",
  
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 9
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      blockConfirmations: 1
    },
    sapoila: {
      url: sapoila_rpc,
      chainId: 11155111,
      blockConfirmations: 1,
      accounts: [ privateKey ] 
    },
  }

};
