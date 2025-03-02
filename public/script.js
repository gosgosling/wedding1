function updateCountdown() {
    const weddingDate = new Date('2025-06-13T16:00:00').getTime();
    const now = new Date().getTime();
    const timeLeft = weddingDate - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(3, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Обработка отправки формы
document.getElementById('rsvpForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    // Данные формы
    const formData = {
        name: form.querySelector('input[type="text"]').value,
        guests: form.querySelector('input[type="number"]').value,
        comments: form.querySelector('textarea').value,
        ceremony_attendance: form.querySelector('#ceremony_attendance').checked,
        banquet_attendance: form.querySelector('#banquet_attendance').checked
    };

    console.log('Sending data:', formData);

    try {
        // Отключаем кнопку и меняем текст
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';

        // Отправляем данные
        const response = await fetch('http://localhost:3000/api/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log('Server response:', result);

        if (result.success) {
            // Показываем сообщение об успехе
            showMessage('success', result.message);
            form.reset();
        } else {
            // Показываем сообщение об ошибке
            showMessage('error', result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('error', 'Произошла ошибка при отправке формы');
    } finally {
        // Возвращаем кнопку в исходное состояние
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});

// Функция для показа сообщений
function showMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;

    const form = document.getElementById('rsvpForm');
    form.parentNode.insertBefore(messageDiv, form);

    // Удаляем сообщение через 5 секунд
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}