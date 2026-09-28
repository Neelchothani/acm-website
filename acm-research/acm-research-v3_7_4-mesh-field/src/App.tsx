import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import '@/app/globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import MeshField from '@/components/MeshField';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';

function ScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollHandler />
      <SmoothScroll />
      {/* Site-wide interactive dotted background */}
      <MeshField />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
