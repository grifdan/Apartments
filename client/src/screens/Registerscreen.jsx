import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import Error from "../components/Error";
import Success from "../components/Success";

function Registerscreen() {
  const [Name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [cpassword, setcpassword] = useState("");

  const [loading, setloading] = useState(false);
  const [error, setError] = useState();
  const [success, setsuccess] = useState();

  async function register() {
    if (password === cpassword) {
      const user = {
        Name, // Make sure this matches the case used in the server-side model
        email,
        password,
        cpassword,
      };
      try {
        setloading(true);
        const result = await axios.post("http://localhost:5001/api/users/register", user);
        console.log(result.data);
        setloading(false);
        setsuccess(true);

        setname("");
        setemail("");
        setcpassword("");
        setcpassword("");
      } catch (error) {
        console.log(error.response.data); // Log the error response data
        setloading(false);
        setError(true);
      }
    } else {
      alert("password not matched");
    }
  }

  return (
    <div>
      {loading && <Loader />}
      {loading && <Error />}
      <div className="row justify-content-center mt-5">
        <div className=" col-md-5 mt-5">
          {success && <Success message="Registration success" />}
          <div className="bs">
            <h2>Регистрация</h2>
            <input
              type="text"
              className="form-control"
              placeholder="имя"
              value={Name}
              onChange={(e) => {
                setname(e.target.value);
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="email"
              value={email}
              onChange={(e) => {
                setemail(e.target.value);
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="пароль"
              value={password}
              onChange={(e) => {
                setpassword(e.target.value);
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="подтвердите пароль"
              value={cpassword}
              onChange={(e) => {
                setcpassword(e.target.value);
              }}
            />

            <button className="btn btn-primary mt-3" onClick={register}>
              Зарегестрироваться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registerscreen;
