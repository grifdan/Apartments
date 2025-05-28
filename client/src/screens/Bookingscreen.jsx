import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Error from "../components/Error";

function Bookingscreen() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);

  const roomid = params.roomid;

  useEffect(() => {
    const fetchRoomById = async () => {
      if (!roomid) {
        setError("Room id not provided");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5001/api/rooms/getroombyid/${roomid}`);
        setRoom(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRoomById();
  }, [roomid]);

  return (
    <div className="m-5">
      {loading ? (
        <Loader />
      ) : error ? (
        <Error message={error} />
      ) : room ? (
        <div>
          <div className="row justify-content-center mt-5 bs">
            <div className="col-md-5">
              <h1>{room.name}</h1>
              {room.imageurls && room.imageurls[0] && (
                <img
                  src={room.imageurls[0]}
                  alt={room.name}
                  className="bigimg"
                />
              )}
            </div>
            <div className="col-md-6">
              <div style={{ textAlign: "right" }}>
                <h1>Details</h1>
                <hr />
                <b>
                  <p>Имя: {JSON.parse(localStorage.getItem("currentUser")).Name}</p>
                  <p>Максимум гостей: {room.maxcount}</p>
                  <p>Rent per day: {room.rentperday}</p>
                  <p>Стоимость: {room.price}</p>
                </b>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Error message="Room not found." />
      )}
    </div>
  );
}

export default Bookingscreen;