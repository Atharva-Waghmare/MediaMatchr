import React from "react";
import {Film} from "lucide-react";
import { useLocation } from "react-router-dom";
import "./Navbar.css";

function BookNavbar() {
  const location = useLocation();
  const path = location.pathname;

  let navClass = "books-nav";
  let icon = <Film size={30} className="logo-icon" />;
  let logoText = "MediaMatchr";

  if (path === "/anime") {
    navClass = "anime-nav";
    icon = <Film size={30} className="logo-icon" />;
    logoText = "MediaMatchr";
  } else if (path === "/tv") {
    navClass = "movie-nav";
    icon = <Film size={30} className="logo-icon" />;
    logoText = "MediaMatchr";
  }

  return (
    <header className="header">
      <div className="container">
        <div className={`header-content ${navClass}`}>
          <div className="logo">
            {icon}
            <h1 className="logo-text">{logoText}</h1>
          </div>
          <div className="nav-menu">
            <a href="/" className="nav-link">
              Home
            </a>
            <a href="#" className="nav-link">
              How It Works
            </a>
            <a href="#" className="nav-link">
              Top Picks
            </a>
            <a href="#" className="nav-link">
              About
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default BookNavbar;
