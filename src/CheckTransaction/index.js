const { returnSuccess, returnFailure } = require('./lib/response.js');
const { getMessagesList, getClient } = require('./lib/lotusApi.js');
const { getContract, send } = require('./lib/web3-lib.js');
const { getTransaction, listPendingTransactions, updateTransaction } = require('./lib/database.js');
const { formatAddress, absoluteAmount } = require('./lib/helpers.js');
const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager();
const secretsNamespace = process.env.SECRETS_NAMESPACE;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS; 
const MAX_TX_CHECKS_NUMBER = 5;
/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id CheckTransaction --watch
*/
exports.handler = async (event, context) => {  
  try {
    const pendingTransactions = await listPendingTransactions();
    if (!pendingTransactions || pendingTransactions.length === 0) {
      return { success: true, message: 'NO_PENDING_TX' };
    }
    console.log("exports.handler -> pendingTransactions", pendingTransactions)

    for (let i = 0; i < MAX_TX_CHECKS_NUMBER; i += 1) {
      const wfilTransaction = pendingTransactions[i];
      console.log("exports.handler -> transaction", wfilTransaction)
      const { origin, amount, destination } = wfilTransaction;
      const messagesList = await getMessagesList(origin); 

      if (messagesList && messagesList.length > 0) {
        const wrappingMessages = messagesList.filter(message => message.to === VAULT_ADDRESS && Number(message.value) === Number(amount));
        console.log("exports.handler -> wrappingMessages", wrappingMessages)

        if (wrappingMessages && wrappingMessages.length > 0) {
          const { cid } = wrappingMessages[0];
          const processedTransaction = await getTransaction(cid);
          if (processedTransaction && processedTransaction.status === 'success') {
            console.log("exports.handler -> Already processed -> cid", cid)
            return;
          }

          const ethResponse = await secretsManager.getSecretValue({ SecretId: `${secretsNamespace}ETH_PK` }).promise();
          const ETH_PK = ethResponse.SecretString;
          const wfilContract = getContract();
          const ethTransaction = wfilContract.methods.mint(destination, String(amount));
          const result = await send(ethTransaction, ETH_PK);
          
          if (result.status) {
            const updateResult = await updateTransaction({
              ...wfilTransaction,
              wrappedAt: +new Date(),
              status: 'success',
              txHash: result.transactionHash,
              messageCid: cid
            })
            console.log("exports.handler -> updateResult", updateResult);
          }
        }
      } 
    }    
  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
