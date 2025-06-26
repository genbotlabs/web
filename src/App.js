import { BrowserRouter, Route, Routes } from  'react-router-dom';

import MainPage from './components/MainPage/MainPage'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}