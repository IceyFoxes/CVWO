import React from "react";

interface SortProps {
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  fetchThreads: (search: string, page: number, sortBy: string, sortOrder: string) => void;
  searchQuery: string;
  page: number;
}

const Sort: React.FC<SortProps> = ({ sortBy, setSortBy, sortOrder, setSortOrder, fetchThreads, searchQuery, page }) => {
  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    fetchThreads(searchQuery, page, newSortBy, sortOrder);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);
    fetchThreads(searchQuery, page, sortBy, newSortOrder);
  };

  return (
    <div>
      {/* Sort Field Dropdown */}
      <select onChange={handleSortFieldChange} value={sortBy}>
        <option value="created_at">Sort by Time</option>
        <option value="likes_count">Sort by Likes</option>
        <option value="title">Sort by Title</option>
      </select>

      {/* Sort Order Dropdown */}
      <select onChange={handleSortOrderChange} value={sortOrder}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
};

export default Sort;
