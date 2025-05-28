import React, { useState, useEffect } from "react";
import { Modal, Button, Carousel } from "react-bootstrap";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const calculateMonthlyPayment = (loanAmount, annualRate, termYears) => {
  if (loanAmount <= 0 || termYears <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const termMonths = termYears * 12;
  const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  return numerator / denominator;
};

const generateChartData = (price, downPaymentPercent, annualRate) => {
  const terms = [5, 10, 15, 20, 25, 30];
  const downPayments = [10, 20, 30];
  const datasets = downPayments.map((dp) => {
    const loanAmount = price * (1 - dp / 100);
    const payments = terms.map((term) =>
      calculateMonthlyPayment(loanAmount, annualRate, term).toFixed(2)
    );
    return {
      label: `Первый взнос ${dp}%`,
      data: payments,
      borderColor: dp === 10 ? "#FF6384" : dp === 20 ? "#36A2EB" : "#FFCE56",
      fill: false,
    };
  });

  return {
    labels: terms.map((t) => `${t} лет`),
    datasets,
  };
};

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

function Room({ room, onUnlike, showBookNow = false, isRecommendation = false, onShowMap }) {
  const [show, setShow] = useState(false);
  const [showMortgage, setShowMortgage] = useState(false);
  const [isLiked, setIsLiked] = useState(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return (
      currentUser &&
      Array.isArray(currentUser.likedApartments) &&
      currentUser.likedApartments.includes(room._id || room.item_id)
    );
  });
  const [termYears, setTermYears] = useState(15);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const annualRate = 10;
  const [viewStartTime, setViewStartTime] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleMortgageClose = () => setShowMortgage(false);
  const handleMortgageShow = () => setShowMortgage(true);

  useEffect(() => {
    setViewStartTime(Date.now());
    return () => {
      if (viewStartTime) {
        const viewDuration = (Date.now() - viewStartTime) / 1000;
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const userId = currentUser ? currentUser._id : "anonymous";
        const sessionId = generateSessionId();

        axios
          .post("http://localhost:5000/track/view", {
            userId,
            sessionId,
            roomId: room._id || room.item_id,
            viewDuration,
          })
          .catch((error) => {
            console.error("Ошибка трекинга просмотра:", error);
          });
      }
    };
  }, [room._id, room.item_id]);

  async function toggleLike() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Зарегестрируйся, чтобы оценивать квартиры!");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5001/api/users/like", {
        userId: currentUser._id,
        roomId: room._id || room.item_id,
      });
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      const updatedUser = { ...currentUser, likedApartments: response.data };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      if (wasLiked && onUnlike) {
        onUnlike(room._id || room.item_id);
      }
    } catch (error) {
      console.log("Ошибка:", error);
      alert("Лайк не сработал!");
    }
  }

  async function handleBook() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Похер, ты не залогинен, бронировать не выйдет, блин!");
      return;
    }

    if (!roomData._id || !roomData.name || !roomData.price) {
      alert("Чё за херня, данные о комнате кривые, блин!");
      return;
    }

    try {
      const bookingDetails = {
        room: {
          name: roomData.name,
          _id: roomData._id,
        },
        userid: currentUser._id,
        totalamount: Number(roomData.price),
      };

      const response = await axios.post(
        "http://localhost:5001/api/bookings/bookroom",
        bookingDetails,
        { timeout: 10000 }
      );
      alert(response.data);
    } catch (error) {
      console.error("Чё за херня:", error);
      alert(`Бронирование не сработало: ${error.response?.data?.error || error.message}`);
    }
  }

  const roomData = {
    _id: room.item_id || room._id,
    name:
      room.name ||
      `${room.street || ""} ${room.house_number || ""}, ${room.location || "Unnamed"}`.trim() ||
      "Unnamed Apartment",
    imageurls: room.imageurls || ["https://placehold.co/600x400"],
    rentPerDay:
      room.rentperday ||
      (room.deal_type === "sale" ? Math.round(room.price / 30) : room.price_per_month) ||
      0,
    maxCount: room.maxcount || (room.rooms_count > 0 ? room.rooms_count * 2 : 2),
    author: room.author || "NaN",
    author_type: room.author_type || "NaN",
    deal_type: room.deal_type || "NaN",
    accommodation_type: room.accommodation_type || "NaN",
    floor: room.floor || "NaN",
    floors_count: room.floors_count || "NaN",
    rooms_count: room.rooms_count || "NaN",
    total_meters: room.total_meters || "NaN",
    price: room.price || "NaN",
    underground: room.underground || "NaN",
    url: room.url || "NaN",
    description:
      room.description ||
      `Квартира в ${room.location || "NaN"}, ${room.accommodation_type || "NaN"}, ${
        room.floor || "NaN"
      } этаж из ${room.floors_count || "NaN"}, ${room.total_meters || "NaN"} м², метро ${
        room.underground || "NaN"
      }`,
    coordinates: room.coordinates || { lat: 55.7558, lon: 37.6173 },
  };

  const loanAmount = roomData.price * (1 - downPaymentPercent / 100);
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, termYears).toFixed(2);
  const chartData = generateChartData(roomData.price, downPaymentPercent, annualRate);

  return (
    <div className={`row bs ${isRecommendation ? "recommendation-card" : ""}`}>
      <div className="col-md-4">
        <img src={roomData.imageurls[0]} className="smallimg" alt={roomData.name} />
      </div>
      <div className="col-md-7">
        <h1>{roomData.name}</h1>
        <b>
          <p>Автор: {roomData.author}</p>
          <p>Тип автора: {roomData.author_type}</p>
          <p>Тип сделки: {roomData.deal_type}</p>
          <p>Тип жилья: {roomData.accommodation_type}</p>
          <p>Этаж: {roomData.floor} из {roomData.floors_count}</p>
          <p>Комнаты: {roomData.rooms_count}</p>
          <p>Площадь: {roomData.total_meters} м²</p>
          <p>Цена (общая): {roomData.price} руб.</p>
          <p>Максимум гостей: {roomData.maxCount}</p>
          <p>Метро: {roomData.underground}</p>
          {/* <p>
            Ссылка: <a href={roomData.url} target="_blank" rel="noopener noreferrer">{roomData.url}</a>
          </p> */}
          <p>Описание: {roomData.description}</p>
        </b>

        <div style={{ float: "right" }}>
          {showBookNow && (
            <button className="btn btn-primary m-2" onClick={handleBook}>
              Забронировать
            </button>
          )}
          <button className="btn btn-primary m-2" onClick={handleShow}>
            Посмотреть Детали
          </button>
          <button className="btn btn-primary m-2" onClick={toggleLike}>
            {isLiked ? "Не нравится" : "Нравится"}
          </button>
          <button className="btn btn-primary m-2" onClick={handleMortgageShow}>
            Рассчитать ипотеку
          </button>
          <button className="btn btn-primary m-2" onClick={onShowMap}>
            Показать на карте
          </button>
        </div>
      </div>

      {isRecommendation && <span className="recommendation-badge">Рекомендуем!</span>}

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{roomData.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Carousel prevLabel="" nextLabel="">
            {roomData.imageurls.map((url) => (
              <Carousel.Item key={url}>
                <img className="d-block w-100 bigimg" src={url} alt={roomData.name} />
              </Carousel.Item>
            ))}
          </Carousel>
          <p>
            <b>Автор:</b> {roomData.author}
          </p>
          <p>
            <b>Тип автора:</b> {roomData.author_type}
          </p>
          <p>
            <b>Тип сделки:</b> {roomData.deal_type}
          </p>
          <p>
            <b>Тип жилья:</b> {roomData.accommodation_type}
          </p>
          <p>
            <b>Этаж:</b> {roomData.floor} из {roomData.floors_count}
          </p>
          <p>
            <b>Комнаты:</b> {roomData.rooms_count}
          </p>
          <p>
            <b>Площадь:</b> {roomData.total_meters} м²
          </p>
          <p>
            <b>Цена (общая):</b> {roomData.price} руб.
          </p>
          <p>
            <b>Максимум гостей:</b> {roomData.maxCount}
          </p>
          <p>
            <b>Метро:</b> {roomData.underground}
          </p>
          {/* <p>
            <b>Ссылка:</b>{" "}
            <a href={roomData.url} target="_blank" rel="noopener noreferrer">
              {roomData.url}
            </a>
          </p> */}
          <p>
            <b>Описание:</b> {roomData.description}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showMortgage} onHide={handleMortgageClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ипотечный калькулятор для {roomData.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h5>Параметры ипотеки</h5>
            <div className="mb-3">
              <label>Срок кредита (годы):</label>
              <select
                className="form-control"
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 25, 30].map((year) => (
                  <option key={year} value={year}>
                    {year} лет
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label>Первый взнос (%):</label>
              <input
                type="number"
                className="form-control"
                min="0"
                max="90"
                value={downPaymentPercent}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 90) setDownPaymentPercent(value);
                }}
              />
            </div>
            <div className="mb-3">
              <label>Процентная ставка (% в год):</label>
              <input
                type="number"
                className="form-control"
                value={annualRate}
                disabled
              />
            </div>
            <h5>Результат</h5>
            <p>
              <b>Стоимость квартиры:</b> {roomData.price.toLocaleString()} руб.
            </p>
            <p>
              <b>Сумма кредита:</b> {loanAmount.toLocaleString()} руб.
            </p>
            <p>
              <b>Ежемесячный платёж:</b> {monthlyPayment.toLocaleString()} руб.
            </p>
          </div>
          <div>
            <h5>График зависимости платежа от срока</h5>
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Ежемесячный платёж по ипотеке" },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    title: { display: true, text: "Платёж (руб.)" },
                  },
                  x: {
                    title: { display: true, text: "Срок кредита" },
                  },
                },
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleMortgageClose}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Room;
