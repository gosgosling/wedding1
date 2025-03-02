const fs = require('fs').promises;
const path = require('path');

async function updateJsonStructure() {
    const dataFile = path.join(__dirname, 'data', 'rsvp.json');

    try {
        // Читаем текущий файл
        let rsvpData = [];
        try {
            const data = await fs.readFile(dataFile, 'utf8');
            rsvpData = JSON.parse(data);
        } catch (error) {
            console.log('Файл пуст или не существует, создаем новый');
        }

        // Обновляем структуру каждой записи
        const updatedData = rsvpData.map(entry => ({
            id: entry.id,
            name: entry.name,
            guests: entry.guests,
            comments: entry.comments || '',
            ceremony_attendance: false, // добавляем новое поле
            banquet_attendance: false,  // добавляем новое поле
            timestamp: entry.timestamp
        }));

        // Сохраняем обновленные данные
        await fs.writeFile(
            dataFile,
            JSON.stringify(updatedData, null, 2)
        );

        console.log('Структура JSON файла успешно обновлена');
    } catch (error) {
        console.error('Ошибка при обновлении файла:', error);
    }
}

// Запускаем обновление
updateJsonStructure();