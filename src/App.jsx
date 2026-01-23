import { HashRouter, Routes, Route } from 'react-router-dom';
import AskMeAnythingLight from './components/AskMeAnythingLight';
import AskMeAnythingPage from './components/AskMeAnythingPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<AskMeAnythingLight />} />
          <Route path="/v2" element={<AskMeAnythingPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
