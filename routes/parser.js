const parser = require('transaction-sms-parser');

function hasNumber(myString) {
    return /\d/.test(myString);
}
const parse = function (request) {
    let message = request.message;
    let transactionInfo = parser.getTransactionInfo(message);
    if (transactionInfo.account.number == null) {
        let split = message.split(" ");
        for (i = 0; i < split.length; i++) {
            let case1 = split[i].length > 0;
            let case2 = split[i].toLowerCase().includes("x");
            let case3 = split[i].toLowerCase().includes("*");
            let case4 = hasNumber(split[i]);
            if ((case1 && case4 ) && (case2 || case3) ) {
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
    if(message_lower.includes("cancel") || message_lower.includes("decline") || message_lower.includes("due") || message_lower.includes("renew")){
        transactionInfo["transactionAmount"] = 0
        transactionInfo["transactionType"] = "invalid"
    }
    transactionInfo["accountNumber"] = transactionInfo.account.number;
    transactionInfo["balance"] = transactionInfo.balance.available ? transactionInfo.balance.available : null;
    delete transactionInfo.account;
    return transactionInfo;
}

module.exports = parse