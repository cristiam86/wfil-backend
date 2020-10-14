const AWS = require('aws-sdk');
const { listTransactions } = require('./lib/database.js');

/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id ListTransactions --watch
*/
exports.handler = async () => {
  const transactions = await listTransactions();

  return { success: true, data: transactions };
};
