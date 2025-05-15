import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from scipy.linalg import svd
import os
import warnings
warnings.filterwarnings('ignore')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mood-to-Genre Mapping for Books
mood_to_book_genres = {
    'light': [
        'Humor', 'Comedy', 'Romance', 'Contemporary Romance', 'Chick Lit',
        'Childrens', 'Picture Books'
    ],
    'thought-provoking': [
        'Philosophy', 'Literary Fiction', 'Psychology', 'Sociology', 'Classics',
        'Criticism', 'Literary Criticism'
    ],
    'escape': [
        'Fantasy', 'Science Fiction', 'Science Fiction Fantasy', 'Adventure',
        'Epic Fantasy', 'Urban Fantasy', 'Paranormal', 'Space Opera', 'Dystopia'
    ],
    'learn': [
        'Nonfiction', 'Biography', 'Autobiography', 'Memoir', 'Biography Memoir',
        'History', 'Science', 'Popular Science', 'Reference', 'Education'
    ],
    'emotional': [
        'Drama', 'Family', 'Womens Fiction', 'Literary Fiction', 'Romance',
        'Inspirational', 'Young Adult'
    ],
    'adventurous': [
        'Adventure', 'Action', 'Thriller', 'Mystery Thriller', 'Spy Thriller',
        'Historical Fiction', 'War', 'Military Fiction'
    ]
}

# Mood-to-Genre Mapping for Anime
mood_to_anime_genres = {
    'light': [
        'Comedy', 'Slice of Life', 'School', 'Kids'
    ],
    'thought-provoking': [
        'Psychological', 'Drama', 'Mystery', 'Seinen', 'Josei',
        'Philosophy', 'Sci-Fi'
    ],
    'escape': [
        'Fantasy', 'Supernatural', 'Magic', 'Adventure', 'Space',
        'Sci-Fi', 'Isekai'
    ],
    'learn': [
        'Historical', 'Documentary', 'Educational', 'Military',
        'Sci-Fi', 'Medical'
    ],
    'emotional': [
        'Drama', 'Romance', 'Tragedy', 'Shoujo', 'Slice of Life',
        'Family'
    ],
    'adventurous': [
        'Action', 'Adventure', 'Shounen', 'Fantasy', 'Sports',
        'Martial Arts', 'Super Power', 'Mecha'
    ]
}

# Additional mapping dictionaries for movies and TV shows

# Mood-to-Genre Mapping for Movies/TV
mood_to_movie_genres = {
    'light': [
        'Comedy', 'Family', 'Animation', 'Musical', 'Romance'
    ],
    'thought-provoking': [
        'Drama', 'Biography', 'Documentary', 'History', 'Mystery'
    ],
    'escape': [
        'Fantasy', 'Sci-Fi', 'Adventure', 'Western'
    ],
    'learn': [
        'Documentary', 'Biography', 'History', 'War'
    ],
    'emotional': [
        'Drama', 'Romance', 'Music'
    ],
    'adventurous': [
        'Action', 'Thriller', 'Crime', 'Adventure', 'Sport', 'Horror'
    ]
}

# Era-to-Genre Proxy Mapping for Books
era_to_book_genres = {
    'classic': ['Classics', '19th Century', 'Ancient', 'Ancient History'],
    'mid-century': ['20th Century'],
    'modern': ['20th Century', '21st Century'],
    'contemporary': ['21st Century', 'Contemporary'],
    'any': None  # No filter
}

# Era-to-Year Mapping for Anime
era_to_anime_years = {
    'classic': (1960, 1990),  # Classic anime era
    'mid-century': (1990, 2000),  # 1990s anime
    'modern': (2000, 2010),  # 2000s anime
    'contemporary': (2010, 2025),  # 2010s onwards
    'any': None  # No filter
}

# Era-to-Year Mapping for Movies/TV
era_to_movie_years = {
    'classic': (1900, 1970),     # Classic era
    'mid-century': (1970, 1990), # 70s-80s
    'modern': (1990, 2010),      # 90s-2000s
    'contemporary': (2010, 2025), # 2010s onwards
    'any': None  # No filter
}

