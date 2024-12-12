import React from "react";

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchThreads: (search: string, page: number, sort: string) => void;
  sortOrder: string;
}

const Search: React.FC<SearchProps> = ({ searchQuery, setSearchQuery, fetchThreads, sortOrder }) => {
  const handleSearch = () => {
    fetchThreads(searchQuery, 1, sortOrder);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search threads"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default Search;
