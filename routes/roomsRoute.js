const express = require("express");
const router = express.Router();
const Room = require("../models/room");

router.get("/getallrooms", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Извлекаем параметры фильтров
    const { location, minPrice, maxPrice, roomsCount, dealType, searchKey, underground } = req.query;

    // Формируем объект запроса для MongoDB
    const query = {};

    if (searchKey) {
      const trimmedSearchKey = searchKey.trim();
      if (trimmedSearchKey) {
        query.$or = [
          { street: { $regex: trimmedSearchKey, $options: "i" } },
          { residential_complex: { $regex: trimmedSearchKey, $options: "i" } },
          { author: { $regex: trimmedSearchKey, $options: "i" } },
        ];
      }
    }

    if (location && location !== "all") {
      query.location = location;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (roomsCount && roomsCount !== "all") {
      if (roomsCount === "4+") {
        query.rooms_count = { $gte: 4 };
      } else {
        query.rooms_count = parseInt(roomsCount);
      }
    }

    if (dealType && dealType !== "all") {
      query.deal_type = dealType;
    }

    if (underground) {
  const undergrounds = Array.isArray(underground) ? underground : underground.split(',').map(s => s.trim());
  if (undergrounds.length > 0 && undergrounds[0] !== "all") {
    const validUndergrounds = undergrounds.filter(u => u && typeof u === 'string' && u.length > 0);
    if (validUndergrounds.length > 0) {
      query.underground = { $in: validUndergrounds };
    }
  }
}

    // Логируем запрос для дебага
    console.log("Search query:", JSON.stringify(query, null, 2));

    // Выполняем запрос с фильтрами
    const rooms = await Room.find(query).skip(skip).limit(limit);
    const totalRooms = await Room.countDocuments(query);

    // Логируем результат
    console.log(`Found ${rooms.length} rooms, total: ${totalRooms}`);

    // Проверяем, если запрос от калькулятора (нет page или минимальный набор параметров)
    const isCalculatorRequest = !req.query.page && req.query.maxPrice && req.query.dealType && req.query.limit;

    if (isCalculatorRequest) {
      // Возвращаем только rooms для калькулятора
      res.send({ rooms });
    } else {
      // Обычный ответ с пагинацией
      res.send({
        rooms,
        totalPages: Math.ceil(totalRooms / limit),
        currentPage: page,
        totalRooms,
      });
    }
  } catch (error) {
    console.error("Ошибка в getallrooms:", error);
    return res.status(400).json({ message: error.message });
  }
});

router.get("/getroombyid/:roomid", async (req, res) => {
  const roomid = req.params.roomid;
  try {
    const room = await Room.findOne({ _id: roomid });
    res.send(room);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/getroomsbyids", async (req, res) => {
  const { ids } = req.body;
  try {
    const rooms = await Room.find({ _id: { $in: ids } });
    res.send(rooms);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
