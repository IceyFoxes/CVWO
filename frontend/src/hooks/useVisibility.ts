import { useState } from "react";

const useVisibility = (initialState: boolean = false) => {
    const [isVisible, setIsVisible] = useState(initialState);

    const show = () => setIsVisible(true);
    const hide = () => setIsVisible(false);
    const toggle = () => setIsVisible((prev) => !prev);

    return { isVisible, show, hide, toggle };
};

export default useVisibility;
