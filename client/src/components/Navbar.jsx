import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function Navbar() {
  const [user, setUser] = useState(null);
  console.log(user)

  console.log('Navbar');
  useEffect(() => {

    const userString = localStorage.getItem('currentUser');
    if (userString){
      setUser(JSON.parse(userString));
    }
  // console.log('Navbar')
  // console.log(userString)
  // setUser(JSON.parse(userString));
  }, [])

  
  

  function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link className="navbar-brand" to="/">
          APARTMENTS
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"  ><i className="fa-solid fa-bars" style={{color: 'white'}}></i></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-5">
            {user ? (
              <>
                <div className="dropdown">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i className="fa fa-user"></i>{user.Name}
                  </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <a className="dropdown-item" href="/profile">
                      Профиль
                    </a>
                    <a className="dropdown-item" href="#" onClick={logout}>
                      Регистрация
                    </a>
                    
                  </div>
                </div>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/register">
                    Регистрация
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/login">
                    Профиль
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
}
