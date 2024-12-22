import React from "react";

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Search: React.FC<SearchProps> = ({ searchQuery, setSearchQuery }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); // Updates the search query in the parent state
  };

  return (
    <div>
      <label htmlFor="searchInput">Search:</label>
      <input
        id="searchInput"
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Search;

