import { useState, useEffect } from "react";

const useNotification = (duration: number = 3000) => {
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), duration);
            return () => clearTimeout(timer);
        }
    }, [notification, duration]);

    return { notification, setNotification };
};

export default useNotification;
