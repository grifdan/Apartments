const express = require("express");
const app = express();

// Разрешаем ВСЕ запросы откуда угодно (опасно для прода, но для разработки сойдёт)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Пускаем всех 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Разрешаем методы
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Разрешаем заголовки
  next();
});

// Твои роуты идут тут...
app.get('/api/apartments', (req, res) => {
  res.json([{ id: 1, title: 'неоч квартира в гетто' }]);
});

app.get('/recommend/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Логика рекомендаций (например, на основе likedApartments)
    const user = await User.findById(userId);
    const recommendedRooms = await Room.find({ _id: { $in: user.likedApartments } });
    res.json({ recommendations: recommendedRooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



const dbConfig = require('./db'); // Импорт настроек БД.
const roomsRoute = require('./routes/roomsRoute');
const usersRoute = require('./routes/usersRoute');
const bookingsRoute = require('./routes/bookingsRoute')

const Event = require('./models/event');

app.post("/api/track/filter", (req, res) => {
  try {
    const { userId, sessionId, filters } = req.body || {};
    if (!userId || !sessionId || !filters) {
      console.error("Неполные данные трекинга:", req.body);
      return res.status(400).json({ message: "Missing required fields" });
    }
    console.log("Трекинг фильтров:", { userId, sessionId, filters });
    res.status(200).json({ message: "Filter tracked" });
  } catch (error) {
    console.error("Ошибка трекинга:", error.message);
    res.status(500).json({ message: error.message });
  }
});

app.use(express.json()); // Middleware для парсинга JSON.

app.use('/api/rooms', roomsRoute); // Подключение маршрутов комнат.
app.use('/api/users', usersRoute);
app.use('/api/bookings', bookingsRoute);

const port = process.env.PORT || 5001; // Определяем порт.

app.listen(port, () => { 
    console.log(`Node Server Started on port ${port} using nodemon`);
});


