import { useState } from "react";

const useSearchAndSort = (initialSort = "created_at") => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState(initialSort);

    return { searchQuery, setSearchQuery, sortBy, setSortBy };
};

export default useSearchAndSort;
