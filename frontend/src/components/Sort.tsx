import React from "react";

interface SortProps {
  sortBy: string;
  setSortBy: (field: string) => void;
}

const Sort: React.FC<SortProps> = ({ sortBy, setSortBy }) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy); // Update the state in parent, triggering the fetch there
  };

  return (
    <div>
      <label htmlFor="sortSelect">Sort by:</label>
      <select
        id="sortSelect"
        onChange={handleSortChange}
        value={sortBy}
        style={{ marginLeft: "8px" }}
      >
        <option value="created_at">Most Recent</option>
        <option value="likes">Most Liked</option>
        <option value="dislikes">Most Disliked</option>
        <option value="comments">Most Commented</option>
      </select>
    </div>
  );
};

export default Sort;


