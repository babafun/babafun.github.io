import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MusicHomePage from './pages/MusicHomePage';
import DiscographyPage from './pages/DiscographyPage';
import AlbumPage from './pages/AlbumPage';
import SongPage from './pages/SongPage';
import CodePage from './pages/CodePage';
import LicensesPage from './pages/LicensesPage';
import SearchPage from './pages/SearchPage';
import './styles/colors.css';
import './styles/main.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/music" element={<MusicHomePage />} />
            <Route path="/music/discography" element={<DiscographyPage />} />
            <Route path="/music/a/:albumId" element={<AlbumPage />} />
            <Route path="/music/s/:songId" element={<SongPage />} />
            <Route path="/music/search" element={<SearchPage />} />
            <Route path="/code" element={<CodePage />} />
            <Route path="/licenses" element={<LicensesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;