import { BrowserRouter, Route, Routes } from  'react-router-dom';

import './App.css';
import ChatbotPage from './pages/ChatbotPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/chatbot' element={<ChatbotPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
