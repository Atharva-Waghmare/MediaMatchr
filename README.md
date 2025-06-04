
# MediaMatchr
MediaMatchr is a cross-domain entertainment recommendation system that delivers personalized suggestions for movies, TV shows, books, and anime based on user preferences. It employs a hybrid machine learning model integrating TF-IDF for content-based feature extraction, SVD for dimensionality reduction, and KNN for similarity-based recommendations. The system processes datasets with features like titles, genres, ratings, and release years, enhanced by sentiment analysis and trend analysis for precise recommendations.


## Features
- Cross-Domain Recommendations: Curates content across movies, TV shows, books, and anime.
- Personalized Suggestions: Accepts user inputs like preferences, mood-to-genre mappings, and ratings.
- Hybrid Model: Combines content-based and collaborative filtering using TF-IDF, SVD, and KNN.
- Evaluation Metrics: Employs precision@5 and other metrics to ensure recommendation accuracy.
- Interactive UI: Features a user-friendly interface (prototyped in Figma, coded in VS Code).
- Backend: Powered by Python, Flask, pandas, numpy, and Surprise for robust data processing and API endpoints.

## Tech Stack
- Backend: Python, Flask, pandas, numpy, scikit-learn, Surprise
- Frontend: HTML, CSS, JavaScript (assumed, based on typical web development)
- Design: Figma for UI/UX prototyping
- IDE: Visual Studio Code
## Installation
- Clone the repository:
```bash
git clone https://github.com/Atharva-Waghmare/DSA_project  
```
- Install dependencies:
```bash
pip install -r requirements.txt
```
- Run the Flask server:
```bash
python app.py
```
## Usage
- Access MediaMatchr via http://localhost:5000 after starting the server.
- Input preferences (e.g., genres, mood, or ratings) to receive tailored recommendations.
- Explore curated suggestions across multiple entertainment domains.
## Future Improvements
- Integrate real-time trend analysis using social media data.
- Enhance UI with advanced JavaScript frameworks like React.
- Expand dataset to include more diverse content sources.
