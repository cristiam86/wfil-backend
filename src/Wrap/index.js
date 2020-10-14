const AWS = require('aws-sdk');
const { saveTransaction, /*listTransactions, removeTransaction*/ } = require('./lib/database.js');
const { formatAddress, absoluteAmount } = require('./lib/helpers.js');
/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id Wrap --input-file ./src/Wrap/event.json --watch
*/
exports.handler = async (event, context) => {
  const { origin, amount, destination } = JSON.parse(event.body);
  const originAddress = formatAddress(origin);
  const absAmount = absoluteAmount(amount);

  const { success, data } = await saveTransaction({
    type: 'wrap',
    status: 'pending',
    origin: originAddress,
    amount: absAmount,
    destination: destination,
    timestamp: +new Date()
  });
  const transactionId = data && data.length ? data[0] : '';

  // await removeTransaction('01emm0b5ra4faj30kvrx1n1mjh');
  // await removeTransaction('01emm0ag8zstdxfvya5b9q21ng');
  // await removeTransaction('01emm09gp6yh2f1ef2yg4jhknz');
  // const tx = await listTransactions();
  // console.log("exports.handler -> tx", tx)

  return { success: success, data: transactionId };
};
