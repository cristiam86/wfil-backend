const { returnSuccess, returnFailure } = require('./lib/response.js');
const { getMessagesList, getClient } = require('./lib/lotusApi.js');
const { getContract, send } = require('./lib/web3-lib.js');
const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager();
const secretsNamespace = process.env.SECRETS_NAMESPACE;

const VAULT_ADDRESS = process.env.VAULT_ADDRESS; 

/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id CheckTransaction --input-file ./src/CheckTransaction/event.json --watch
*/
exports.handler = async (event, context) => {
  const { origin, amount, destination } = event.queryStringParameters;
  console.log("exports.handler -> destination", destination)
  console.log("exports.handler -> amount", amount)
  console.log("exports.handler -> origin", origin)
  
  try {
    const messagesList = await getMessagesList(origin);
    // if (true) {
    if (messagesList && messagesList.length > 0) {
      const wrappingMessages = messagesList.filter(message => message.to === VAULT_ADDRESS && Number(message.value * 1000000000000000000) === Number(amount));
      console.log("exports.handler -> messagesToVault", wrappingMessages)
      if (wrappingMessages && wrappingMessages.length > 0) {
        const ethResponse = await secretsManager.getSecretValue({ SecretId: `${secretsNamespace}ETH_PK` }).promise();
        const ETH_PK = ethResponse.SecretString;
        // const INF_SK = infResponse.SecretString; 
        const wfilContract = getContract();
        const transaction = wfilContract.methods.mint(destination, amount);
        const result = await send(transaction, ETH_PK);
        console.log("FINAL -> result", result)

        return returnSuccess({ tx: result.transactionHash });
      }
      return returnFailure('NO_MESSAGE OR DIFFERENT_VALUE')
    }
    return returnFailure('NO_MESSAGE');
    
  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
