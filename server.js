const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

// --- ВАШИ СЕКРЕТНЫЕ ДАННЫЕ ---
// ВАЖНО: Вставьте сюда свои реальные токен и ID чата
const TELEGRAM_BOT_TOKEN = 'ВАШ_ТЕЛЕГРАМ_ТОКЕН_БОТА';
const TELEGRAM_CHAT_ID = 'ВАШ_ID_ТЕЛЕГРАМ_ЧАТА';
// -----------------------------

const app = express();
const port = 3000;

// Проверяем, что токен и ID чата введены
if (TELEGRAM_BOT_TOKEN === 'ВАШ_ТЕЛЕГРАМ_ТОКЕН_БОТА' || TELEGRAM_CHAT_ID === 'ВАШ_ID_ТЕЛЕГРАМ_ЧАТА') {
    console.error("\x1b[41m%s\x1b[0m", "ОШИБКА: Пожалуйста, введите ваш токен бота и ID чата в файле server.js");
    process.exit(1); // Завершаем работу, если данные не введены
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// Middlewares
app.use(cors()); // Разрешает запросы с других доменов (с вашего frontend)
app.use(express.json()); // Позволяет парсить JSON в теле запроса

// Роут для обработки запроса на вывод
app.post('/withdraw', (req, res) => {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Неверная сумма' });
    }

    console.log(`Получен запрос на вывод: ${amount} грн`);

    const message = `
    🚨 *Новый запрос на вывод!* 🚨
    -----------------------------
    💰 *Сумма:* ${amount} грн
    -----------------------------
    🕒 *Время:* ${new Date().toLocaleString('uk-UA')}
    `;

    // Отправляем сообщение в Telegram
    bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' })
        .then(() => {
            console.log('Уведомление в Telegram успешно отправлено.');
            // Отправляем клиенту подтверждение
            res.status(200).json({ success: true, message: 'Запрос принят' });
        })
        .catch(error => {
            console.error('Ошибка отправки сообщения в Telegram:', error.code, error.response.body);
            // Отправляем клиенту информацию об ошибке
            res.status(500).json({ success: false, message: 'Ошибка сервера' });
        });
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен и слушает порт http://localhost:${port}`);
    console.log("\x1b[32m%s\x1b[0m", "Сервер готов принимать запросы от клиентской части.");
});
