import { BrowserRouter, Route, Routes } from  'react-router-dom';
import { useState } from 'react';

import Header from './components/Header/Header';
import MainPage from './pages/MainPage'
// import LoginPage from '../pages/LoginPage'
import LoginPage from './pages/LoginPage';

export default function App() {
  const [user, setUser] = useState(null);
  console.log(user)
  return (
    <>
      <BrowserRouter>
        <Header user={user} />
        <Routes>
          <Route path='/' element={<MainPage setUser={setUser} />}></Route>
          <Route path='/login' element={<LoginPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}