# Map frontend genre values to actual genres for Books
book_genre_mapping = {
    'fiction': 'Fiction',
    'fantasy': 'Fantasy',
    'scifi': 'Science Fiction',
    'mystery': 'Mystery',
    'romance': 'Romance',
    'historical': 'Historical Fiction',
    'biography': 'Biography',
    'nonfiction': 'Nonfiction'
}

# Map frontend genre values to actual genres for Anime
anime_genre_mapping = {
    'action': 'Action',
    'adventure': 'Adventure',
    'comedy': 'Comedy',
    'drama': 'Drama',
    'fantasy': 'Fantasy',
    'scifi': 'Sci-Fi',
    'romance': 'Romance',
    'slice': 'Slice of Life',
    'sports': 'Sports',
    'mystery': 'Mystery',
    'horror': 'Horror',
    'supernatural': 'Supernatural'
}

# Map frontend genre values to actual genres for Movies/TV
movie_genre_mapping = {
    'action': 'Action',
    'comedy': 'Comedy',
    'drama': 'Drama',
    'fantasy': 'Fantasy',
    'horror': 'Horror',
    'mystery': 'Mystery',
    'romance': 'Romance',
    'scifi': 'Sci-Fi',
    'thriller': 'Thriller',
    'western': 'Western',
    'documentary': 'Documentary',
    'family': 'Family'
}

