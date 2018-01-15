const TelegramBot = require('node-telegram-bot-api');
const df = require('dateformat');
// replace the value below with the Telegram token you receive from @BotFather
// const token = '517410530:AAEvpf2rDtfCfqUEwKrLDhOVHFBc30rZ9DE';

// Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(token, { webHook: { port : port, host : host } });

const port = process.env.PORT || 443;
const host = '0.0.0.0';  // probably this change is not required
const externalUrl = process.env.CUSTOM_ENV_VARIABLE || 'https://telegram-orange-bot.herokuapp.com';
const token = '517410530:AAEvpf2rDtfCfqUEwKrLDhOVHFBc30rZ9DE';
const bot = new TelegramBot(token, {webHook: {port: port, host: host}});

bot.setWebHook(externalUrl + ':443/bot' + token).then(() => {
    console.log(`Webhook set ${externalUrl}`)
}).catch(err => {
    console.log('Fail setting webhook', err);
});
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../client_secret.json');

// Create a document object using the ID of the spreadsheet - obtained from its URL.
const doc = new GoogleSpreadsheet('15KZYwCEbYPzQmb1xkuFKgRuqRY6s3mBeFRtF2HDoAdw');

const positions = [
    "Аноним",
    "Руководитель ОД",
    "Заметститель руководителя ОД",
    "Контролёр заявок",
    "Менеджер по работе с клиентами",
    "Логист",
    "Помощник логиста",
    "Старший кассир",
    "Кассир",
    "Старший кладовщик",
    "Кладовщик",
    "Водитель",
    "Бригадир грузчиков",
    "Страший грузчик",
    "Распиловщик",
    "Оператор 1С",
    "Грузчик"];

const otdels = [
    "ЛМ СПб Испытателей",
    "ЛМ МСК Вегас",
    "ЛМ МСК Новая Рига",
    "ЛМ Климовск",
    "ЛМ Тула",
    "ЛМ Рязань",
    "ЛМ Кастрома",
    "ЛМ Ярославль",
    "ЛМ Ульяновск",
    "ЛМ Волжский",
    "ЛМ Пенза",
    "ЛМ Киров",
    "ЛМ Барнаул2",
    "ЛМ Тюмень",
    "Casto Воронеж",
    "Casto Пермь",
    "Твой дом Кротекс",
    "Твой дом Крокус",
    "IKEA-Онлайн"
];

const otdel = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {
        "keyboard": [
            ["ЛМ СПб Испытателей"],
            ["ЛМ МСК Вегас"],
            ["ЛМ МСК Новая Рига"],
            ["ЛМ Климовск"],
            ["ЛМ Тула"],
            ["ЛМ Рязань"],
            ["ЛМ Кастрома"],
            ["ЛМ Ярославль"],
            ["ЛМ Ульяновск"],
            ["ЛМ Волжский"],
            ["ЛМ Пенза"],
            ["ЛМ Киров"],
            ["ЛМ Барнаул2"],
            ["ЛМ Тюмень"],
            ["Casto Воронеж"],
            ["Casto Пермь"],
            ["Твой дом Кротекс"],
            ["Твой дом Крокус"],
            ["IKEA-Онлайн"]
        ]
    }
};
const position = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {
        "keyboard": [
            ["Руководитель ОД"],
            ["Аноним"],
            ["Заметститель руководителя ОД"],
            ["Контролёр заявок"],
            ["Менеджер по работе с клиентами"],
            ["Логист"],
            ["Помощник логиста"],
            ["Старший кассир"],
            ["Кассир"],
            ["Старший кладовщик"],
            ["Кладовщик"],
            ["Водитель"],
            ["Бригадир грузчиков"],
            ["Страший грузчик"],
            ["Распиловщик"],
            ["Оператор 1С"],
            ["Грузчик"]
        ]
    }
};

const typesOfClaim = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {
        "keyboard": [["Хищение"],
            ["Жалоба"], ["Конфликт"], ["Вопросы по З/П"], ["Потребность в обучении"],
            ["Предложение улучшений"], ["Вопросы по графику работы"], ["Карьерный рост"]]
    }
};
const email = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {
        "keyboard": [["-"]]
    }
};

