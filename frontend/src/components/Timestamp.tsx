import React from "react";

interface TimestampProps {
  date: string; // Pass the timestamp as a string
}

const Timestamp: React.FC<TimestampProps> = ({ date }) => {
  const formattedDate = new Date(date).toLocaleString(); // Format the date

  return <span>{formattedDate}</span>;
};

export default Timestamp;
