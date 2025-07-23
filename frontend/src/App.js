import { BrowserRouter, Route, Routes } from  'react-router-dom';
import { useState } from 'react';
import 'antd/dist/reset.css'; 

import Header from './components/Header/Header';
import MainPage from './pages/MainPage'
import LoginPage from './pages/LoginPage';
import GenerateBotPage from './pages/GenerateBotPage';
import PendingPage from './pages/PendingPage';
import MyAccountPage from './pages/MyAccountPage';
import DashBoardPage from './pages/DashBoardPage';
import SideBar from './pages/SideBar';

export default function App() {
  const [user, setUser] = useState(null);
  console.log(user)
  return (
    <>
      <BrowserRouter>
        <Header user={user} setUser={setUser}/>
        {/* <SideBar user={user}/> */}
        <Routes>
          <Route path='/' element={<MainPage user={user} setUser={setUser} />}></Route>
          <Route path='/login' element={<LoginPage/>}></Route>
          <Route path='/generate' element={<GenerateBotPage user={user}/>}></Route>
          <Route path="/generate/pending" element={<PendingPage user={user}/>} />
          <Route path="/mypage" element={<MyAccountPage user={user}/>} />
          <Route path="/dashboard" element={<DashBoardPage user={user}/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}