# Load the datasets
@app.on_event("startup")
async def startup_db_client():
    try:
        # Set base path for data files
        base_path = os.path.join(os.path.dirname(__file__), '')
        
        # Load Book Dataset
        book_processed_path = os.path.join(base_path, 'book_processed.csv')
        if os.path.exists(book_processed_path):
            app.book_df = pd.read_csv(book_processed_path)
            print(f"Loaded book dataset with {len(app.book_df)} records")
        else:
            print(f"Book dataset not found at {book_processed_path}")
            # Create a small sample dataset if the real data can't be loaded
            app.book_df = pd.DataFrame({
                'item_id': ['1', '2', '3', '4', '5'],
                'title': ['To Kill a Mockingbird', '1984', 'The Great Gatsby', 'Pride and Prejudice', 'The Catcher in the Rye'],
                'author': ['Harper Lee', 'George Orwell', 'F. Scott Fitzgerald', 'Jane Austen', 'J.D. Salinger'],
                'genres': ['Fiction,Classics', 'Fiction,Science Fiction,Classics', 'Fiction,Classics', 'Fiction,Classics,Romance', 'Fiction,Classics'],
                'avg_rating': [4.3, 4.2, 3.9, 4.3, 3.8],
                'num_votes': [4000, 3500, 3200, 2800, 2500],
                'domain': ['book', 'book', 'book', 'book', 'book'],
                'img': ['https://images-na.ssl-images-amazon.com/images/I/81f7o6uZjFL.jpg', 
                        'https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg',
                        'https://images-na.ssl-images-amazon.com/images/I/71FTb9X6wsL.jpg', 
                        'https://images-na.ssl-images-amazon.com/images/I/71Q1tPupKjL.jpg', 
                        'https://images-na.ssl-images-amazon.com/images/I/91HPG31dTwL.jpg']
            })
        
        # Load Anime Dataset
        anime_processed_path = os.path.join(base_path, 'anime_processed.csv')
        if os.path.exists(anime_processed_path):
            app.anime_df = pd.read_csv(anime_processed_path)
            # Preprocess fields specifically for anime
            app.anime_df['genre'] = app.anime_df['genre'].fillna('Unknown')
            app.anime_df['avg_rating'] = app.anime_df['avg_rating'].fillna(0)
            app.anime_df['num_votes'] = app.anime_df['scored_by'].fillna(0)
            app.anime_df['item_id'] = app.anime_df['anime_id']
            app.anime_df['author'] = app.anime_df['studio']
            print(f"Loaded anime dataset with {len(app.anime_df)} records")
        else:
            print(f"Anime dataset not found at {anime_processed_path}")
            # Create a small sample dataset if the real data can't be loaded
            app.anime_df = pd.DataFrame({
                'item_id': ['1', '2', '3', '4', '5'],
                'anime_id': ['1', '2', '3', '4', '5'],
                'title': ['Death Note', 'Full Metal Alchemist', 'Attack on Titan', 'One Punch Man', 'My Hero Academia'],
                'studio': ['Madhouse', 'Bones', 'Wit Studio', 'Madhouse', 'Bones'],
                'genre': ['Mystery,Psychological,Thriller', 'Action,Adventure,Fantasy', 'Action,Drama,Fantasy', 'Action,Comedy,Sci-Fi', 'Action,Comedy,School'],
                'avg_rating': [8.6, 9.0, 8.5, 8.7, 8.2],
                'scored_by': [1500000, 1400000, 1300000, 1200000, 1100000],
                'image_url': ['https://cdn.myanimelist.net/images/anime/9/9453.jpg',
                             'https://cdn.myanimelist.net/images/anime/10/75815.jpg',
                             'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
                             'https://cdn.myanimelist.net/images/anime/12/76049.jpg',
                             'https://cdn.myanimelist.net/images/anime/10/78745.jpg'],
                'aired_from_year': [2006, 2009, 2013, 2015, 2016],
                'domain': ['anime', 'anime', 'anime', 'anime', 'anime']
            })
        
        # Load Movie Dataset
        movie_processed_path = os.path.join(base_path, 'movie_processed.csv')
        if os.path.exists(movie_processed_path):
            app.movie_df = pd.read_csv(movie_processed_path)
            print(f"Loaded movie dataset with {len(app.movie_df)} records")
        else:
            print(f"Movie dataset not found at {movie_processed_path}")
            # Create a small sample dataset if the real data can't be loaded
            app.movie_df = pd.DataFrame({
                'item_id': ['tt0111161', 'tt0068646', 'tt0071562', 'tt0468569', 'tt0050083'],
                'title': ['The Shawshank Redemption', 'The Godfather', 'The Godfather: Part II', 'The Dark Knight', '12 Angry Men'],
                'author': ['Director', 'Director', 'Director', 'Director', 'Director'],
                'genre': ['Drama', 'Crime,Drama', 'Crime,Drama', 'Action,Crime,Drama', 'Crime,Drama'],
                'year': [1994, 1972, 1974, 2008, 1957],
                'avg_rating': [9.3, 9.2, 9.0, 9.0, 8.9],
                'num_votes': [2400000, 1700000, 1200000, 2500000, 700000],
                'domain': ['movie', 'movie', 'movie', 'movie', 'movie'],
                'img': ['https://via.placeholder.com/150x225?text=Movie+Poster'] * 5
            })

    except Exception as e:
        print(f"Error loading datasets: {e}")
        # Create placeholder data if an error occurs
        app.movie_df = pd.DataFrame({
            'item_id': ['tt0111161', 'tt0068646'],
            'title': ['The Shawshank Redemption', 'The Godfather'],
            'author': ['Director', 'Director'],
            'genre': ['Drama', 'Crime,Drama'],
            'year': [1994, 1972],
            'avg_rating': [9.3, 9.2],
            'num_votes': [2400000, 1700000],
            'domain': ['movie', 'movie'],
            'img': ['https://via.placeholder.com/150x225?text=Movie+Poster'] * 2
        })


class RecommendationRequest(BaseModel):
    titles: list
    mood: str = None
    era: str = None  
    genre: str = None
    domain: str = "book"  # Default to books, can be "anime"


