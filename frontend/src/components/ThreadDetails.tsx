import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Comments from "./Comments";
import LikesDislikes from "./LikesDislikes";
import Timestamp from "./Timestamp";

const ThreadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [thread, setThread] = useState<{ title: string; content: string; created_at: string } | null>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/threads/${id}`)
      .then((response) => setThread(response.data))
      .catch((error) => console.error("Failed to fetch thread details:", error));
  }, [id]);

  if (!thread) return <p>Loading thread...</p>;

  return (
    <div>
      <h1>{thread.title}</h1>
      <p>{thread.content}</p>
      <small> 
        Posted on: <Timestamp date={thread.created_at} />
      </small>
      <LikesDislikes threadId={parseInt(id || "0", 10)} />
      <Comments threadId={parseInt(id || "0", 10)} />
    </div>
  );
};

export default ThreadDetails;
