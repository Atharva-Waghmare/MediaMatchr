import React, { useState } from "react";
import { Plus, X, Search, AlertCircle, Tv, Film } from "lucide-react";
import BookNavbar from "./BookNavbar";
import Footer from "./Footer";
import "./Movie.css"; // Using a separate CSS file for this page

function Movie() {
  const [movieTitles, setMovieTitles] = useState([]);
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [isInputError, setIsInputError] = useState(false);
  const [maxMoviesReached, setMaxMoviesReached] = useState(false);

  const [userDetails, setUserDetails] = useState({
    genre: "",
    era: "",
    mood: "",
  });

  const [step, setStep] = useState(1); // 1: Add movies, 2: Add details, 3: Results
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Handle adding a new movie
  const handleAddMovie = () => {
    if (!newMovieTitle.trim()) {
      setIsInputError(true);
      return;
    }

    if (movieTitles.length >= 5) {
      setMaxMoviesReached(true);
      return;
    }

    setMovieTitles([...movieTitles, newMovieTitle.trim()]);
    setNewMovieTitle("");
    setIsInputError(false);

    if (movieTitles.length === 4) {
      setMaxMoviesReached(true);
    }
  };

  // Handle removing a movie
  const handleRemoveMovie = (index) => {
    const updatedMovies = [...movieTitles];
    updatedMovies.splice(index, 1);
    setMovieTitles(updatedMovies);
    setMaxMoviesReached(false);
  };

  // Handle input key press (Enter)
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddMovie();
    }
  };

  // Handle detail form input changes
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  // Handle continuing to details step
  const handleContinueToDetails = () => {
    if (movieTitles.length > 0) {
      setStep(2);
    } else {
      setIsInputError(true);
    }
  };

  // Function to get movie recommendations
  const handleGetRecommendations = async () => {
    setIsLoading(true);

    try {
      // Prepare request payload
      const requestData = {
        titles: movieTitles,
        mood: userDetails.mood || null,
        era: userDetails.era || null,
        genre: userDetails.genre || null,
      };

      // Make API call to backend using movie-specific endpoint
      const response = await fetch(
        "http://localhost:8000/recommendations/movies/",
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
      console.error("Error getting movie recommendations:", error);
      // Fallback to mock results in case of error
      const mockResults = [
        {
          id: "tt0111161",
          title: "The Shawshank Redemption",
          type: "movie",
          year: 1994,
          rating: 9.3,
          genre: "Drama",
        },
        {
          id: "tt0068646",
          title: "The Godfather",
          type: "movie",
          year: 1972,
          rating: 9.2,
          genre: "Crime,Drama",
        },
        {
          id: "tt0468569",
          title: "The Dark Knight",
          type: "movie",
          year: 2008,
          rating: 9.0,
          genre: "Action,Crime,Drama",
        },
        {
          id: "tt0167260",
          title: "The Lord of the Rings: The Return of the King",
          type: "movie",
          year: 2003,
          rating: 8.9,
          genre: "Action,Adventure,Drama",
        },
        {
          id: "tt0120737",
          title: "The Lord of the Rings: The Fellowship of the Ring",
          type: "movie",
          year: 2001,
          rating: 8.8,
          genre: "Action,Adventure,Drama",
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
    setMovieTitles([]);
    setNewMovieTitle("");
    setUserDetails({
      genre: "",
      era: "",
      mood: "",
    });
    setIsInputError(false);
    setMaxMoviesReached(false);
    setStep(1);
    setRecommendations([]);
  };

  // Get icon based on media type
  const getMediaIcon = (type) => {
    if (type === "TV Series" || type === "tvSeries") {
      return <Tv size={16} className="media-icon" />;
    }
    return <Film size={16} className="media-icon" />;
  };

  // Get genre badges
  const getGenreBadges = (genreString) => {
    if (!genreString) return null;

    const genres = genreString.split(",");
    return (
      <div className="genre-badges">
        {genres.map((genre, index) => (
          <span key={index} className="genre-badge">
            {genre.trim()}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="movie-app-container">
      <BookNavbar />
      {/* Main Content */}
      <main className="movie-main-content">
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

        {/* Step 1: Add Movies */}
        {step === 1 && (
          <section className="movie-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">
                  Add Your Favorite Movies & TV Shows
                </h2>
                <p className="section-subtitle">
                  Enter up to 5 movies or TV shows that you enjoy to receive
                  personalized recommendations.
                </p>
              </div>

              <div className="form-container">
                {/* Movie input */}
                <div className="input-group">
                  <input
                    type="text"
                    value={newMovieTitle}
                    onChange={(e) => {
                      setNewMovieTitle(e.target.value);
                      setIsInputError(false);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter movie or TV show title"
                    className={`text-input ${isInputError ? "error" : ""}`}
                    disabled={maxMoviesReached}
                  />
                  <button
                    onClick={handleAddMovie}
                    disabled={maxMoviesReached}
                    className="add-button"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {isInputError && (
                  <div className="error-message">
                    <AlertCircle size={16} className="error-icon" />
                    <span>Please enter a movie or TV show title</span>
                  </div>
                )}

                {maxMoviesReached && movieTitles.length >= 5 && (
                  <div className="warning-message">
                    <AlertCircle size={20} />
                    <p>
                      Maximum of 5 titles reached. Remove a title to add more.
                    </p>
                  </div>
                )}

                {/* List of added movies */}
                <div className="movie-list-container">
                  <h3 className="movie-list-title">
                    Your Movies & Shows ({movieTitles.length}/5)
                  </h3>

                  {movieTitles.length === 0 ? (
                    <p className="empty-message">
                      No movies or shows added yet
                    </p>
                  ) : (
                    <ul className="movie-list">
                      {movieTitles.map((movie, index) => (
                        <li key={index} className="movie-list-item">
                          <Film size={16} className="movie-list-icon" />
                          <span>{movie}</span>
                          <button
                            onClick={() => handleRemoveMovie(index)}
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
          <section className="movie-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Add Some Details</h2>
                <p className="section-subtitle">
                  Help us understand your movie & TV preferences better
                  (optional)
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
                      <option value="comedy">Comedy</option>
                      <option value="drama">Drama</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="horror">Horror</option>
                      <option value="mystery">Mystery</option>
                      <option value="romance">Romance</option>
                      <option value="scifi">Science Fiction</option>
                      <option value="thriller">Thriller</option>
                      <option value="western">Western</option>
                      <option value="documentary">Documentary</option>
                      <option value="family">Family</option>
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
                      <option value="classic">Classic (pre-1970s)</option>
                      <option value="mid-century">70s-80s</option>
                      <option value="modern">90s-2000s</option>
                      <option value="contemporary">Modern (2010+)</option>
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
                    <span>Get Recommendations</span>
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <section className="movie-section">
            <div className="container">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loader"></div>
                </div>
              ) : (
                <>
                  <div className="section-header">
                    <h2 className="section-title">
                      Your Personalized Movie & TV Recommendations
                    </h2>
                    <p className="section-subtitle">
                      Based on your selections, we think you'll love these
                    </p>
                  </div>

                  <div className="movie-recommendation-grid">
                    {recommendations.map((movie) => (
                      <div key={movie.id} className="movie-card">
                        <div className="movie-card-content">
                          <div className="movie-info">
                            <div className="movie-header">
                              <h4 className="movie-title">{movie.title}</h4>
                              <span className="movie-rating">
                                {movie.rating.toFixed(1)}
                              </span>
                            </div>
                            <div className="movie-meta">
                              <div className="media-type">
                                {getMediaIcon(movie.type)}
                                <span>{movie.type}</span>
                              </div>
                              <div className="movie-year">{movie.year}</div>
                            </div>
                            {movie.genre && getGenreBadges(movie.genre)}
                          </div>
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

export default Movie;
