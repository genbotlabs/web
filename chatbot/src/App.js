import { BrowserRouter, Route, Routes } from  'react-router-dom';

import './App.css';
import ChatbotPage from './pages/ChatbotPage';
import Header from './components/Header/Header';

function App() {
  return (
    <>
      <BrowserRouter>
        <Header /> 
        <Routes>
          <Route path='/chatbot' element={<ChatbotPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
