import React, { useCallback, useState } from "react";
import { MessageInput } from "./MessageInput";
import { useStartConversation } from "@xmtp/react-sdk";

export const NewConversation = ({ selectConversation, peerAddress }) => {
  const { startConversation } = useStartConversation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const styles = {
    messagesContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      height: "100%",
    },
    errorMessage: {
      color: "red",
      margin: "5px 0",
      fontSize: "12px",
    },
  };

  const handleSendMessage = useCallback(
    async (message) => {
      if (!message.trim()) {
        setError("Empty message");
        return;
      }
      if (!peerAddress) {
        setError("No peer address provided");
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const newConversation = await startConversation(peerAddress, message);
        selectConversation(newConversation?.cachedConversation);
      } catch (error) {
        console.error("Error starting conversation:", error);
        setError("Failed to start conversation. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [peerAddress, startConversation, selectConversation]
  );

  return (
    <div style={styles.messagesContainer}>
      {error && <div style={styles.errorMessage}>{error}</div>}
      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
};
