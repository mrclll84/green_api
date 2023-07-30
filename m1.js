const express = require('express');
const amqp = require('amqplib');

const app = express();
const QUEUE_NAME = 'tasks';

// Функция для установки соединения с RabbitMQ и отправки задания
async function sendTaskToQueue(task) {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: false });
        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(task)));
        console.log('Задание отправлено в очередь RabbitMQ:', task);
    } catch (error) {
        console.error('Ошибка при отправке задания в очередь RabbitMQ:', error);
    }
}

app.get('/process', (req, res) => {
    // Обработка HTTP запроса
    const requestPayload = req.query;

    // Создаем задание для микросервиса М2
    const task = { payload: requestPayload, timestamp: Date.now() };

    // Отправляем задание в RabbitMQ
    sendTaskToQueue(task);

    res.json({ message: 'Запрос получен и поставлен в очередь для обработки.' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Микросервис М1 запущен и слушает порт ${PORT}`);
});
