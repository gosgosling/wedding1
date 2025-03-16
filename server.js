require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;
const nodemailer = require('nodemailer'); // Добавляем nodemailer
const config  = require('./config');


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const emailConfig = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    to: process.env.EMAIL_TO
};

const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

/*const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru', 
    port: 465,
    secure: true,
    auth: {
        user: config.email.user, 
        pass: config.email.pass 
    }
});*/


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

        const emailText = `
            Новое подтверждение присутствия!

            Имя: ${name}
            Количество гостей: ${guests}
            
            Присутствие на церемонии: ${ceremony_attendance ? 'Да' : 'Нет'}
            Присутствие на банкете: ${banquet_attendance ? 'Да' : 'Нет'}
            
            Комментарии: ${comments || 'Нет комментариев'}
            
            Дата и время: ${new Date().toLocaleString('ru-RU')}
        `;

        // Настройки письма
        const mailOptions = {
            from: config.email.user, // Отправитель
            to: config.email.to, // Ваша личная почта для получения уведомлений
            subject: `Новое подтверждение присутствия от ${name}`,
            text: emailText
        };

        // Отправляем письмо
        await transporter.sendMail(mailOptions);


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

async function testEmail() {
    try {
        await transporter.sendMail({
            from: config.email.user,
            to: config.email.to,
            subject: 'Тестовое письмо',
            text: 'Это тестовое письмо для проверки настроек почты'
        });
        console.log('Тестовое письмо отправлено успешно');
    } catch (error) {
        console.error('Ошибка при отправке тестового письма:', error);
    }
}

// Запуск сервера
async function startServer() {
    await ensureDataDirectory();
    app.listen(port, () => {
        console.log(`Сервер запущен на порту ${port}`);
    });
}

startServer();
testEmail();