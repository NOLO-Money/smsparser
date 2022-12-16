const parser = require('transaction-sms-parser');


const parse = function (request) {
    let message = request.message;
    let transactionInfo = parser.getTransactionInfo(message);
    if (transactionInfo.account.number == null) {
        let split = message.split(" ");
        for (i = 0; i < split.length; i++) {
            if (split[i].length > 0 && split[i].toLowerCase().includes("xx")) {
                transactionInfo.account.number = split[i];
            }
        }
    }
    transactionInfo["accountNumber"] = transactionInfo.account.number;
    transactionInfo["balance"] = transactionInfo.balance.available ? transactionInfo.balance.available : null;
    delete transactionInfo.account;
    return transactionInfo;
}

module.exports = parse