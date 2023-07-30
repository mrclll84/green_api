const amqp = require('amqplib');

const QUEUE_NAME = 'tasks';
const RESULT_QUEUE_NAME = 'results';

// Функция для обработки задания и возврата результата
function processTask(task) {
    // В данном примере обработкой задания будет просто эмуляция задержки в 2 секунды
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ result: 'Задание успешно обработано', task });
        }, 2000);
    });
}

// Функция для установки соединения с RabbitMQ и обработки заданий
async function startProcessingTasks() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: false });
        await channel.assertQueue(RESULT_QUEUE_NAME, { durable: false });

        channel.consume(QUEUE_NAME, async (msg) => {
            const task = JSON.parse(msg.content.toString());

            // Обработка задания
            const result = await processTask(task);

            // Отправка результата в очередь
            channel.sendToQueue(RESULT_QUEUE_NAME, Buffer.from(JSON.stringify(result)));

            console.log('Задание успешно обработано и результат отправлен в очередь:', result);
            channel.ack(msg);
        });
    } catch (error) {
        console.error('Ошибка при обработке задания из очереди RabbitMQ:', error);
    }
}

// Запуск микросервиса М2 для обработки заданий
startProcessingTasks();
