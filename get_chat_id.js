const TelegramBot = require('node-telegram-bot-api');
const token = '7706676562:AAHJz35R-p7NVuVwep7OmAYYz1oBu8Gdwmw';
const bot = new TelegramBot(token, { polling: true });

// Обработчик для любых сообщений
bot.on('message', (msg) => {
    console.log('Информация о чате:');
    console.log('Chat ID:', msg.chat.id);
    console.log('От пользователя:', msg.from.username);
    console.log('Тип чата:', msg.chat.type);
});

console.log('Бот запущен. Отправьте сообщение боту...');