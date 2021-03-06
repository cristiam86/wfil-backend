const AWS = require('aws-sdk');
const { Client, ThreadID, Where } =  require('@textile/hub');
const secretsManager = new AWS.SecretsManager();

const THREAD_ID = process.env.THREAD_ID;
const TEXTILE_PUB_KEY = process.env.TEXTILE_PUB_KEY;
const SECRETS_NAMESPACE = process.env.SECRETS_NAMESPACE;

async function getDataBase() {
  const textilePrivKey = await secretsManager.getSecretValue({ SecretId: `${SECRETS_NAMESPACE}TEXTILE_PRIVATE_KEY` }).promise();
  const keyInfo = {
    key: TEXTILE_PUB_KEY,
    secret: textilePrivKey.SecretString
  }
  const client = await Client.withKeyInfo(keyInfo)
  const threadID = ThreadID.fromString(THREAD_ID)
  return { client, threadID };
}

exports.getTransaction = async (cid) => {
  try {
    const { client, threadID } = await getDataBase();
    const query = new Where('messageCid').eq(cid);
    const tx = await client.find(threadID, 'transactions', query)
    return tx && tx.length ? tx[0] : null;

  } catch (error) {
    console.log("getTransaction -> error", error)
    console.log("exports.getTransaction -> cid", cid)
  }
  return null;
}

exports.getTransactionById = async (id) => {
  try {
    const { client, threadID } = await getDataBase();
    const result = await client.findByID(threadID, 'transactions', id)
    return result;

  } catch (error) {
    console.log("getTransaction -> error", error)
    console.log("exports.getTransaction -> cid", cid)
  }
  return null;
}

exports.saveTransaction = async (transactionData) => {
  try {
    const { client, threadID } = await getDataBase();
    const ids = await client.create(threadID, 'transactions', [transactionData]);
    console.log("exports.saveTransaction -> ids", ids)
    if (ids && ids.length) return { success: true, data: ids };

  } catch (error) {
    console.log("saveTransaction -> error", error)
    console.log("exports.updateTransaction -> transactionData", transactionData)
  }
  return false;
}

exports.updateTransaction = async (transactionData) => {
  try {
    const { client, threadID } = await getDataBase();
    await client.save(threadID, 'transactions', [transactionData]);
    return true;

  } catch (error) {
    console.log("updateTransaction -> error", error)
    console.log("exports.updateTransaction -> transactionData", transactionData)
  }
  return false;
}


const listTransactions = async (query = {}) => {
  try {
    const { client, threadID } = await getDataBase();
    const transactions = await client.find(threadID, 'transactions', query)
    return transactions && transactions.length ? transactions : [];

  } catch (error) {
    console.log("listTransactions -> error", error)
    console.log("listTransactions -> query", query)
  }
  return [];
}
exports.listTransactions = listTransactions;


exports.listPendingTransactions = async () => {
  const query = new Where('status').eq('pending');
  return listTransactions(query);
}

exports.removeTransaction = async (id) => {
  try {
    const { client, threadID } = await getDataBase();
    const result = await client.delete(threadID, 'transactions', [id])
    return result;

  } catch (error) {
    console.log("removeTransaction -> error", error)
    console.log("removeTransaction -> id", id)
  }
  return [];
}