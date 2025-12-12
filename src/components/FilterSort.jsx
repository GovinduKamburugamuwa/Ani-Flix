import React from 'react';

const FilterSort = ({ sortBy, setSortBy, minRating, setMinRating }) => {
  return (
    <div className="filter-sort">
      <div className="filter-group">
        <label>Sort By:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="popularity.desc">Most Popular</option>
          <option value="vote_average.desc">Highest Rated</option>
          <option value="release_date.desc">Newest First</option>
          <option value="release_date.asc">Oldest First</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Min Rating:</label>
        <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
          <option value="0">All Ratings</option>
          <option value="7">7+ Stars</option>
          <option value="8">8+ Stars</option>
          <option value="9">9+ Stars</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSort;