# Function to Filter Dataset Based on Mood, Era, and Genre
def filter_dataset(df, mood, era, genre, domain="book"):
    """Filter the dataset based on user-selected mood, era, and genre."""
    filtered_df = df.copy()
    
    # Get appropriate genre mapping and mood-to-genre mapping based on domain
    if domain == "anime":
        genre_map = anime_genre_mapping
        mood_to_genres = mood_to_anime_genres
    elif domain == "movie":
        genre_map = movie_genre_mapping
        mood_to_genres = mood_to_movie_genres
    else:  # default to book
        genre_map = book_genre_mapping
        mood_to_genres = mood_to_book_genres
    
    # Step 1: Genre Filtering
    target_genres = []
    if genre and genre in genre_map:
        target_genres.append(genre_map[genre])
    
    if mood and mood in mood_to_genres:
        target_genres.extend(mood_to_genres[mood])
    
    target_genres = list(set(target_genres))  # Remove duplicates
    
    if target_genres:
        genre_col = 'genres' if domain == 'book' else 'genre'
        genre_filter = filtered_df[genre_col].apply(
            lambda x: any(g in str(x).split(',') for g in target_genres)
        )
        filtered_df = filtered_df[genre_filter]
    
    # Step 2: Era Filtering
    if era and era != 'any':
        if domain == "anime" and era in era_to_anime_years:
            year_range = era_to_anime_years[era]
            if year_range:
                start_year, end_year = year_range
                filtered_df = filtered_df[(filtered_df['aired_from_year'] >= start_year) & 
                                        (filtered_df['aired_from_year'] < end_year)]
        elif domain == "book" and era in era_to_book_genres and era_to_book_genres[era]:
            era_genres = era_to_book_genres[era]
            era_filter = filtered_df['genres'].apply(
                lambda x: any(g in str(x).split(',') for g in era_genres)
            )
            filtered_df = filtered_df[era_filter]
        elif domain == "movie" and era in era_to_movie_years and era_to_movie_years[era]:
            start_year, end_year = era_to_movie_years[era]
            year_filter = (filtered_df['year'] >= start_year) & (filtered_df['year'] < end_year)
            filtered_df = filtered_df[year_filter]
    
    # If we filtered too aggressively, return original dataset
    print(len(filtered_df))
    if len(filtered_df) < 1:
        print(f"Warning: Too few {domain}s match filters. Using broader dataset.")
        return df
    
    return filtered_df

# Function to Build Feature Matrix and Train Model
def build_model(filtered_df, domain="book"):
    """Build the feature matrix and train the SVD-KNN model on the filtered dataset."""
    # Determine genre column name based on domain
    genre_col = 'genres' if domain == 'book' else 'genre'
    
    # Feature Engineering
    tfidf = TfidfVectorizer(tokenizer=lambda x: str(x).split(','), lowercase=True, token_pattern=None)
    genre_features = tfidf.fit_transform(filtered_df[genre_col].fillna('Unknown'))
    
    scaler = StandardScaler()
    numerical_features = scaler.fit_transform(filtered_df[['avg_rating', 'num_votes']].fillna(0))
    
    feature_matrix = np.hstack((genre_features.toarray(), numerical_features))
    
    # Apply SVD
    U, Sigma, Vt = svd(feature_matrix, full_matrices=False)
    k = min(50, feature_matrix.shape[1] - 1)  # Adjust k if feature matrix is smaller
    U_k = U[:, :k]
    Sigma_k = np.diag(Sigma[:k])
    latent_matrix = np.dot(U_k, Sigma_k)
    
    # Apply KNN
    knn = NearestNeighbors(n_neighbors=6, metric='cosine')
    knn.fit(latent_matrix)
    
    return latent_matrix, knn, filtered_df

