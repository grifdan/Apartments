const mongoose = require("mongoose");

// Устанавливаем MongoDB connection string
var mongoURL = 'mongodb://127.0.0.1:27017/mern-rooms'; // Имя вашей базы данных

// Подключаемся к MongoDB
mongoose.connect(mongoURL);

var connection = mongoose.connection;

connection.on('error', () => {
    console.log('MongoDB Connection failed');
});

connection.on('connected', () => {
    console.log('MongoDB Connection Successful');
});

// Экспортируем объект mongoose для использования в других частях приложения
module.exports = mongoose;
