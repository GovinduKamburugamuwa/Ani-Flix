import React, { use } from 'react'
import Search from './components/Search'
import MovieCard from './components/MovieCard'
import { useEffect, useState } from 'react'
import Spinner from './components/Spinner';
import { useDebounce } from 'react-use';
import { updateSearchCount, getTrendingMovies } from './appwrite';
import FilterSort from './components/FilterSort';
import ScrollToTop from './components/ScrollToTop';

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieListed, setMovieListed] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [minRating, setMinRating] = useState('0');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let endpoint;
      
      if (query) {
        endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`;
      } else {
        endpoint = `${API_BASE_URL}/discover/movie?with_genres=16&with_original_language=ja&sort_by=${sortBy}&vote_average.gte=${minRating}`;
      }

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch anime');
      }
      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || 'An error occurred while fetching anime.');
        setMovieListed([]);
        return;
      }
      
      let results = data.results || [];
      
      // Filter search results to only show anime (Animation genre + Japanese language)
      if (query) {
        results = results.filter(movie => 
          movie.genre_ids?.includes(16) && movie.original_language === 'ja'
        );
      }
      
      setMovieListed(results);

      if (query && results.length > 0) {
        await updateSearchCount(query, results[0]);
      }
      console.log(data);
    } catch (error) {
      console.error("Error fetching anime:", error);
      setErrorMessage('An error occurred while fetching anime.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    if (!showFavorites) {
      fetchMovies(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, sortBy, minRating, showFavorites]);

  const displayMovies = showFavorites ? favorites : movieListed;

  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Discover <span className='text-gradient'>Anime</span> Movies You'll Love</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Anime</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2>
              {showFavorites ? 'My Favorites' : 'Popular Anime Movies'}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="favorites-toggle"
              >
                <svg className="w-5 h-5" fill={showFavorites ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites ({favorites.length})
              </button>
            </div>
          </div>

          {!showFavorites && !searchTerm && (
            <FilterSort
              sortBy={sortBy}
              setSortBy={setSortBy}
              minRating={minRating}
              setMinRating={setMinRating}
            />
          )}

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : displayMovies.length === 0 ? (
            <p className="text-gray-100 text-center py-12">
              {showFavorites ? 'No favorites yet. Start adding some!' : 'No anime movies found.'}
            </p>
          ) : (
            <ul>
              {displayMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <ScrollToTop />
    </main>
  )
}

export default App;