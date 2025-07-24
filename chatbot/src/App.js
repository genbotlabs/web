import { BrowserRouter, Route, Routes } from  'react-router-dom';

import './App.css';
import ChatbotPage from './pages/ChatbotPage';
import MainPage from './pages/MainPage';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainPage/>}></Route>
          <Route path='/chatbot' element={<ChatbotPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}