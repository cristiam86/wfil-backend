const { getTransactionById } = require('./lib/database.js');
/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id GetTransaction --input-file ./src/GetTransaction/event.json --watch
*/
exports.handler = async (event, context) => {
  const { id } = event.pathParameters;
  const transaction = await getTransactionById(id);
  return { success: true, data: transaction };
};
