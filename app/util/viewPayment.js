const { v4: uuidv4 } = require('uuid');

async function initiatePayment(phone, amount) {
  const transactionId = uuidv4();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    transactionId,
    phone,
    amount,
    status: 'success',
    message: 'Mock payment processed successfully',
  };
}

module.exports = {
  initiatePayment,
};