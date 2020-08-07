const Web3 = require('web3');
const CONTRACT_DATA = require('../contract/WFIL.json');

const { WEB3_PROVIDER, MINTER_ADDRESS, CONTRACT_ADDRESS } = process.env;
let provider;

function getInstance() {
  if (!provider) {
    try {
      provider = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER));
    } catch (err) {
      console.log("err", err);
      return null;
    }
  }
  return provider;
}

exports.getContract = () => {
  const instance = getInstance();
  const contract = new instance.eth.Contract(CONTRACT_DATA.abi, `0x${CONTRACT_ADDRESS}`);
  return contract;
}

exports.send = async (transaction, ETH_PK) => {
  const instance = getInstance();
  const gas = await transaction.estimateGas({ from: `0x${MINTER_ADDRESS}`, gas: 60000000 });
  const options = {
    to: transaction._parent._address,
    data: transaction.encodeABI(),
    gas
  };
  const signedTransaction = await instance.eth.accounts.signTransaction(options, ETH_PK);
  return new Promise((resolve, reject) => {
    instance.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      .on('receipt', receipt => {
        // console.log("send -> receipt", receipt)
        if (receipt.status) resolve(receipt);
      })
      .on('error', (error, receipt) => reject(error, receipt));
  })
}