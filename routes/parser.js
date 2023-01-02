const parser = require('transaction-sms-parser');

function hasNumber(myString) {
    return /\d/.test(myString);
}

function cleanAccountNumber(transactionInfo) {
    if (transactionInfo && transactionInfo.account && transactionInfo.account.number) {
        let j = 4;
        while (j-- > 0) {
            transactionInfo.account.number = transactionInfo.account.number.toLowerCase()
                .replace("x", "")
                .replace("*", "");
        }
    }
}

function extractAccountNumber(split, transactionInfo) {
    for (i = 0; i < split.length; i++) {
        if (split[i].toLowerCase().startsWith("x") || split[i].toLowerCase().startsWith("*")) {
            transactionInfo["account"] = {}
            transactionInfo.account.number = split[i];
            cleanAccountNumber(transactionInfo);
            break;
        }
    }
}

function populateAccountNumber(split, transactionInfo) {
    for (i = 0; i < split.length; i++) {
        if (transactionInfo.account == null || transactionInfo.account.number == null) {
            transactionInfo.account = {}
            let case1 = split[i].length > 0;
            let case2 = split[i].toLowerCase().includes("x");
            let case3 = split[i].toLowerCase().includes("*");
            let case4 = hasNumber(split[i]);
            if ((case1 && case4) && (case2 || case3)) {
                transactionInfo.account.number = split[i]
            }
        } else {
            break;
        }
    }
}

const parse = function (request) {
    let message = request.message;
    let transactionInfo = parser.getTransactionInfo(message);
    if (transactionInfo.account.number == null) {
        let split = message.split(" ");

        //Tries to extract account number from the message.
        extractAccountNumber(split, transactionInfo);
        // Populates the account number if extract failed.
        populateAccountNumber(split, transactionInfo);
    }
    let message_lower = message.toLowerCase();
    if (message_lower.includes("cancel")
        || message_lower.includes("decline")
        || message_lower.includes("due")
        || message_lower.includes("renew")
        || message_lower.includes("request")
        || message_lower.includes("requested")
        || message_lower.includes("card")
        || message_lower.includes("creditcard")
        || message_lower.includes("mandate")
        || message_lower.includes("autopay")
        || message_lower.includes("fastag")) {
        transactionInfo["transactionAmount"] = 0
        transactionInfo["transactionType"] = "invalid"
    } else if (transactionInfo.account.number && transactionInfo.balance && transactionInfo.transactionType == null) {
        transactionInfo["transactionType"] = "balance";
    }

    transactionInfo["accountNumber"] = transactionInfo.account.number;
    if (transactionInfo.accountNumber) {
        transactionInfo.accountNumber = transactionInfo.accountNumber.replace(/\D/g, '');
    }
    transactionInfo["balance"] = transactionInfo.balance.available ? transactionInfo.balance.available : null;
    delete transactionInfo.account;
    return transactionInfo;
}

module.exports = parse