import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import MovieCard from '../components/MovieCard';

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [trailerLoaded, setTrailerLoaded] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        // Fetch movie details
        const movieResponse = await fetch(
          `${API_BASE_URL}/movie/${id}?language=en-US`,
          API_OPTIONS
        );
        const movieData = await movieResponse.json();
        setMovie(movieData);

        // Fetch videos/trailers
        const videosResponse = await fetch(
          `${API_BASE_URL}/movie/${id}/videos?language=en-US`,
          API_OPTIONS
        );
        const videosData = await videosResponse.json();
        
        const trailerVideo = videosData.results?.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        ) || videosData.results?.find(
          video => video.type === 'Teaser' && video.site === 'YouTube'
        );
        
        setTrailer(trailerVideo);

        // Fetch cast
        const creditsResponse = await fetch(
          `${API_BASE_URL}/movie/${id}/credits`,
          API_OPTIONS
        );
        const creditsData = await creditsResponse.json();
        setCast(creditsData.cast?.slice(0, 6) || []);

        // Fetch similar movies
        const similarResponse = await fetch(
          `${API_BASE_URL}/movie/${id}/similar`,
          API_OPTIONS
        );
        const similarData = await similarResponse.json();
        const animeMovies = similarData.results?.filter(m => 
          m.genre_ids?.includes(16) && m.original_language === 'ja'
        ).slice(0, 4) || [];
        setSimilarMovies(animeMovies);

        // Check if in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.some(fav => fav.id === parseInt(id)));
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const newFavorites = favorites.filter(fav => fav.id !== movie.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      favorites.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        original_language: movie.original_language
      });
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  const shareMovie = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Check out ${movie.title}!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <Spinner />
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-white text-xl">Movie not found</p>
      </main>
    );
  }

  return (
    <main>
      <div className='pattern' />
      
      {/* Movie Backdrop with Trailer */}
      {trailer ? (
        <div className="movie-backdrop video-backdrop">
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&showinfo=0&modestbranding=1&rel=0&start=30`}
            title="Movie Backdrop"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className={`backdrop-video ${trailerLoaded ? 'loaded' : ''}`}
            onLoad={() => setTrailerLoaded(true)}
          />
          <div className="backdrop-overlay" />
        </div>
      ) : movie.backdrop_path ? (
        <div 
          className="movie-backdrop"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
          }}
        />
      ) : null}
      
      <div className='wrapper'>
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-white hover:text-gradient transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="movie-details">
          <div className="movie-details-header">
            <img
              src={movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                : '/no-movie.png'}
              alt={movie.title}
              className="movie-details-poster"
            />
            
            <div className="movie-details-info">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className="action-button"
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={shareMovie}
                    className="action-button"
                    title="Share"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="rating-badge">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className="text-gray-100">{movie.release_date?.split('-')[0]}</span>
                <span className="text-gray-100">{movie.runtime} min</span>
              </div>

              <div className="flex gap-2 mb-6 flex-wrap">
                {movie.genres?.map(genre => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-light-200 text-lg leading-relaxed mb-6">
                {movie.overview}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-100">Original Language:</span>
                  <span className="text-white ml-2">{movie.original_language?.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-gray-100">Budget:</span>
                  <span className="text-white ml-2">
                    ${movie.budget?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-100">Revenue:</span>
                  <span className="text-white ml-2">
                    ${movie.revenue?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-100">Status:</span>
                  <span className="text-white ml-2">{movie.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cast Section */}
          {cast.length > 0 && (
            <div className="movie-section">
              <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
              <div className="cast-grid">
                {cast.map(person => (
                  <div key={person.id} className="cast-card">
                    <img
                      src={person.profile_path 
                        ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                        : '/no-avatar.png'}
                      alt={person.name}
                    />
                    <div className="cast-info">
                      <h4>{person.name}</h4>
                      <p>{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trailer Section */}
          {trailer && (
            <div className="movie-trailer">
              <h2 className="text-3xl font-bold text-white mb-6">Trailer</h2>
              <div className="trailer-container">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title="Movie Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Similar Movies Section */}
          {similarMovies.length > 0 && (
            <div className="movie-section">
              <h2 className="text-3xl font-bold text-white mb-6">Similar Anime</h2>
              <div className="similar-grid">
                {similarMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MovieDetails;