const anonim = {
    "parse_mode": "Markdown",
    "one_time_keyboard": true,
    "reply_markup": {
        "keyboard": [["Анонимно"],["Не анонимно"]]
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
    step: 0,
    isAnonymous: false
};

const cashBot = new Map();

bot.onText(/\/hello/, (msg) => {
    let chatID = msg.chat.id;
    if (cashBot.get(msg.from.id) !== undefined) {
        cashBot.get(msg.from.id).step = 0;
    }
    cashBot.set(msg.from.id, record);
    // cashBot.get(msg.from.id).step++;
    bot.sendMessage(
        chatID,
        `Привет, ${msg.chat.first_name + ' ' + msg.chat.last_name}. Выберете тип обращения.`,
        anonim);
});

bot.on('message', (msg) => {
    let chatID = msg.chat.id;
    let fromID = msg.from.id;
    if (msg.text === "/Привет") {
        return;
    }

    if (msg.text === 'Привет' || msg.text === 'привет') {
        if (cashBot.get(fromID) !== undefined) {
            cashBot.get(fromID).step = 0;
        }
        cashBot.set(msg.from.id, record);
        bot.sendMessage(
            chatID,
            `Привет, ${msg.chat.first_name + ' ' + msg.chat.last_name}. Выберете тип обращения.`,
            anonim);
        return;
    }

    if (cashBot.get(fromID) === undefined && (msg.text !== 'Привет' || msg.text !== 'привет')) {
        bot.sendMessage(chatID, `Привет, ${msg.chat.first_name + ' ' + msg.chat.last_name}, чтобы начать просто отправьте \/hello`);
        return;
    }

    if (cashBot.get(fromID) !== undefined) {

        if (msg.text === 'Анонимно' && cashBot.get(fromID).step <= 3) {
            cashBot.get(fromID).isAnonymous = true;
            cashBot.get(fromID).step++;
            bot.sendMessage(
                chatID,
                `Выберете тематику обращения.`,
                typesOfClaim);
            return;
        }

        if (msg.text === 'Не анонимно' && cashBot.get(fromID).step <= 3) {
            cashBot.get(fromID).isAnonymous = false;
            cashBot.get(fromID).step++;
            bot.sendMessage(
                chatID,
                `Выберете тематику обращения.`,
                typesOfClaim);
            return;
        }

        if (msg.text === 'Хищение' || msg.text === 'Жалоба' || msg.text === 'Улучшение' || msg.text === 'Конфликт'
            || msg.text === 'Предложение улучшений' || msg.text === 'Вопросы по графику работы' || msg.text === 'Карьерный рост'
            || msg.text === 'Потребность в обучении' || msg.text === 'Вопросы по З/П' && cashBot.get(fromID).step <= 3) {
            cashBot.get(fromID).type = msg.text;
            cashBot.get(fromID).step++;
            bot.sendMessage(chatID, 'Укажите отдел');
            return;
        }

        // if (otdels.indexOf(msg.text) > -1 && cashBot.get(fromID).step <= 3) {
        if (cashBot.get(fromID).step === 2) {
            cashBot.get(fromID).otdel = msg.text;
            cashBot.get(fromID).step++;
            bot.sendMessage(chatID, 'Выберете должность', position);
            return;
        }

        if (positions.indexOf(msg.text) > -1 && cashBot.get(fromID).step <= 3) {
            cashBot.get(fromID).position = msg.text;
            cashBot.get(fromID).step++;
            bot.sendMessage(chatID, 'Укажите описание к обращению');
            return;
        }

        if (cashBot.get(fromID).step === 4) {
            cashBot.get(fromID).overview = msg.text;
            cashBot.get(fromID).step++;
            if (cashBot.get(fromID).isAnonymous) {
                bot.sendMessage(chatID, 'Укажите Ваш email или можете не отправлять', email);
            } else {
                bot.sendMessage(chatID, 'Укажите Ваш email');
            }
        } else if (cashBot.get(fromID).step === 5) {
            cashBot.get(fromID).email = msg.text;
            cashBot.get(fromID).step++;
            if (cashBot.get(fromID).isAnonymous) {
                bot.sendMessage(chatID, 'Укажите Ваше ФИО или можете не отправлять');
            } else {
                bot.sendMessage(chatID, 'Укажите Ваше ФИО');
            }
        } else {
            cashBot.get(fromID).fio = msg.text;
            sendDataToGoogle(cashBot.get(fromID), chatID);
            cashBot.get(fromID).step = 0;
            cashBot.delete(fromID);
        }
    }

});

sendDataToGoogle = (record, chatID) => {
    record.timestamp = df(new Date(), 'dd.mm.yyyy HH:MM:ss');
    doc.useServiceAccountAuth(creds, function (err) {
        doc.getRows(1, function (err, rows) {
            if (rows) {
                record.ID = Number.parseInt(rows[rows.length - 1].id) + 1;
                doc.addRow(1, record, (err, row) => {
                    if (row) {
                        bot.sendMessage(chatID, `Спасибо, Ваше обращение №${df(new Date, 'ddmmyyyy')}-${record.ID} принято`);
                    }
                })
            }
        });
    });
};


module.exports = TelegramBot;