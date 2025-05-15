import React, { useState } from "react";
import { Plus, X, Search, AlertCircle, BookOpen } from "lucide-react";
import BookNavbar from "./BookNavbar";
import Footer from "./Footer";
import "./BookRecommendation.css"; // Using book-specific CSS file

function BookRecommendationApp() {
  const [bookTitles, setBookTitles] = useState([]);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [isInputError, setIsInputError] = useState(false);
  const [maxBooksReached, setMaxBooksReached] = useState(false);

  const [userDetails, setUserDetails] = useState({
    genre: "",
    era: "",
    mood: "",
  });

  const [step, setStep] = useState(1); // 1: Add books, 2: Add details, 3: Results
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Handle adding a new book
  const handleAddBook = () => {
    if (!newBookTitle.trim()) {
      setIsInputError(true);
      return;
    }

    if (bookTitles.length >= 5) {
      setMaxBooksReached(true);
      return;
    }

    setBookTitles([...bookTitles, newBookTitle.trim()]);
    setNewBookTitle("");
    setIsInputError(false);

    if (bookTitles.length === 4) {
      setMaxBooksReached(true);
    }
  };

  // Handle removing a book
  const handleRemoveBook = (index) => {
    const updatedBooks = [...bookTitles];
    updatedBooks.splice(index, 1);
    setBookTitles(updatedBooks);
    setMaxBooksReached(false);
  };

  // Handle input key press (Enter)
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddBook();
    }
  };

  // Handle detail form input changes
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  // Handle continuing to details step
  const handleContinueToDetails = () => {
    if (bookTitles.length > 0) {
      setStep(2);
    } else {
      setIsInputError(true);
    }
  };

  // Mock function to get recommendations
  const handleGetRecommendations = async () => {
    setIsLoading(true);

    try {
      // Prepare request payload
      const requestData = {
        book_titles: bookTitles,
        mood: userDetails.mood || null,
        era: userDetails.era || null,
        genre: userDetails.genre || null,
      };

      // Make API call to backend
      const response = await fetch("http://localhost:8000/recommendations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      // Fallback to mock results in case of error
      const mockResults = [
        {
          id: 1,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          year: 1925,
          rating: 4.8,
          image:
            "https://images-na.ssl-images-amazon.com/images/I/71FTb9X6wsL.jpg",
        },
        {
          id: 2,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          year: 1960,
          rating: 4.9,
          image:
            "https://images-na.ssl-images-amazon.com/images/I/81f7o6uZjFL.jpg",
        },
        {
          id: 3,
          title: "1984",
          author: "George Orwell",
          year: 1949,
          rating: 4.7,
          image:
            "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
        },
        {
          id: 4,
          title: "Pride and Prejudice",
          author: "Jane Austen",
          year: 1813,
          rating: 4.9,
          image:
            "https://images-na.ssl-images-amazon.com/images/I/71Q1tPupKjL.jpg",
        },
        {
          id: 5,
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          year: 1951,
          rating: 4.8,
          image:
            "https://images-na.ssl-images-amazon.com/images/I/91HPG31dTwL.jpg",
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
    setBookTitles([]);
    setNewBookTitle("");
    setUserDetails({
      genre: "",
      era: "",
      mood: "",
    });
    setIsInputError(false);
    setMaxBooksReached(false);
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

        {/* Step 1: Add Books */}
        {step === 1 && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Add Your Favorite Books</h2>
                <p className="section-subtitle">
                  Enter up to 5 books that you enjoy to receive personalized
                  recommendations.
                </p>
              </div>

              <div className="form-container">
                {/* Book input */}
                <div className="input-group">
                  <input
                    type="text"
                    value={newBookTitle}
                    onChange={(e) => {
                      setNewBookTitle(e.target.value);
                      setIsInputError(false);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter book title"
                    className={`text-input ${isInputError ? "error" : ""}`}
                    disabled={maxBooksReached}
                  />
                  <button
                    onClick={handleAddBook}
                    disabled={maxBooksReached}
                    className="add-button"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {isInputError && (
                  <div className="error-message">
                    <AlertCircle size={16} className="error-icon" />
                    <span>Please enter a book title</span>
                  </div>
                )}

                {maxBooksReached && bookTitles.length >= 5 && (
                  <div className="warning-message">
                    <AlertCircle size={20} />
                    <p>
                      Maximum of 5 books reached. Remove a book to add more.
                    </p>
                  </div>
                )}

                {/* List of added books */}
                <div className="book-list-container">
                  <h3 className="book-list-title">
                    Your Books ({bookTitles.length}/5)
                  </h3>

                  {bookTitles.length === 0 ? (
                    <p className="empty-message">No books added yet</p>
                  ) : (
                    <ul className="book-list">
                      {bookTitles.map((book, index) => (
                        <li key={index} className="book-list-item">
                          <span>{book}</span>
                          <button
                            onClick={() => handleRemoveBook(index)}
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
                  Help us understand your reading preferences better (optional)
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
                      <option value="fiction">Fiction</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="scifi">Science Fiction</option>
                      <option value="mystery">Mystery/Thriller</option>
                      <option value="romance">Romance</option>
                      <option value="historical">Historical Fiction</option>
                      <option value="biography">Biography/Memoir</option>
                      <option value="nonfiction">Non-Fiction</option>
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
                      <option value="classic">Classics (pre-1950s)</option>
                      <option value="mid-century">
                        Mid-Century (1950-1980)
                      </option>
                      <option value="modern">Modern (1980-2010)</option>
                      <option value="contemporary">Contemporary (2010+)</option>
                      <option value="any">Any era</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Current Reading Mood</label>
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
                    <span>Get Your Books</span>
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
                      Your Personalized Recommendations
                    </h2>
                    <p className="section-subtitle">
                      Based on your book choices, we think you'll love these
                    </p>
                  </div>

                  <div className="recommendation-grid">
                    {recommendations.map((book) => (
                      <div key={book.id} className="book-card">
                        <img
                          src={book.image}
                          alt={book.title}
                          className="book-cover"
                        />
                        <div className="book-info">
                          <div className="book-header">
                            <h4 className="book-title">{book.title}</h4>
                            <span className="book-rating">{book.rating}</span>
                          </div>
                          <p className="book-author">{book.author}</p>
                          <p className="book-year">{book.year}</p>
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

export default BookRecommendationApp;