# Function to Find Similar Items
def find_similar_items(titles, full_df, filtered_df, latent_matrix, knn_model, domain="book", n_recommendations=5):
    """Find similar items based on input titles."""
    # Find matching items in the filtered dataset
    item_indices = []
    
    # Determine title column based on domain
    title_column = 'title'
    
    for title in titles:
        title = title.lower().strip()
        matching_items = filtered_df[filtered_df[title_column].str.lower().str.contains(title, na=False)]
        if not matching_items.empty:
            item_indices.append(filtered_df.index.get_loc(matching_items.index[0]))
    
    if not item_indices:
        # Fallback to popular items if no matches
        return full_df.sort_values('num_votes', ascending=False).head(n_recommendations)
    
    # Aggregate latent features of input items
    aggregated_features = np.mean(latent_matrix[item_indices], axis=0).reshape(1, -1)
    
    # Find nearest neighbors
    distances, indices = knn_model.kneighbors(aggregated_features, n_neighbors=n_recommendations + len(item_indices))
    
    # Filter out input items from recommendations
    input_indices_set = set(item_indices)
    similar_indices = [idx for idx in indices[0] if idx not in input_indices_set][:n_recommendations]
    
    # Extract appropriate fields based on domain
    if domain == "anime":
        fields = ['title', 'author', 'genre', 'avg_rating', 'scored_by', 'image_url']
    elif domain == "movie":
        fields = ['title', 'author', 'genre', 'avg_rating', 'num_votes', 'img']
    else:  # Book
        fields = ['title', 'author', 'genres', 'avg_rating', 'num_votes', 'img']
    
    # Use available fields from the DataFrame
    available_fields = [f for f in fields if f in filtered_df.columns]
    
    # Map indices back to the filtered DataFrame
    similar_items = filtered_df.iloc[similar_indices][available_fields]
    
    return similar_items

@app.get("/")
def read_root():
    return {"message": "Recommendation API is running"}

@app.post("/recommendations/books/")
async def get_book_recommendations(request: RecommendationRequest):
    try:
        # Check if we have titles
        if not request.titles or len(request.titles) == 0:
            raise HTTPException(status_code=400, detail="No book titles provided")
        
        # Force domain to be "book" regardless of what was sent
        domain = "book"
        df = app.book_df
            
        # Filter the dataset based on user preferences
        filtered_df = filter_dataset(df, request.mood, request.era, request.genre, domain)
        
        # Build the model
        item_latent_matrix, knn, filtered_df = build_model(filtered_df, domain)
        
        # Get recommendations
        similar_items = find_similar_items(
            request.titles, 
            df,
            filtered_df, 
            item_latent_matrix, 
            knn, 
            domain,
            n_recommendations=5
        )
        
        # Convert results to a list of dictionaries
        recommendations = []
        for _, item in similar_items.iterrows():
            try:
                rec_item = {
                    'id': item.get('item_id', ''),
                    'title': item.get('title', 'Unknown Title'),
                    'author': item.get('author', 'Unknown Creator'),
                    'rating': float(item.get('avg_rating', 0)),
                    'image': item.get('img', "https://via.placeholder.com/150x225?text=No+Cover"),
                    'year': int(item.get('year', 0)) if 'year' in item and pd.notna(item['year']) else None
                }
                
                # Ensure the image URL is valid
                if rec_item['image'] in ['Unknown', '', None]:
                    rec_item['image'] = "https://via.placeholder.com/150x225?text=No+Cover"
                    
                recommendations.append(rec_item)
            except Exception as e:
                print(f"Error processing book: {e}")
                continue
        
        return {"recommendations": recommendations, "domain": domain}
    
    except Exception as e:
        print(f"Error in book recommendation endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations/anime/")
async def get_anime_recommendations(request: RecommendationRequest):
    try:
        # Check if we have titles
        if not request.titles or len(request.titles) == 0:
            raise HTTPException(status_code=400, detail="No anime titles provided")
        
        # Force domain to be "anime" regardless of what was sent
        domain = "anime"
        df = app.anime_df
            
        # Filter the dataset based on user preferences
        filtered_df = filter_dataset(df, request.mood, request.era, request.genre, domain)
        
        # Build the model
        item_latent_matrix, knn, filtered_df = build_model(filtered_df, domain)
        
        # Get recommendations
        similar_items = find_similar_items(
            request.titles, 
            df,
            filtered_df, 
            item_latent_matrix, 
            knn, 
            domain,
            n_recommendations=5
        )
        
        # Convert results to a list of dictionaries
        recommendations = []
        for _, item in similar_items.iterrows():
            try:
                rec_item = {
                    'id': item.get('item_id', ''),
                    'title': item.get('title', 'Unknown Title'),
                    'author': item.get('author', 'Unknown Creator'), 
                    'rating': float(item.get('avg_rating', 0)),
                    'image': item.get('image_url', "https://via.placeholder.com/150x225?text=No+Cover"),
                    'year': int(item.get('aired_from_year', 0)) if 'aired_from_year' in item else None,
                    'genre': item.get('genre', '')
                }
                
                # Ensure the image URL is valid
                if rec_item['image'] in ['Unknown', '', None]:
                    rec_item['image'] = "https://via.placeholder.com/150x225?text=No+Cover"
                    
                recommendations.append(rec_item)
            except Exception as e:
                print(f"Error processing anime: {e}")
                continue
        
        return {"recommendations": recommendations, "domain": domain}
    
    except Exception as e:
        print(f"Error in anime recommendation endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations/movies/")
