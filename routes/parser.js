const parser = require('transaction-sms-parser');


const parse = function (request) {
    let message = request.message;
    let transactionInfo = parser.getTransactionInfo(message);
    if (transactionInfo.account.number == null) {
        let split = message.split(" ");
        for (i = 0; i < split.length; i++) {
            if (split[i].length > 0 && (split[i].toLowerCase().includes("xx") || split[i].toLowerCase().includes("**"))) {
                let j = 4;
                transactionInfo.account.number = split[i]
                while(j-->0) {
                    transactionInfo.account.number = transactionInfo.account.number.toLowerCase()
                        .replace("x", "")
                        .replace("*", "");
                }
            }
        }
    }
    let message_lower = message.toLowerCase();
    if(message_lower.includes("cancel") || message_lower.includes("decline") || message_lower.includes("due")){
        transactionInfo["transactionAmount"] = 0
        transactionInfo["transactionType"] = "invalid"
    }
    transactionInfo["accountNumber"] = transactionInfo.account.number;
    transactionInfo["balance"] = transactionInfo.balance.available ? transactionInfo.balance.available : null;
    delete transactionInfo.account;
    return transactionInfo;
}

module.exports = parse