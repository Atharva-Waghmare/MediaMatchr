import React, { useState } from 'react';
import { Plus, X, Search, AlertCircle, Tv } from 'lucide-react';
import Navbar from './Navbar';
import './TVRecommendationApp.css';

function TVRecommendationApp({ onLogoClick }) {
    const [tvTitles, setTvTitles] = useState([]);
    const [newTvTitle, setNewTvTitle] = useState('');
    const [isInputError, setIsInputError] = useState(false);
    const [maxTvsReached, setMaxTvsReached] = useState(false);

    const [userDetails, setUserDetails] = useState({
        name: '',
        genre: '',
        era: '',
        mood: ''
    });

    const [step, setStep] = useState(1); // 1: Add TV shows, 2: Add details, 3: Results
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);

    // Handle adding a new TV show
    const handleAddTv = () => {
        if (!newTvTitle.trim()) {
            setIsInputError(true);
            return;
        }

        if (tvTitles.length >= 5) {
            setMaxTvsReached(true);
            return;
        }

        setTvTitles([...tvTitles, newTvTitle.trim()]);
        setNewTvTitle('');
        setIsInputError(false);

        if (tvTitles.length === 4) {
            setMaxTvsReached(true);
        }
    };

    // Handle removing a TV show
    const handleRemoveTv = (index) => {
        const updatedTvs = [...tvTitles];
        updatedTvs.splice(index, 1);
        setTvTitles(updatedTvs);
        setMaxTvsReached(false);
    };

    // Handle input key press (Enter)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddTv();
        }
    };

    // Handle detail form input changes
    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...userDetails, [name]: value });
    };

    // Handle continuing to details step
    const handleContinueToDetails = () => {
        if (tvTitles.length > 0) {
            setStep(2);
        } else {
            setIsInputError(true);
        }
    };

    // Handle getting recommendations
    const handleGetRecommendations = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'tvshows',
                    favorites: tvTitles,
                    preferences: {
                        genre: userDetails.genre,
                        mood: userDetails.mood,
                        era: userDetails.era
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }

            const data = await response.json();
            setRecommendations(data);
            setStep(3);
        } catch (error) {
            console.error('Error getting recommendations:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsLoading(false);
        }
    };

    // Add search functionality
    const handleSearch = async (query) => {
        if (!query) return;

        try {
            const response = await fetch(`http://localhost:5000/search?type=tvshows&query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to search');
            }
            const data = await response.json();
            // Handle the search results as needed
            console.log('Search results:', data);
        } catch (error) {
            console.error('Error searching:', error);
        }
    };

    // Reset to start over
    const handleStartOver = () => {
        setTvTitles([]);
        setNewTvTitle('');
        setUserDetails({
            name: '',
            genre: '',
            era: '',
            mood: ''
        });
        setIsInputError(false);
        setMaxTvsReached(false);
        setStep(1);
        setRecommendations([]);
    };

    return (
        <div className="app-container">
            <Navbar onLogoClick={onLogoClick} />
            {/* Main Content */}
            <main className="main-content">
                {/* Step Indicator */}
                <div className="container">
                    <div className="steps-container">
                        <div className="steps-track">
                            <div className={`step-line ${step >= 1 ? 'active' : ''}`}></div>
                            <div className={`step-circle ${step >= 1 ? 'active' : ''}`}>1</div>
                            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                            <div className={`step-circle ${step >= 2 ? 'active' : ''}`}>2</div>
                            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                            <div className={`step-circle ${step >= 3 ? 'active' : ''}`}>3</div>
                            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                        </div>
                    </div>
                </div>

                {/* Step 1: Add TV Shows */}
                {step === 1 && (
                    <section className="section">
                        <div className="container">
                            <div className="section-header">
                                <h2 className="section-title">Add Your Favorite TV Shows</h2>
                                <p className="section-subtitle">Enter up to 5 TV shows that you enjoy to receive personalized recommendations.</p>
                            </div>

                            <div className="form-container">
                                {/* TV show input */}
                                <div className="input-group">
                                    <input
                                        type="text"
                                        value={newTvTitle}
                                        onChange={(e) => {
                                            setNewTvTitle(e.target.value);
                                            setIsInputError(false);
                                        }}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter TV show title"
                                        className={`text-input ${isInputError ? 'error' : ''}`}
                                        disabled={maxTvsReached}
                                    />
                                    <button
                                        onClick={handleAddTv}
                                        disabled={maxTvsReached}
                                        className="add-button"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {isInputError && (
                                    <div className="error-message">
                                        <AlertCircle size={16} className="error-icon" />
                                        <span>Please enter a TV show title</span>
                                    </div>
                                )}

                                {maxTvsReached && tvTitles.length >= 5 && (
                                    <div className="warning-message">
                                        <AlertCircle size={20} />
                                        <p>Maximum of 5 TV shows reached. Remove one to add more.</p>
                                    </div>
                                )}

                                {/* List of added TV shows */}
                                <div className="tv-list-container">
                                    <h3 className="tv-list-title">Your TV Shows ({tvTitles.length}/5)</h3>

                                    {tvTitles.length === 0 ? (
                                        <p className="empty-message">No TV shows added yet</p>
                                    ) : (
                                        <ul className="tv-list">
                                            {tvTitles.map((tv, index) => (
                                                <li key={index} className="tv-list-item">
                                                    <span>{tv}</span>
                                                    <button
                                                        onClick={() => handleRemoveTv(index)}
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
                                <p className="section-subtitle">Help us understand your preferences better (optional)</p>
                            </div>

                            <div className="form-container details-form">
                                <div className="form-fields">
                                    <div className="form-field">
                                        <label className="form-label">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={userDetails.name}
                                            onChange={handleDetailChange}
                                            className="text-input"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label">Favorite Genre</label>
                                        <select
                                            name="genre"
                                            value={userDetails.genre}
                                            onChange={handleDetailChange}
                                            className="select-input"
                                        >
                                            <option value="">Select a genre</option>
                                            <option value="drama">Drama</option>
                                            <option value="comedy">Comedy</option>
                                            <option value="thriller">Thriller</option>
                                            <option value="sci-fi">Sci-Fi</option>
                                            <option value="fantasy">Fantasy</option>
                                            <option value="crime">Crime</option>
                                            <option value="action">Action</option>
                                            <option value="animated">Animated</option>
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
                                            <option value="classic">Classic (pre-1980s)</option>
                                            <option value="80s-90s">80s-90s</option>
                                            <option value="2000s">2000s</option>
                                            <option value="modern">Modern (2010s+)</option>
                                            <option value="any">Any era</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label">Current Mood</label>
                                        <select
                                            name="mood"
                                            value={userDetails.mood}
                                            onChange={handleDetailChange}
                                            className="select-input"
                                        >
                                            <option value="">How are you feeling?</option>
                                            <option value="happy">Happy</option>
                                            <option value="relaxed">Relaxed</option>
                                            <option value="thoughtful">Thoughtful</option>
                                            <option value="excited">Excited</option>
                                            <option value="nostalgic">Nostalgic</option>
                                            <option value="adventurous">Adventurous</option>
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
                                        <span>Get Your TV Shows</span>
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
                                        <h2 className="section-title">Your Personalized TV Recommendations</h2>
                                        <p className="section-subtitle">Based on your TV show choices, we think you'll love these</p>
                                    </div>

                                    <div className="recommendation-grid">
                                        {recommendations.map((tv) => (
                                            <div key={tv.id} className="tv-card">
                                                <img
                                                    src={tv.image}
                                                    alt={tv.title}
                                                    className="tv-poster"
                                                />
                                                <div className="tv-info">
                                                    <div className="tv-header">
                                                        <h4 className="tv-title">{tv.title}</h4>
                                                        <span className="tv-rating">
                                                            {tv.rating}
                                                        </span>
                                                    </div>
                                                    <p className="tv-network">{tv.network}</p>
                                                    <p className="tv-details">{tv.year} • {tv.seasons} seasons</p>
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
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <Tv size={20} className="logo-icon" />
                            <span className="logo-text">Entertainment Hub</span>
                        </div>
                        <div className="copyright">
                            © 2025 Entertainment Hub. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default TVRecommendationApp; 