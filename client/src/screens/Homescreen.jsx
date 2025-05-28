import React, { useState, useEffect } from "react";
import axios from "axios";
import Room from "../components/Room";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { Button, Input, Select, Slider, Modal, Checkbox } from "antd";
import "antd/dist/reset.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "../styles/leaflet.css";

const { Option } = Select;

const moscowUndergrounds = [
  "Авиамоторная",
  "Автозаводская",
  "Академическая",
  "Александровский сад",
  "Алексеевская",
  "Алма-Атинская",
  "Алтуфьево",
  "Аминьевская",
  "Аннино",
  "Арбатская",
  "Аэропорт",
  "Бабушкинская",
  "Багратионовская",
  "Баковка",
  "Балтийская",
  "Баррикадная",
  "Бауманская",
  "Беговая",
  "Белокаменная",
  "Беломорская",
  "Белорусская",
  "Беляево",
  "Бибирево",
  "Библиотека имени Ленина",
  "Битцевский парк",
  "Борисово",
  "Боровицкая",
  "Боровское шоссе",
  "Ботанический сад",
  "Братиславская",
  "Бульвар адмирала Ушакова",
  "Бульвар Дмитрия Донского",
  "Бульвар Рокоссовского",
  "Бунинская аллея",
  "Бутырская",
  "Варшавская",
  "ВДНХ",
  "Верхние Котлы",
  "Верхние Лихоборы",
  "Владыкино",
  "Водный стадион",
  "Войковская",
  "Волгоградский проспект",
  "Волжская",
  "Волоколамская",
  "Воробьёвы горы",
  "Выставочная",
  "Выхино",
  "Говорово",
  "Горчаково",
  "Грачёвская",
  "Давыдково",
  "Деловой центр",
  "Динамо",
  "Дмитровская",
  "Добрынинская",
  "Домодедовская",
  "Достоевская",
  "Дубровка",
  "Жулебино",
  "ЗИЛ",
  "Зорге",
  "Зюзино",
  "Зябликово",
  "Измайловская",
  "Калужская",
  "Кантемировская",
  "Каховская",
  "Каширская",
  "Киевская",
  "Китай-город",
  "Кожуховская",
  "Коломенская",
  "Коммунарка",
  "Комсомольская",
  "Коньково",
  "Коптево",
  "Котельники",
  "Красногвардейская",
  "Краснопресненская",
  "Красносельская",
  "Красные ворота",
  "Крестьянская застава",
  "Кропоткинская",
  "Крылатское",
  "Крымская",
  "Кузнецкий мост",
  "Кузьминки",
  "Кунцевская",
  "Курская",
  "Кутузовская",
  "Ленинский проспект",
  "Лермонтовский проспект",
  "Лесопарковая",
  "Лефортово",
  "Лианозово",
  "Лихоборы",
  "Локомотив",
  "Ломоносовский проспект",
  "Лубянка",
  "Лужники",
  "Люблино",
  "Марксистская",
  "Марьина роща",
  "Марьино",
  "Маяковская",
  "Медведково",
  "Международная",
  "Менделеевская",
  "Минская",
  "Митино",
  "Мичуринский проспект",
  "Мневники",
  "Молодёжная",
  "Москва-Сити",
  "Москворечье",
  "Моссельмаш",
  "Мякинино",
  "Нагатинская",
  "Нагорная",
  "Народное Ополчение",
  "Нахимовский проспект",
  "Некрасовка",
  "Нижегородская",
  "Новогиреево",
  "Новокосино",
  "Новокузнецкая",
  "Новопеределкино",
  "Новослободская",
  "Новохохловская",
  "Новоясеневская",
  "Новые Черёмушки",
  "Озёрная",
  "Окружная",
  "Октябрьская",
  "Октябрьское поле",
  "Ольховая",
  "Орехово",
  "Отрадное",
  "Очаково",
  "Павелецкая",
  "Панфиловская",
  "Парк культуры",
  "Парк Победы",
  "Партизанская",
  "Первомайская",
  "Перово",
  "Петровский парк",
  "Петровско-Разумовская",
  "Печатники",
  "Пионерская",
  "Планерная",
  "Площадь Гагарина",
  "Площадь Ильича",
  "Площадь Революции",
  "Полежаевская",
  "Полянка",
  "Пражская",
  "Преображенская площадь",
  "Прокшино",
  "Пролетарская",
  "Проспект Вернадского",
  "Проспект Мира",
  "Профсоюзная",
  "Пушкинская",
  "Пятницкое шоссе",
  "Раменки",
  "Рассказовка",
  "Речной вокзал",
  "Рижская",
  "Римская",
  "Ростокино",
  "Рубцовская",
  "Румянцево",
  "Рязанский проспект",
  "Савёловская",
  "Саларьево",
  "Свиблово",
  "Севастопольская",
  "Селигерская",
  "Семёновская",
  "Серпуховская",
  "Славянский бульвар",
  "Смоленская",
  "Сокол",
  "Сокольники",
  "Солнцево",
  "Спартак",
  "Спортивная",
  "Сретенский бульвар",
  "Стахановская",
  "Стрешнево",
  "Строгино",
  "Студенческая",
  "Сухаревская",
  "Сходненская",
  "Таганская",
  "Тверская",
  "Театральная",
  "Текстильщики",
  "Терехово",
  "Технопарк",
  "Тимирязевская",
  "Третьяковская",
  "Тропарёво",
  "Трубная",
  "Тульская",
  "Тургеневская",
  "Тушинская",
  "Угрешская",
  "Улица 1905 года",
  "Улица Академика Янгеля",
  "Улица Горчакова",
  "Улица Дмитриевского",
  "Улица Милашенкова",
  "Улица Сергея Эйзенштейна",
  "Улица Скобелевская",
  "Улица Старокачаловская",
  "Университет",
  "Филатов Луг",
  "Фили",
  "Филёвский парк",
  "Фонвизинская",
  "Фрунзенская",
  "Ховрино",
  "Хорошёвская",
  "Царицыно",
  "Цветной бульвар",
  "ЦСКА",
  "Чертановская",
  "Чеховская",
  "Чистые пруды",
  "Чкаловская",
  "Шаболовская",
  "Шелепиха",
  "Шипиловская",
  "Шоссе Энтузиастов",
  "Щёлковская",
  "Щукинская",
  "Электрозаводская",
  "Юго-Восточная",
  "Юго-Западная",
  "Южная",
  "Ясенево",
  "Яхромская",
];

function Homescreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);
  const [sessionId] = useState(`${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const [locations, setLocations] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [location, setLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [roomsCount, setRoomsCount] = useState("all");
  const [dealType, setDealType] = useState("all");
  const [undergrounds, setUndergrounds] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6173]);
  const [poiData, setPoiData] = useState({ schools: [], hospitals: [], cafes: [], parks: [] });
  const [heatmapLayers, setHeatmapLayers] = useState({
    noise: false,
    ecology: false,
  });

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
    const userId = currentUser._id || "anonymous";
    const filters = {
      searchKey,
      location,
      priceRange,
      roomsCount,
      dealType,
      undergrounds,
    };

    axios
      .post("http://localhost:5001/api/track/filter", {
        userId,
        sessionId,
        filters,
      })
      .catch((error) => {
        console.error("Трекинг фильтров обосрался:", error.message);
      });
  }, [searchKey, location, priceRange, roomsCount, dealType, undergrounds, sessionId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const trimmedSearchKey = searchKey.trim();
        const queryParams = new URLSearchParams({
          page: currentPage,
          limit: 100,
          ...(trimmedSearchKey && { searchKey: trimmedSearchKey }),
          ...(location !== "all" && { location }),
          ...(priceRange[0] !== 0 && { minPrice: priceRange[0] }),
          ...(priceRange[1] !== 100000000 && { maxPrice: priceRange[1] }),
          ...(roomsCount !== "all" && { roomsCount }),
          ...(dealType !== "all" && { dealType }),
        });

        undergrounds.forEach((station) => queryParams.append("underground", station));

        const response = await axios.get(
          `http://localhost:5001/api/rooms/getallrooms?${queryParams.toString()}`,
          { timeout: 10000 }
        );
        setRooms(response.data.rooms || []);
        setTotalPages(response.data.totalPages || 1);

        if (currentPage === 1 && !locations.length) {
          const uniqueLocations = [
            ...new Set(response.data.rooms.map((room) => room.location)),
          ].filter(Boolean);
          setLocations(uniqueLocations);
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        console.error("Ошибка загрузки комнат:", error);
      }
    };

    if (searchKey.trim().length >= 3 || searchKey.trim() === "") {
      fetchData();
    }
  }, [currentPage, searchKey, location, priceRange, roomsCount, dealType, undergrounds, locations]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        setRecError("Залогинись, чтобы видеть рекомендации, черт возьми!");
        setRecLoading(false);
        return;
      }
      const userId = currentUser._id;

      try {
        setRecLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log("Запрос рекомендаций прерван по таймауту");
        }, 10000);
        const response = await fetch(`http://localhost:5000/recommend/${userId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (response.ok) {
          setRecommendations(data.recommendations || []);
        } else {
          setRecError(data.error || "Ошибка при загрузке рекомендаций");
        }
      } catch (error) {
        setRecError(
          error.name === "AbortError"
            ? "Сервер не отвечает, попробуй позже"
            : error.message || "Ошибка сети"
        );
      } finally {
        setRecLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const fetchMapData = async (undergroundStation, roomCoordinates) => {
    try {
      console.log("Пытаюсь загрузить данные карты для станции:", undergroundStation);
      let newCenter = null;

      // Проверяем, есть ли координаты в room.coordinates
      if (roomCoordinates && roomCoordinates.lat && roomCoordinates.lon) {
        newCenter = [roomCoordinates.lat, roomCoordinates.lon];
      } else {
        // Fallback на Nominatim, если coordinates отсутствуют
        const queries = [
          `метро ${encodeURIComponent(undergroundStation)}, Москва`,
          `${encodeURIComponent(undergroundStation)}, Москва`,
          `${encodeURIComponent(undergroundStation)}, Московская область`,
        ];
        for (const query of queries) {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
          );
          if (response.data[0]) {
            newCenter = [response.data[0].lat, response.data[0].lon];
            break;
          }
        }
      }

      if (newCenter) {
        setMapCenter(newCenter);

        // Запрос к Overpass API для POI
        const overpassQuery = `
          [out:json];
          (
            node["amenity"="school"](around:3000,${newCenter[0]},${newCenter[1]});
            node["amenity"="hospital"](around:3000,${newCenter[0]},${newCenter[1]});
            node["amenity"="cafe"](around:3000,${newCenter[0]},${newCenter[1]});
            node["leisure"="park"](around:3000,${newCenter[0]},${newCenter[1]});
          );
          out body;
        `;
        const overpassResponse = await axios.post(
          "https://overpass-api.de/api/interpreter",
          overpassQuery,
          { timeout: 10000 }
        );
        const nodes = overpassResponse.data.elements || [];
        setPoiData({
          schools: nodes
            .filter((n) => n.tags.amenity === "school")
            .map((n) => ({
              lat: n.lat,
              lon: n.lon,
              name: n.tags.name || "Школа",
            })),
          hospitals: nodes
            .filter((n) => n.tags.amenity === "hospital")
            .map((n) => ({
              lat: n.lat,
              lon: n.lon,
              name: n.tags.name || "Больница",
            })),
          cafes: nodes
            .filter((n) => n.tags.amenity === "cafe")
            .map((n) => ({
              lat: n.lat,
              lon: n.lon,
              name: n.tags.name || "Кафе",
            })),
          parks: nodes
            .filter((n) => n.tags.leisure === "park")
            .map((n) => ({
              lat: n.lat,
              lon: n.lon,
              name: n.tags.name || "Парк",
            })),
        });
      } else {
        console.error("Координаты не найдены для станции:", undergroundStation);
        setMapCenter([55.7558, 37.6173]); // Центр Москвы по умолчанию
        setPoiData({ schools: [], hospitals: [], cafes: [], parks: [] });
      }
    } catch (error) {
      console.error("Ошибка загрузки данных карты:", error.message);
      setMapCenter([55.7558, 37.6173]);
      setPoiData({ schools: [], hospitals: [], cafes: [], parks: [] });
    }
  };

  const handleShowMap = (room) => {
    setSelectedRoom(room);
    setShowMap(true);
    if (room.underground && room.coordinates) {
      fetchMapData(room.underground, room.coordinates);
    } else if (room.underground) {
      fetchMapData(room.underground, null);
    } else {
      console.error("У комнаты нет станции метро или координат");
      setMapCenter([55.7558, 37.6173]);
      setPoiData({ schools: [], hospitals: [], cafes: [], parks: [] });
    }
  };

  const MapContent = () => {
    const map = useMap();

    useEffect(() => {
      map.setView(mapCenter, 13);
    }, [map, mapCenter]);

    useEffect(() => {
      if (!map || !map.getSize().x) return; // Проверяем, что карта загружена

      // Очищаем существующие слои тепловых карт
      map.eachLayer((layer) => {
        if (layer instanceof L.HeatLayer) {
          map.removeLayer(layer);
        }
      });

      const noisePoints = heatmapLayers.noise
        ? [
            [mapCenter[0], mapCenter[1], 0.8],
            [mapCenter[0] + 0.01, mapCenter[1] + 0.01, 0.6],
            [mapCenter[0] - 0.01, mapCenter[1] - 0.01, 0.7],
          ]
        : [];
      const ecologyPoints = heatmapLayers.ecology
        ? [
            [mapCenter[0], mapCenter[1], 0.5],
            [mapCenter[0] + 0.02, mapCenter[1] + 0.02, 0.4],
            [mapCenter[0] - 0.02, mapCenter[1] - 0.02, 0.3],
          ]
        : [];

      if (noisePoints.length > 0) {
        L.heatLayer(noisePoints, { radius: 25, gradient: { 0.4: "red", 0.65: "yellow", 1: "green" } }).addTo(map);
      }
      if (ecologyPoints.length > 0) {
        L.heatLayer(ecologyPoints, { radius: 25, gradient: { 0.4: "blue", 0.65: "lime", 1: "green" } }).addTo(map);
      }
    }, [map, heatmapLayers, mapCenter]);

    return (
      <>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {selectedRoom && selectedRoom.coordinates && selectedRoom.coordinates.lat && selectedRoom.coordinates.lon && (
          <Marker position={[selectedRoom.coordinates.lat, selectedRoom.coordinates.lon]}>
            <Popup>{selectedRoom.name}</Popup>
          </Marker>
        )}
        {poiData.schools.map((school, i) => (
          <Marker key={`school-${i}`} position={[school.lat, school.lon]}>
            <Popup>{school.name}</Popup>
          </Marker>
        ))}
        {poiData.hospitals.map((hospital, i) => (
          <Marker key={`hospital-${i}`} position={[hospital.lat, hospital.lon]}>
            <Popup>{hospital.name}</Popup>
          </Marker>
        ))}
        {poiData.cafes.map((cafe, i) => (
          <Marker key={`cafe-${i}`} position={[cafe.lat, cafe.lon]}>
            <Popup>{cafe.name}</Popup>
          </Marker>
        ))}
        {poiData.parks.map((park, i) => (
          <Marker key={`park-${i}`} position={[park.lat, park.lon]}>
            <Popup>{park.name}</Popup>
          </Marker>
        ))}
      </>
    );
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const resetFilters = () => {
    setSearchKey("");
    setLocation("all");
    setPriceRange([0, 100000000]);
    setRoomsCount("all");
    setDealType("all");
    setUndergrounds([]);
    setCurrentPage(1);
  };

  return (
    <div className="container">
      <div className="row mt-4">
        <div className="col-md-3 mb-3">
          <Input
            placeholder="Поиск по улице, ЖК или застройщику"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            allowClear
          />
        </div>
        <div className="col-md-3 mb-3">
          <Select
            style={{ width: "100%" }}
            value={location}
            onChange={(value) => setLocation(value)}
            placeholder="Выбери район"
          >
            <Option value="all">Все районы</Option>
            {locations.map((loc) => (
              <Option key={loc} value={loc}>{loc}</Option>
            ))}
          </Select>
        </div>
        <div className="col-md-3 mb-3">
          <Select
            style={{ width: "100%" }}
            value={roomsCount}
            onChange={(value) => setRoomsCount(value)}
            placeholder="Кол-во комнат"
          >
            <Option value="all">Все</Option>
            <Option value="1">1 комната</Option>
            <Option value="2">2 комнаты</Option>
            <Option value="3">3 комнаты</Option>
            <Option value="4+">4+ комнаты</Option>
          </Select>
        </div>
        <div className="col-md-3 mb-3">
          <Select
            style={{ width: "100%" }}
            value={dealType}
            onChange={(value) => setDealType(value)}
            placeholder="Тип сделки"
          >
            <Option value="all">Все</Option>
            <Option value="sale">Продажа</Option>
            <Option value="rent">Аренда</Option>
          </Select>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12 mb-3">
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            value={undergrounds}
            onChange={(values) => setUndergrounds(values)}
            placeholder="Выбери станции метро"
            allowClear
            maxTagCount="responsive"
          >
            <Option value="all">Все станции</Option>
            {moscowUndergrounds.map((station) => (
              <Option key={station} value={station}>{station}</Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          <h6>Ценовой диапазон (руб.)</h6>
          <Slider
            range
            min={0}
            max={100000000}
            step={100000}
            value={priceRange}
            onChange={(value) => setPriceRange(value || [0, 100000000])}
            tooltip={{
              formatter: (value) => (value != null ? `${value.toLocaleString()} руб.` : "0 руб."),
            }}
          />
          <div className="d-flex justify-content-between">
            <span>{(priceRange[0] != null ? priceRange[0] : 0).toLocaleString()} руб.</span>
            <span>{(priceRange[1] != null ? priceRange[1] : 100000000).toLocaleString()} руб.</span>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          <Button onClick={resetFilters}>Сбросить фильтры</Button>
        </div>
      </div>

      <div className="row justify-content-center mt-5 recommendations-section">
        <h2>
          <i className="fas fa-star" style={{ color: "gold" }}></i> Рекомендации для тебя
        </h2>
        {recLoading ? (
          <Loader />
        ) : recError ? (
          <Error message={recError} />
        ) : recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div className="col-md-9 mt-3 recommendation-item" key={rec.item_id}>
              <Room room={rec} isRecommendation={true} />
            </div>
          ))
        ) : (
          <Error message="Нет рекомендаций, лайкни что-нибудь!" />
        )}
      </div>

      <div className="row justify-content-center mt-5">
        {loading ? (
          <Loader />
        ) : error ? (
          <Error message={error} />
        ) : rooms.length > 0 ? (
          rooms.map((room) => (
            <div className="col-md-9 mt-3" key={room._id}>
              <Room room={room} onShowMap={() => handleShowMap(room)} />
            </div>
          ))
        ) : (
          <Error
            message={
              searchKey
                ? `Ничего не найдено по запросу "${searchKey}", попробуй другое название!`
                : "Квартиры не найдены, попробуй другие фильтры!"
            }
          />
        )}
      </div>

      <div className="row justify-content-center mt-5">
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>
          Предыдущая
        </Button>
        <span className="mx-3">Страница {currentPage} из {totalPages}</span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Следующая
        </Button>
      </div>

      <Modal
        title="Окружение квартиры"
        open={showMap}
        onCancel={() => {
          setShowMap(false);
          setPoiData({ schools: [], hospitals: [], cafes: [], parks: [] });
          setHeatmapLayers({ noise: false, ecology: false });
        }}
        footer={null}
        width={800}
      >
        <div className="heatmap-toggle">
          <Checkbox
            checked={heatmapLayers.noise}
            onChange={(e) => setHeatmapLayers({ ...heatmapLayers, noise: e.target.checked })}
          >
            Уровень шума
          </Checkbox>
          <Checkbox
            checked={heatmapLayers.ecology}
            onChange={(e) => setHeatmapLayers({ ...heatmapLayers, ecology: e.target.checked })}
          >
            Экология
          </Checkbox>
        </div>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "500px", width: "100%" }}>
          <MapContent />
        </MapContainer>
      </Modal>
    </div>
  );
}

export default Homescreen;