async def get_movie_recommendations(request: RecommendationRequest):
    try:
        # Check if we have titles
        if not request.titles or len(request.titles) == 0:
            raise HTTPException(status_code=400, detail="No movie titles provided")
        
        # Force domain to be "movie" regardless of what was sent
        domain = "movie"
        df = app.movie_df
            
        # Filter the dataset based on user preferences
        filtered_df = filter_movie_dataset(df, request.mood, request.era, request.genre)
        
        # Build the model
        item_latent_matrix, knn, filtered_df = build_model(filtered_df, domain)
        
        # Get recommendations
        similar_items = find_similar_items(
            request.titles, 
            df,
            filtered_df, 
            item_latent_matrix, 
            knn, 
            domain,
            n_recommendations=5
        )
        
        # Convert results to a list of dictionaries
        recommendations = []
        for _, item in similar_items.iterrows():
            try:
                rec_item = {
                    'id': item.get('item_id', ''),
                    'title': item.get('title', 'Unknown Title'),
                    'type': item.get('titleType', 'movie') if 'titleType' in item else 'movie',
                    'rating': float(item.get('avg_rating', 0)),
                    'image': item.get('img', "https://via.placeholder.com/150x225?text=Movie+Poster"),
                    'year': int(item.get('year', 0)) if 'year' in item and pd.notna(item['year']) else None,
                    'genre': item.get('genre', '')
                }
                
                recommendations.append(rec_item)
            except Exception as e:
                print(f"Error processing movie/show: {e}")
                continue
        
        return {"recommendations": recommendations, "domain": domain}
    
    except Exception as e:
        print(f"Error in movie recommendation endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# You can keep the generic endpoint or remove it if you only want the specific ones
# If you want to keep it, make sure it calls the appropriate specific function based on domain:

@app.post("/recommendations/")
async def get_recommendations(request: RecommendationRequest):
    if request.domain == "anime":
        return await get_anime_recommendations(request)
    elif request.domain == "movie":
        return await get_movie_recommendations(request)
    else:
        return await get_book_recommendations(request)

def filter_movie_dataset(df, mood, era, genre):
    """Filter the movie dataset based on user-selected mood, era, and genre."""
    filtered_df = df.copy()
    
    # Step 1: Genre Filtering
    target_genres = []
    if genre and genre in movie_genre_mapping:
        target_genres.append(movie_genre_mapping[genre])
    
    if mood and mood in mood_to_movie_genres:
        target_genres.extend(mood_to_movie_genres[mood])
    
    target_genres = list(set(target_genres))  # Remove duplicates
    
    if target_genres:
        genre_filter = filtered_df['genre'].apply(
            lambda x: any(g in str(x).split(',') for g in target_genres) if pd.notna(x) else False
        )
        filtered_df = filtered_df[genre_filter]
    
    # Step 2: Era Filtering
    if era and era != 'any':
        if era in era_to_movie_years and era_to_movie_years[era]:
            start_year, end_year = era_to_movie_years[era]
            year_filter = (filtered_df['year'] >= start_year) & (filtered_df['year'] < end_year)
            filtered_df = filtered_df[year_filter]
    
    # If we filtered too aggressively, return a broader dataset
    print(len(filtered_df))
    if len(filtered_df) < 1:
        print(f"Warning: Too few movies match filters. Using broader dataset.")
        
        # Try just using the genre filter if era was specified
        if era and era != 'any' and target_genres:
            filtered_by_genre = df.copy()
            genre_filter = filtered_by_genre['genre'].apply(
                lambda x: any(g in str(x).split(',') for g in target_genres) if pd.notna(x) else False
            )
            filtered_by_genre = filtered_by_genre[genre_filter]
            
            if len(filtered_by_genre) >= 10:
                return filtered_by_genre
        
        # If still not enough, return most popular items
        return df.sort_values('num_votes', ascending=False).head(100)
    
    return filtered_df

@app.on_event("startup")
async def startup_movie_db():
    try:
        # Set base path for data files
        base_path = os.path.join(os.path.dirname(__file__), '')
        
        # Path to the original and processed movie data
        movie_raw_path = os.path.join(base_path, 'title.basics.tsv')
        movie_processed_path = os.path.join(base_path, 'movie_processed.csv')
        
        if os.path.exists(movie_processed_path):
            # Load preprocessed data if available
            app.movie_df = pd.read_csv(movie_processed_path)
            print(f"Loaded movie dataset with {len(app.movie_df)} records")
        elif os.path.exists(movie_raw_path):
            print(f"Processing raw movie/TV dataset from {movie_raw_path}...")
            # Process raw data if the processed file doesn't exist
            # Read only necessary columns to reduce memory usage
            cols_to_use = ['tconst', 'titleType', 'primaryTitle', 'startYear', 'genres', 'isAdult']
            
            # Read the TSV file in chunks to manage memory usage
            chunks = []
            for chunk in pd.read_csv(movie_raw_path, sep='\t', usecols=cols_to_use, 
                                    chunksize=100000, low_memory=False):
                # Filter out non-movies/TV shows and adult content
                filtered_chunk = chunk[(chunk['titleType'].isin(['movie', 'tvSeries', 'tvMiniSeries'])) & 
                                      (chunk['isAdult'] == 0)]
                chunks.append(filtered_chunk)
            
            # Combine all chunks
            movie_df = pd.concat(chunks, ignore_index=True)
            
            # Rename columns
            movie_df = movie_df.rename(columns={
                'tconst': 'item_id',
                'primaryTitle': 'title',
                'startYear': 'year',
                'genres': 'genre'
            })
            
            # Clean up the year field
            movie_df['year'] = pd.to_numeric(movie_df['year'], errors='coerce')
            movie_df = movie_df.dropna(subset=['year', 'genre'])
            movie_df = movie_df[movie_df['year'] != '\\N']
            movie_df['year'] = movie_df['year'].astype(float).astype('Int64')
            
            # Replace "\N" with NaN in genre
            movie_df['genre'] = movie_df['genre'].replace("\\N", np.nan)
            movie_df = movie_df.dropna(subset=['genre'])
            
            # Add placeholder ratings since title.basics doesn't have ratings
            movie_df['avg_rating'] = 7.0  # Placeholder rating
            movie_df['num_votes'] = 1000  # Placeholder votes
            
            # Generate placeholder image URLs
            movie_df['img'] = movie_df['item_id'].apply(
                lambda x: f"https://m.media-amazon.com/images/M/{x[2:]}._V1_SX300.jpg"
            )
            
            # Add domain and creator placeholder
            movie_df['domain'] = 'movie'
            movie_df['author'] = movie_df['titleType'].apply(lambda x: 'Director' if x == 'movie' else 'Creator')
            
            # Select final columns and save processed file
            movie_df = movie_df[['item_id', 'title', 'titleType', 'author', 'genre', 'year', 
                               'avg_rating', 'num_votes', 'domain', 'img']]
            
            # Save sampled data for faster loading next time
            if len(movie_df) > 100000:
                # If dataset is very large, sample it
                movie_df = movie_df.sample(n=100000, random_state=42)
            
            movie_df.to_csv(movie_processed_path, index=False)
            app.movie_df = movie_df
            
            print(f"Processed and loaded movie dataset with {len(app.movie_df)} records")
        else:
            print(f"Movie dataset not found at {movie_raw_path}")
            # Create a small sample dataset if the real data can't be loaded
            app.movie_df = pd.DataFrame({
                'item_id': ['tt0111161', 'tt0068646', 'tt0071562', 'tt0468569', 'tt0050083'],
                'title': ['The Shawshank Redemption', 'The Godfather', 'The Godfather: Part II', 'The Dark Knight', '12 Angry Men'],
                'titleType': ['movie', 'movie', 'movie', 'movie', 'movie'],
                'author': ['Director', 'Director', 'Director', 'Director', 'Director'],
                'genre': ['Drama', 'Crime,Drama', 'Crime,Drama', 'Action,Crime,Drama', 'Crime,Drama'],
                'year': [1994, 1972, 1974, 2008, 1957],
                'avg_rating': [9.3, 9.2, 9.0, 9.0, 8.9],
                'num_votes': [2400000, 1700000, 1200000, 2500000, 700000],
                'domain': ['movie', 'movie', 'movie', 'movie', 'movie'],
                'img': ['https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', 
                       'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
                       'https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
                       'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
                       'https://m.media-amazon.com/images/M/MV5BMWU4N2FjNzYtNTVkNC00NzQ0LTg0MjAtYTJlMjFhNGUxZDFmXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg']
            })

    except Exception as e:
        print(f"Error loading movie dataset: {e}")
        # Create placeholder data if an error occurs
        app.movie_df = pd.DataFrame({
            'item_id': ['tt0111161', 'tt0068646'],
            'title': ['The Shawshank Redemption', 'The Godfather'],
            'titleType': ['movie', 'movie'],
            'author': ['Director', 'Director'],
            'genre': ['Drama', 'Crime,Drama'],
            'year': [1994, 1972],
            'avg_rating': [9.3, 9.2],
            'num_votes': [2400000, 1700000],
            'domain': ['movie', 'movie'],
            'img': ['https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
                   'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg']
        })

def filter_movie_dataset(df, mood, era, genre):
    """Filter the movie dataset based on user-selected mood, era, and genre."""
    filtered_df = df.copy()
    
    # Step 1: Genre Filtering
    target_genres = []
    if genre and genre in movie_genre_mapping:
        target_genres.append(movie_genre_mapping[genre])
    
    if mood and mood in mood_to_movie_genres:
        target_genres.extend(mood_to_movie_genres[mood])
    
    target_genres = list(set(target_genres))  # Remove duplicates
    
    if target_genres:
        genre_filter = filtered_df['genre'].apply(
            lambda x: any(g in str(x).split(',') for g in target_genres) if pd.notna(x) else False
        )
        filtered_df = filtered_df[genre_filter]
    
    # Step 2: Era Filtering
    if era and era != 'any':
        if era in era_to_movie_years and era_to_movie_years[era]:
            start_year, end_year = era_to_movie_years[era]
            year_filter = (filtered_df['year'] >= start_year) & (filtered_df['year'] < end_year)
            filtered_df = filtered_df[year_filter]
    
    # If we filtered too aggressively, return a broader dataset
    print(len(filtered_df))
    if len(filtered_df) < 1:
        print(f"Warning: Too few movies match filters. Using broader dataset.")
        
        # Try just using the genre filter if era was specified
        if era and era != 'any' and target_genres:
            filtered_by_genre = df.copy()
            genre_filter = filtered_by_genre['genre'].apply(
                lambda x: any(g in str(x).split(',') for g in target_genres) if pd.notna(x) else False
            )
            filtered_by_genre = filtered_by_genre[genre_filter]
            
            if len(filtered_by_genre) >= 10:
                return filtered_by_genre
        
        # If still not enough, return most popular items
        return df.sort_values('num_votes', ascending=False).head(100)
    
    return filtered_df

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)