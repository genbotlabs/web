import { BrowserRouter, Route, Routes } from  'react-router-dom';

import MainPage from './components/MainPage/MainPage'
import LoginPage from './components/Login/LoginPage'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainPage/>}></Route>
          <Route path='/login' element={<LoginPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}