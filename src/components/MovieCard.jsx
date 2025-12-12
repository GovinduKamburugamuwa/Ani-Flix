import React from 'react'
import { useNavigate } from 'react-router-dom'

const MovieCard = ({ movie:
  { id, title, vote_average, poster_path, release_date, original_language }
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${id}`);
  };

  return (
    <div className="movie-card group" onClick={handleClick}>
      <div className="movie-card-image">
        <img
          src={poster_path ?
            `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
          alt={title}
        />
        <div className="movie-card-overlay">
          <div className="rating-badge">
            <img src="star.svg" alt="Star Icon" />
            <span>{vote_average ? vote_average.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="movie-card-content">
        <h3>{title}</h3>

        <div className="movie-card-meta">
          <span className="lang">{original_language.toUpperCase()}</span>
          <span className="separator">•</span>
          <span className="year">
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}
export default MovieCard