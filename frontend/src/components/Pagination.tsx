import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  fetchThreads: (searchQuery: string, pageNumber: number, sortOrder: string) => void;
  searchQuery: string;
  sortOrder: string;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, fetchThreads, searchQuery, sortOrder, setPage }) => {
  const nextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setPage(nextPage);
      fetchThreads(searchQuery, nextPage, sortOrder);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setPage(prevPage);
      fetchThreads(searchQuery, prevPage, sortOrder);
    }
  };

  return (
    <div>
      <button onClick={prevPage} disabled={currentPage <= 1}>
        Previous
      </button>
      <span>
        {" "}
        Page {currentPage} of {totalPages}{" "}
      </span>
      <button onClick={nextPage} disabled={currentPage >= totalPages}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
