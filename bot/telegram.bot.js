const TelegramBot = require('node-telegram-bot-api');
const df = require('dateformat');
// replace the value below with the Telegram token you receive from @BotFather
const token = '517410530:AAEvpf2rDtfCfqUEwKrLDhOVHFBc30rZ9DE';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../client_secret.json');

// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet('15KZYwCEbYPzQmb1xkuFKgRuqRY6s3mBeFRtF2HDoAdw');

const otdel = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {"keyboard": [["Не указан"], ["Какой-то первый"], ["Какой-то второй"]]}
};
const position = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {
        "keyboard": [
            ["Руководитель отдела доставки"],
            ["Логист"],
            ["Помощник логиста"],
            ["Старший кассир"],
            ["Кассир"],
            ["Водитель"],
            ["Бригадир грузчиков"],
            ["Грузчик"]
        ]
    }
};

const typesOfClaim = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {
        "keyboard": [["Хищение"],
            ["Улучшение"], ["Конфликт"], ["По З/П"], ["Потребность в обучении"]]
    }
};
const email = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {
        "keyboard": [["-"]]
    }
};

var record = {
    ID: '',
    type: '',
    position: '',
    overview: '',
    fio: '',
    email: '',
    otdel: '',
    timestamp: '',
    step:0
};

bot.setWebHook(process.env.NOW_URL+`/bot${token}` || process.env.HEROKU_URL+`/bot${token}`).then(() => {
    console.log('Web hook successfully set');
}).catch(err => {
    console.log('Web hook error ', err);
});

const cashBot = new Map();

bot.onText(/\/start/, (msg) => {
    let chatID = msg.chat.id;
    cashBot.set(msg.from.id,record);
    cashBot.get(msg.from.id).step++;
    bot.sendMessage(
        chatID,
        `Привет, ${msg.chat.first_name + ' ' + msg.chat.last_name}. Выберете тип обращения.`,
        typesOfClaim);
});

bot.on('message', (msg) => {
    let chatID = msg.chat.id;
    let fromID = msg.from.id;
    if (msg.text === "/start") {
        return;
    }

    if (msg.text === 'Привет' || msg.text === 'привет') {
        cashBot.set(msg.from.id,record);
        cashBot.get(fromID).step++;
        bot.sendMessage(
            chatID,
            `Привет, ${msg.chat.first_name + ' ' + msg.chat.last_name}. Выберете тип обращения.`,
            typesOfClaim);
        return;
    }

    if (cashBot.get(fromID) === undefined && (msg.text !== 'Привет' || msg.text !== 'привет')) {
        bot.sendMessage(chatID,`Привет, ${msg.chat.first_name + ' ' + msg.chat.last_name}, чтобы начать просто отправьте \/start`);
    }

    if (cashBot.get(fromID) !== undefined) {
        if (msg.text === 'Хищение' || msg.text === 'Улучшение' || msg.text === 'Конфликт'
            || msg.text === 'Потребность в обучении' || msg.text === 'По З/П' && cashBot.get(fromID).step <= 3) {
            cashBot.get(fromID).type = msg.text;
            cashBot.get(fromID).step++;
            bot.sendMessage(chatID, 'Выберете отдел', otdel);
            return;
        }

        if (msg.text === 'Какой-то первый' || msg.text === 'Какой-то второй' || msg.text === 'Не указан' && cashBot.get(fromID).step <= 3) {
            cashBot.get(fromID).otdel = msg.text;
            cashBot.get(fromID).step++;
            bot.sendMessage(chatID, 'Выберете должность', position);
            return;
        }

        if (msg.text === 'Руководитель отдела доставки' || msg.text === 'Логист'
            || msg.text === 'Помощник логиста' || msg.text === 'Старший кассир'
            || msg.text === 'Кассир' || msg.text === 'Водитель' || msg.text === 'Бригадир грузчиков' || msg.text === 'Грузчик' && cashBot.get(fromID).step <= 3) {
            cashBot.get(fromID).position = msg.text;
            cashBot.get(fromID).step++;
            bot.sendMessage(chatID, 'Укажите описание к обращению');
            return;
        }

        if (cashBot.get(fromID).step === 4) {
            cashBot.get(fromID).overview = msg.text;
            cashBot.get(fromID).step++;
            bot.sendMessage(chatID, 'Укажите Ваш email или если не хотите его указывать, просто отправьте \"-\"',email);
        } else if (cashBot.get(fromID).step === 5) {
            cashBot.get(fromID).email = msg.text;
            cashBot.get(fromID).step++;
            bot.sendMessage(chatID, 'Укажите Ваше ФИО');
        } else {
            cashBot.get(fromID).fio = msg.text;
            sendDataToGoogle(cashBot.get(fromID),chatID);
            cashBot.delete(fromID);
        }
    }

});

sendDataToGoogle = (record,chatID) => {
   record.timestamp = df(new Date(), 'dd.mm.yyyy HH:MM:ss');
    doc.useServiceAccountAuth(creds, function (err) {
        doc.getRows(1, function (err, rows) {
            if (rows) {
                record.ID = Number.parseInt(rows[rows.length - 1].id) + 1;
                doc.addRow(1, record, (err, row) => {
                    if (row) {
                        bot.sendMessage(chatID,`Спасибо, Ваше обращение №${df(new Date, 'ddmmyyyy')}-${record.ID} принято`);
                    }
                })
            }
        });
    });
};


module.exports = TelegramBot;