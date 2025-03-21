import React from "react";
import { Typography } from "@mui/material";

interface TimestampProps {
    date: string; // Pass the timestamp as a string
}

const Timestamp: React.FC<TimestampProps> = ({ date }) => {
    const getRelativeTime = (timestamp: string) => {
        const now = new Date(); 
        const targetDate = new Date(timestamp); 

        // const timezoneOffsetInSeconds = now.getTimezoneOffset() * 60;
        // const nowUTCInSeconds = Math.floor(now.getTime() / 1000) - timezoneOffsetInSeconds;
        // Not sure about my computer's local time, but I need this set of code to sync my time
        
        const nowUTCInSeconds = Math.floor(now.getTime() / 1000);
        const diffInSeconds = nowUTCInSeconds - Math.floor(targetDate.getTime() / 1000);

        const thresholds = {
            year: 60 * 60 * 24 * 365,
            month: 60 * 60 * 24 * 30,
            day: 60 * 60 * 24,
            hour: 60 * 60,
            minute: 60,
            second: 1,
        };

        for (const [unit, secondsInUnit] of Object.entries(thresholds)) {
            const delta = Math.floor(diffInSeconds / secondsInUnit);
            if (delta >= 1) {
                const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
                return rtf.format(-delta, unit as Intl.RelativeTimeFormatUnit);
            }
        }

        return "just now";
    };

    return (
        <Typography variant="caption" color="text.primary">
            {getRelativeTime(date)}
        </Typography>
    );
};

export default Timestamp;
