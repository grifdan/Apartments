import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Homescreen from './screens/Homescreen';
import Bookingscreen from './screens/Bookingscreen';
import Registerscreen from './screens/Registerscreen';
import Loginscreen from './screens/Loginscreen';
import Layout from './components/Layout';
import Profilescreen from './screens/Profilescreen';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element = {< Layout/>}>

          <Route index element={<Navigate to="/home"/>} />
          <Route path='/home' element={<Homescreen />} />
          
          <Route path="/book/:roomid/:fromDate/:toDate" element={<Bookingscreen />} />

          <Route path='/register' element={<Registerscreen/>}/>
          <Route path='/login' element={<Loginscreen/>}/>
          <Route path='/profile' element={<Profilescreen/>}/>
          

        </Route>
      </Routes>
    </div>
  );
}

export default App;
