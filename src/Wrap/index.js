const AWS = require('aws-sdk');
const { saveTransaction } = require('./lib/database.js');
const { formatAddress, absoluteAmount } = require('./lib/helpers.js');
/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id Wrap --input-file ./src/Wrap/event.json --watch
*/
exports.handler = async (event, context) => {
  const { origin, amount, destination } = JSON.parse(event.body);
  const originAddress = formatAddress(origin);
  const absAmount = absoluteAmount(amount);

  const result = await saveTransaction({
    type: 'wrap',
    status: 'pending',
    origin: originAddress,
    amount: absAmount,
    destination: destination,
    timestamp: +new Date()
  });

  // await removeTransaction('01emkzecg7rnp2082cj45p6z68');


  return { success: result };
};
