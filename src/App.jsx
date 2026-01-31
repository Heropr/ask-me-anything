import { HashRouter, Routes, Route } from 'react-router-dom';
import AskMeAnythingLight from './components/AskMeAnythingLight';
import AskMeAnythingPage from './components/AskMeAnythingPage';
import AskMeAnythingV3 from './components/AskMeAnythingV3';
import AskMeAnythingV4 from './components/AskMeAnythingV4';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<AskMeAnythingLight />} />
          <Route path="/v2" element={<AskMeAnythingPage />} />
          <Route path="/v3" element={<AskMeAnythingV3 />} />
          <Route path="/v4" element={<AskMeAnythingV4 />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
