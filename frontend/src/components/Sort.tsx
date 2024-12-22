import React from "react";

interface SortProps {
  sortBy: string;
  setSortBy: (field: string) => void;
  excludedOptions?: string[]; // List of options to exclude
}

const Sort: React.FC<SortProps> = ({ sortBy, setSortBy, excludedOptions = [] }) => {
  const options = [
    { value: "created_at", label: "Most Recent" },
    { value: "likes", label: "Most Liked" },
    { value: "dislikes", label: "Most Disliked" },
    { value: "comments", label: "Most Commented" },
  ];

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
        {options
          .filter(option => !excludedOptions.includes(option.value)) // Exclude unwanted options
          .map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
    </div>
  );
};

export default Sort;


