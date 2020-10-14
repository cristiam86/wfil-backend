exports.formatAddress = (address) => `f${address.slice(1)}`;

exports.absoluteAmount = (amount) => Number(amount * 1000000000000000000);