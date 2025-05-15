import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import BookRecommendationApp from "./BookRecommendationApp";
import Anime from "./Anime";
import Movie from "./Movie";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<BookRecommendationApp />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/tv" element={<Movie />} />
      </Routes>
    </Router>
  );
}

export default App;
