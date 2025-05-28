const mongoose = require('../db');
const Room = require('../models/room');
const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function updateCoordinates() {
  try {
    // Ждём подключения к MongoDB
    await mongoose.connection.asPromise();
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB не подключён. Проверь db.js или сервер MongoDB.');
    }

    console.log('Начинаем обновление координат...');

    const rooms = await Room.find({ underground: { $exists: true, $ne: null } });
    console.log(`Найдено ${rooms.length} комнат для обновления.`);

    for (const room of rooms) {
      try {
        const queries = [
          `метро ${encodeURIComponent(room.underground)}, Москва`,
          `${encodeURIComponent(room.underground)}, Москва`,
          `${encodeURIComponent(room.underground)}, Московская область`,
        ];
        let response;

        for (const query of queries) {
          response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
          if (response.data[0]) break;
        }

        if (response.data[0]) {
          room.coordinates = {
            lat: parseFloat(response.data[0].lat),
            lon: parseFloat(response.data[0].lon),
          };
          await room.save();
          console.log(`Обновлены координаты для ${room.underground}:`, room.coordinates);
        } else {
          console.warn(`Координаты не найдены для ${room.underground}`);
        }
      } catch (error) {
        console.error(`Ошибка при обработке ${room.underground}:`, error.message);
      }
      await sleep(1000); // Задержка 1 сек для Nominatim
    }
    console.log('Обновление координат завершено.');
  } catch (error) {
    console.error('Критическая ошибка в updateCoordinates:', error.message);
  } finally {
    // Закрываем соединение без коллбэка
    await mongoose.connection.close();
    console.log('MongoDB соединение закрыто.');
  }
}

// Запускаем функцию
updateCoordinates().catch(err => {
  console.error('Ошибка запуска:', err.message);
  process.exit(1);
});