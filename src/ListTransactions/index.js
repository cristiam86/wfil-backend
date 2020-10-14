const AWS = require('aws-sdk');
const { listTransactions } = require('./lib/database.js');

/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id ListTransactions --watch
*/
exports.handler = async () => {
  const transactions = await listTransactions();
  const transactionsSorted = transactions.sort((txA, txB) => txB.timestamp - txA.timestamp);
  return { success: true, data: transactionsSorted };
};
