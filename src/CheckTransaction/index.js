const { returnSuccess, returnFailure } = require('./lib/response.js');
const { getMessagesList, getClient } = require('./lib/lotusRPC.js');
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
  const { origin, amount, destination } = event.arguments;
  console.log("exports.handler -> destination", destination)
  console.log("exports.handler -> amount", amount)
  console.log("exports.handler -> origin", origin)
  
  try {
    const messagesList = await getMessagesList({ from: origin, to: VAULT_ADDRESS })
    // if (true) {
    if (messagesList && messagesList[0]) {
      const client = getClient();
      const message = await client.chainGetMessage(messagesList[0]);
      console.log("init -> message", JSON.stringify(message, null, 4))
      // if (true) {
      if (message && message.Value === amount) {
        const ethResponse = await secretsManager.getSecretValue({ SecretId: `${secretsNamespace}ETH_PK` }).promise();
        const ETH_PK = ethResponse.SecretString;
        // const INF_SK = infResponse.SecretString; 
        const wfilContract = getContract();
        const transaction = wfilContract.methods.mint(destination, amount);
        const result = await send(transaction, ETH_PK);
        console.log("exports.handler -> result", result)

        return returnSuccess({ tx: result.transactionHash });
      }
      return returnFailure('DIFFERENT_VALUE')
    }
    return returnFailure('NO_MESSAGE');
    
  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
