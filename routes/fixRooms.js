const mongoose = require('../db');
const Room = require('../models/room');

async function fixRooms() {
  try {
    // Ждём подключения
    await mongoose.connection.asPromise();
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB не подключён. Проверь db.js или сервер MongoDB.');
    }

    console.log('Начинаем исправление документов в коллекции rooms...');

    // Обновляем все документы, задавая дефолтные значения
    const result = await Room.updateMany(
      {}, // Обновляем все документы
      [
        {
          $set: {
            // name: { $ifNull: ['$name', 'Не указано'] },
            maxcount: { $ifNull: ['$maxcount', 0] },
            phonenumber: { $ifNull: ['$phonenumber', 0] },
            rentperday: { $ifNull: ['$rentperday', 0] },
            description: { $ifNull: ['$description', 'Нет описания'] },
            type: { $ifNull: ['$type', 'unknown'] },
            imageurls: { $ifNull: ['$imageurls', []] },
            coordinates: {
              $cond: {
                if: { $and: [{ $ne: ['$latitude', null] }, { $ne: ['$longitude', null] }] },
                then: { lat: '$latitude', lon: '$longitude' },
                else: '$coordinates',
              },
            },
            house_number: { $toString: { $ifNull: ['$house_number', ''] } }, // Преобразуем в строку
          },
        },
        {
          $unset: ['latitude', 'longitude'], // Удаляем старые поля
        },
      ],
      { runValidators: true }
    );

    console.log(`Обновлено ${result.modifiedCount} документов.`);

    console.log('Исправление документов завершено.');
  } catch (error) {
    console.error('Ошибка при исправлении документов:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB соединение закрыто.');
  }
}

fixRooms().catch(err => {
  console.error('Ошибка запуска:', err.message);
  process.exit(1);
});