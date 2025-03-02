const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Путь к файлу с данными
const dataFile = path.join(__dirname, 'data', 'rsvp.json');

// Создаем директорию data, если её нет
async function ensureDataDirectory() {
    const dir = path.join(__dirname, 'data');
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir);
        await fs.writeFile(dataFile, '[]');
    }
}

// Обработка POST запроса для формы RSVP
app.post('/api/rsvp', async(req, res) => {
    try {
        console.log('Received data:', req.body);
        const { name, guests, comments, ceremony_attendance, banquet_attendance } = req.body;

        console.log('Ceremony attendance:', ceremony_attendance);
        console.log('Banquet attendance:', banquet_attendance);

        // Валидация
        if (!name || !guests) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать имя и количество гостей'
            });
        }

        if (!ceremony_attendance && !banquet_attendance) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, выберите хотя бы одно мероприятие для посещения'
            });
        }

        // Получаем существующие данные
        let rsvpData = [];
        try {
            const data = await fs.readFile(dataFile, 'utf8');
            rsvpData = JSON.parse(data);
        } catch (error) {
            await fs.writeFile(dataFile, '[]');
        }

        // Добавляем новую запись
        const newRsvp = {
            id: Date.now(),
            name,
            guests: parseInt(guests),
            comments: comments || '',
            ceremony_attendance: Boolean(ceremony_attendance),
            banquet_attendance: Boolean(banquet_attendance),
            timestamp: new Date().toISOString()
        };

        console.log('Saving RSVP:', newRsvp);

        rsvpData.push(newRsvp);

        // Сохраняем обновленные данные
        await fs.writeFile(dataFile, JSON.stringify(rsvpData, null, 2));

        res.json({
            success: true,
            message: 'Спасибо! Ваше подтверждение получено'
        });

    } catch (error) {
        console.error('Ошибка при сохранении RSVP:', error);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при сохранении данных'
        });
    }
});

// Запуск сервера
async function startServer() {
    await ensureDataDirectory();
    app.listen(port, () => {
        console.log(`Сервер запущен на порту ${port}`);
    });
}

startServer();