import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import Error from "../components/Error";
// import { use } from "../../../routes/bookingsRoute";
import { useNavigate } from "react-router-dom";

function Loginscreen() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setloading] = useState(false);
  const [error, setError] = useState();
  const navigate = useNavigate();

  async function Login() {
    const user = {
      email,
      password,
    };
    try {
      setloading(true);
      const result = await axios.post("http://localhost:5001/api/users/login", user);
      console.log(result.data);
      setloading(false);

      localStorage.setItem('currentUser', JSON.stringify(result.data));
      
      // navigate("/home");
      window.location.href = '/home';
    } catch (error) 
    {
      console.log(error); // Log the error response data
      setloading(false);
      setError(true);
    }
    
  }

  return (
    <div>
      {loading && (<Loader/>)}
      <div className="row justify-content-center mt-5">
        <div className=" col-md-5 mt-5">
          {error && (<Error message='Invalid Credentionals'/>)}
          <div className="bs">
            <h2>Вход в профиль</h2>
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

            <button className="btn btn-primary mt-3" onClick={Login}>
              Войти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginscreen;
