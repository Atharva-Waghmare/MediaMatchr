import React, { useState } from "react";
import { Plus, X, Search, AlertCircle, Film } from "lucide-react";
import BookNavbar from "./BookNavbar";
import Footer from "./Footer";
import "./Anime.css"; // Using anime-specific CSS file

function Anime() {
  const [animeTitles, setAnimeTitles] = useState([]);
  const [newAnimeTitle, setNewAnimeTitle] = useState("");
  const [isInputError, setIsInputError] = useState(false);
  const [maxAnimesReached, setMaxAnimesReached] = useState(false);

  const [userDetails, setUserDetails] = useState({
    genre: "",
    era: "",
    mood: "",
  });

  const [step, setStep] = useState(1); // 1: Add animes, 2: Add details, 3: Results
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Handle adding a new anime
  const handleAddAnime = () => {
    if (!newAnimeTitle.trim()) {
      setIsInputError(true);
      return;
    }

    if (animeTitles.length >= 5) {
      setMaxAnimesReached(true);
      return;
    }

    setAnimeTitles([...animeTitles, newAnimeTitle.trim()]);
    setNewAnimeTitle("");
    setIsInputError(false);

    if (animeTitles.length === 4) {
      setMaxAnimesReached(true);
    }
  };

  // Handle removing an anime
  const handleRemoveAnime = (index) => {
    const updatedAnimes = [...animeTitles];
    updatedAnimes.splice(index, 1);
    setAnimeTitles(updatedAnimes);
    setMaxAnimesReached(false);
  };

  // Handle input key press (Enter)
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddAnime();
    }
  };

  // Handle detail form input changes
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  // Handle continuing to details step
  const handleContinueToDetails = () => {
    if (animeTitles.length > 0) {
      setStep(2);
    } else {
      setIsInputError(true);
    }
  };

  // Function to get anime recommendations
  const handleGetRecommendations = async () => {
    setIsLoading(true);

    try {
      // Prepare request payload
      const requestData = {
        titles: animeTitles,
        mood: userDetails.mood || null,
        era: userDetails.era || null,
        genre: userDetails.genre || null,
      };

      // Make API call to backend using anime-specific endpoint
      const response = await fetch(
        "http://localhost:8000/recommendations/anime/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get recommendations");
      }

      const data = await response.json();
      console.log(data);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error getting anime recommendations:", error);
      // Fallback to mock results in case of error
      const mockResults = [
        {
          id: 1,
          title: "Death Note",
          author: "Madhouse",
          year: 2006,
          rating: 8.6,
          image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
        },
        {
          id: 2,
          title: "Fullmetal Alchemist: Brotherhood",
          author: "Bones",
          year: 2009,
          rating: 9.1,
          image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
        },
        {
          id: 3,
          title: "Attack on Titan",
          author: "Wit Studio",
          year: 2013,
          rating: 8.5,
          image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        },
        {
          id: 4,
          title: "One Punch Man",
          author: "Madhouse",
          year: 2015,
          rating: 8.7,
          image: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
        },
        {
          id: 5,
          title: "My Hero Academia",
          author: "Bones",
          year: 2016,
          rating: 8.2,
          image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
        },
      ];

      setRecommendations(mockResults);
    } finally {
      setIsLoading(false);
      setStep(3);
    }
  };

  // Reset to start over
  const handleStartOver = () => {
    setAnimeTitles([]);
    setNewAnimeTitle("");
    setUserDetails({
      genre: "",
      era: "",
      mood: "",
    });
    setIsInputError(false);
    setMaxAnimesReached(false);
    setStep(1);
    setRecommendations([]);
  };

  return (
    <div className="app-container">
      <BookNavbar />
      {/* Main Content */}
      <main className="main-content">
        {/* Step Indicator */}
        <div className="container">
          <div className="steps-container">
            <div className="steps-track">
              <div className={`step-line ${step >= 1 ? "active" : ""}`}></div>
              <div className={`step-circle ${step >= 1 ? "active" : ""}`}>
                1
              </div>
              <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
              <div className={`step-circle ${step >= 2 ? "active" : ""}`}>
                2
              </div>
              <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
              <div className={`step-circle ${step >= 3 ? "active" : ""}`}>
                3
              </div>
              <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
            </div>
          </div>
        </div>

        {/* Step 1: Add Animes */}
        {step === 1 && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Add Your Favorite Anime</h2>
                <p className="section-subtitle">
                  Enter up to 5 anime that you enjoy to receive personalized
                  recommendations.
                </p>
              </div>

              <div className="form-container">
                {/* Anime input */}
                <div className="input-group">
                  <input
                    type="text"
                    value={newAnimeTitle}
                    onChange={(e) => {
                      setNewAnimeTitle(e.target.value);
                      setIsInputError(false);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter anime title"
                    className={`text-input ${isInputError ? "error" : ""}`}
                    disabled={maxAnimesReached}
                  />
                  <button
                    onClick={handleAddAnime}
                    disabled={maxAnimesReached}
                    className="add-button"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {isInputError && (
                  <div className="error-message">
                    <AlertCircle size={16} className="error-icon" />
                    <span>Please enter an anime title</span>
                  </div>
                )}

                {maxAnimesReached && animeTitles.length >= 5 && (
                  <div className="warning-message">
                    <AlertCircle size={20} />
                    <p>
                      Maximum of 5 titles reached. Remove a title to add more.
                    </p>
                  </div>
                )}

                {/* List of added animes */}
                <div className="book-list-container">
                  <h3 className="book-list-title">
                    Your Anime ({animeTitles.length}/5)
                  </h3>

                  {animeTitles.length === 0 ? (
                    <p className="empty-message">No anime added yet</p>
                  ) : (
                    <ul className="book-list">
                      {animeTitles.map((anime, index) => (
                        <li key={index} className="book-list-item">
                          <span>{anime}</span>
                          <button
                            onClick={() => handleRemoveAnime(index)}
                            className="remove-button"
                          >
                            <X size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Continue button */}
                <div className="button-container">
                  <button
                    onClick={handleContinueToDetails}
                    className="primary-button"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Add Details */}
        {step === 2 && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Add Some Details</h2>
                <p className="section-subtitle">
                  Help us understand your anime preferences better (optional)
                </p>
              </div>

              <div className="form-container details-form">
                <div className="form-fields">
                  <div className="form-field">
                    <label className="form-label">Favorite Genre</label>
                    <select
                      name="genre"
                      value={userDetails.genre}
                      onChange={handleDetailChange}
                      className="select-input"
                    >
                      <option value="">Select a genre</option>
                      <option value="action">Action</option>
                      <option value="adventure">Adventure</option>
                      <option value="comedy">Comedy</option>
                      <option value="drama">Drama</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="scifi">Science Fiction</option>
                      <option value="romance">Romance</option>
                      <option value="slice">Slice of Life</option>
                      <option value="sports">Sports</option>
                      <option value="mystery">Mystery</option>
                      <option value="horror">Horror</option>
                      <option value="supernatural">Supernatural</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Preferred Era</label>
                    <select
                      name="era"
                      value={userDetails.era}
                      onChange={handleDetailChange}
                      className="select-input"
                    >
                      <option value="">Select an era</option>
                      <option value="classic">Classic (1960-1990)</option>
                      <option value="mid-century">90s Anime (1990-2000)</option>
                      <option value="modern">2000s Anime (2000-2010)</option>
                      <option value="contemporary">Modern Anime (2010+)</option>
                      <option value="any">Any era</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Current Watching Mood</label>
                    <select
                      name="mood"
                      value={userDetails.mood}
                      onChange={handleDetailChange}
                      className="select-input"
                    >
                      <option value="">What are you in the mood for?</option>
                      <option value="light">Light & Easy</option>
                      <option value="thought-provoking">
                        Thought-Provoking
                      </option>
                      <option value="escape">Escapism</option>
                      <option value="learn">Learning Something New</option>
                      <option value="emotional">Emotional Journey</option>
                      <option value="adventurous">Adventure</option>
                    </select>
                  </div>
                </div>

                <div className="button-group">
                  <button
                    onClick={() => setStep(1)}
                    className="secondary-button"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleGetRecommendations}
                    className="search-button"
                  >
                    <span>Get Your Anime</span>
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <section className="section">
            <div className="container">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loader"></div>
                </div>
              ) : (
                <>
                  <div className="section-header">
                    <h2 className="section-title">
                      Your Personalized Anime Recommendations
                    </h2>
                    <p className="section-subtitle">
                      Based on your anime choices, we think you'll love these
                    </p>
                  </div>

                  <div className="recommendation-grid">
                    {recommendations.map((anime) => (
                      <div key={anime.id} className="book-card">
                        <img
                          src={anime.image.replace(
                            "myanimelist.cdn-dena.com",
                            "cdn.myanimelist.net"
                          )}
                          alt={anime.title}
                          className="book-cover"
                        />
                        <div className="book-info">
                          <div className="book-header">
                            <h4 className="book-title">{anime.title}</h4>
                            <span className="book-rating">{anime.rating}</span>
                          </div>
                          <p className="book-author">Studio: {anime.author}</p>
                          <p className="book-year">{anime.year}</p>
                          {anime.genre && (
                            <p className="book-genre">{anime.genre}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="button-container">
                    <button
                      onClick={handleStartOver}
                      className="secondary-button"
                    >
                      Start Over
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Anime;
