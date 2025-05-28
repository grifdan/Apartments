import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";


const Layout = () => 
    <main>
        <Navbar/>
        <Outlet/>
    </main>

export default Layout;