import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  fetchThreads?: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, setPage, fetchThreads }) => {
  const nextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setPage(nextPage);
      fetchThreads?.(nextPage); // Optional chaining to call fetchThreads if provided
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setPage(prevPage);
      fetchThreads?.(prevPage); // Optional chaining to call fetchThreads if provided
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
