import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Film, Tv } from "lucide-react";
import BookNavbar from "./BookNavbar";
import Footer from "./Footer";
import "./Home.css"; // We'll create this CSS file next

function Home() {
  return (
    <div className="home-container">
      <BookNavbar />
      <header className="home-header">
        <h1 className="home-title">MediaMatchr</h1>
        <p className="home-subtitle">
          Find your next favorite entertainment across multiple media types
        </p>
      </header>

      <main className="cards-container">
        <Link to="/books" className="media-card books-card">
          <div className="card-overlay"></div>
          <div className="card-content">
            <BookOpen size={48} className="card-icon" />
            <h2 className="card-title">Books</h2>
            <p className="card-description">
              Discover new worlds, ideas, and characters through our curated
              book recommendations
            </p>
            <div className="card-button">Explore Books</div>
          </div>
        </Link>

        <Link to="/anime" className="media-card anime-card">
          <div className="card-overlay"></div>
          <div className="card-content">
            <Film size={48} className="card-icon" />
            <h2 className="card-title">Anime</h2>
            <p className="card-description">
              Journey through incredible Japanese animation with personalized
              anime recommendations
            </p>
            <div className="card-button">Discover Anime</div>
          </div>
        </Link>

        <Link to="/tv" className="media-card tv-card">
          <div className="card-overlay"></div>
          <div className="card-content">
            <Tv size={48} className="card-icon" />
            <h2 className="card-title">Movies & TV</h2>
            <p className="card-description">
              Find your next binge-worthy shows and movies tailored to your
              taste
            </p>
            <div className="card-button">Discover Shows</div>
          </div>
        </Link>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
