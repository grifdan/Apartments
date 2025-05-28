import React, { useState, useEffect } from "react";
import { Tabs, Select } from "antd";
import axios from "axios";
import Loader from "../components/Loader";
import Error from "../components/Error";
import Room from "../components/Room";

const { TabPane } = Tabs;
const { Option } = Select;

function Profilescreen() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [likedRooms, setLikedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.Name);
  const [phone, setPhone] = useState(user.phone || '');
  const [preferredUndergrounds, setPreferredUndergrounds] = useState(user.preferredUndergrounds || []);
  const [undergrounds, setUndergrounds] = useState([]);
  const [income, setIncome] = useState('');
  const [savings, setSavings] = useState('');
  const [budgetResult, setBudgetResult] = useState(null);

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    } else {
      fetchLikedRooms();
      fetchUndergrounds();
    }
  }, []);

  const fetchLikedRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5001/api/rooms/getroomsbyids", {
        ids: user.likedApartments,
      });
      setLikedRooms(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchUndergrounds = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/rooms/getallrooms");
      const uniqueUndergrounds = [...new Set(response.data.rooms.map((room) => room.underground))].filter(Boolean);
      setUndergrounds(uniqueUndergrounds);
    } catch (error) {
      console.error('с метро что-то не так:', error);
    }
  };

  const calculateBudget = async () => {
  const incomeNum = Number(income);
  const savingsNum = Number(savings);
  if (!income || incomeNum <= 0 || !savings || savingsNum < 0) {
    alert('Введи нормальные цифры, блин!');
    return;
  }
  try {
    setLoading(true);
    const response = await axios.get('http://localhost:5001/api/rooms/getallrooms', {
      params: {
        maxPrice: incomeNum * 36 + savingsNum,
        dealType: 'sale',
        limit: 3,
        underground: preferredUndergrounds.length > 0 ? preferredUndergrounds.join(',') : undefined,
      },
    });
    setBudgetResult({
      maxPrice: incomeNum * 36 + savingsNum,
      rooms: response.data.rooms || [],
    });
    setLoading(false);
  } catch (error) {
    setLoading(false);
    alert('Чё за херня, не могу посчитать: ' + error.message);
  }
};

  const handleUnlike = (roomId) => {
    setLikedRooms(likedRooms.filter((room) => room._id !== roomId));
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5001/api/users/update', {
        userId: user._id,
        Name: name,
        phone,
        preferredUndergrounds,
        income,
        savings,
      });
      localStorage.setItem('currentUser', JSON.stringify({ ...user, Name: name, phone, preferredUndergrounds }));
      setIsEditing(false);
      alert('Профиль обновлён, пиздец как круто!');
    } catch (error) {
      alert('Чё за херня, профиль не сохранился: ' + error.message);
    }
  };

  return (
    <div className="ml-3 mt-3">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Профиль" key="1">
          {isEditing ? (
            <div>
              <h1>Редактировать профиль</h1>
              <div className="mb-3">
                <label>Имя:</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Телефон:</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="mb-3">
  <label>Любимые станции метро:</label>
  <p className="text-muted">Выбери станции, чтобы видеть квартиры рядом с ними в калькуляторе и новых предложениях.</p>
  <Select
    mode="multiple"
    style={{ width: '100%' }}
    value={preferredUndergrounds}
    onChange={setPreferredUndergrounds}
    placeholder="Выбери станции метро"
  >
    {undergrounds.map((station) => (
      <Option key={station} value={station}>{station}</Option>
    ))}
  </Select>
</div>
              <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
              <button className="btn btn-secondary m-2" onClick={() => setIsEditing(false)}>Отмена</button>
            </div>
          ) : (
            <div>
              <h1>Мой профиль</h1>
              <br />
              <h1>Имя: {name}</h1>
              <h1>Email: {user.email}</h1>
              <h1>Телефон: {phone || 'Не указан'}</h1>
              <h1>Любимые станции метро: {preferredUndergrounds.join(', ') || 'Не выбраны'}</h1>
              {/* <h1>isAdmin: {user.isAdmin ? 'YES' : 'NO'}</h1> */}
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Редактировать</button>
              <div className="mt-4">
                <h2>Калькулятор бюджета</h2>
                {preferredUndergrounds.length > 0 && (
    <p>Ищем квартиры рядом с: {preferredUndergrounds.join(', ')}</p>
  )}
  {loading && <Loader />}
  {error && <Error message={error} />}
                {loading && <Loader />}
                {error && <Error message={error} />}
                <div className="mb-3">
                  <label>Месячный доход (руб.):</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="form-control"
                    value={income}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^[0-9]+$/.test(value)) {
                        setIncome(value);
                      }
                    }}
                    placeholder="Введите доход"
                  />
                </div>
                <div className="mb-3">
                  <label>Сбережения (руб.):</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="form-control"
                    value={savings}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^[0-9]+$/.test(value)) {
                        setSavings(value);
                      }
                    }}
                    placeholder="Введите сбережения"
                  />
                </div>
                <button className="btn btn-primary" onClick={calculateBudget}>Рассчитать</button>
                {budgetResult && (
                  <div className="mt-3">
                    <h3>Твой бюджет: {budgetResult.maxPrice.toLocaleString()} руб.</h3>
                    <h4>Подходящие квартиры:</h4>
                    {budgetResult.rooms.length > 0 ? (
                      budgetResult.rooms.map((room) => (
                        <Room
                          key={room._id}
                          room={room}
                          showBookNow={true}
                        />
                      ))
                    ) : (
                      <p>Ничего не найдено, зарабатывай больше, блин!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabPane>
        <TabPane tab="Понравившиеся" key="2">
          <h1>Понравившиеся апартаменты</h1>
          {loading && <Loader />}
          {error && <Error message={error} />}
          {likedRooms.length > 0 ? (
            likedRooms.map((room) => (
              <Room
                key={room._id}
                room={room}
                onUnlike={handleUnlike}
                showBookNow={true}
              />
            ))
          ) : (
            <p>Нет понравившихся квартир.</p>
          )}
        </TabPane>
        <TabPane tab="Бронирования" key="3">
          <MyBookings />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default Profilescreen;

export function MyBookings() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user._id) {
        setError("Пользователь не найден, залогинься");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:5001/api/bookings/getbookingsbyuserid",
          { userid: user._id },
          { timeout: 10000 }
        );
        setBookings(response.data || []);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Ошибка загрузки бронирований");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      await axios.delete("http://localhost:5001/api/bookings/cancelbooking", {
        data: { bookingId },
      });
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
      setLoading(false);
    } catch (error) {
      setError(error.message || "Ошибка отмены бронирования");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-6">
          {loading && <Loader />}
          {error && <Error message={error} />}
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div className="bs" key={booking._id}>
                <p>{booking.room}</p>
                <p><b>ID Бронирования</b>: {booking._id}</p>
                <p><b>Стоимость</b>: {booking.totalamount}</p>
                <p><b>Статус</b>: {booking.status === "booked" ? "CONFIRMED" : "CANCELLED"}</p>
                <div className="text-right">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    ЗАКРЫТЬ БРОНИРОВАНИЕ
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Бронирований пока что нет. Забронируй что-нибудь</p>
          )}
        </div>
      </div>
    </div>
  );
}