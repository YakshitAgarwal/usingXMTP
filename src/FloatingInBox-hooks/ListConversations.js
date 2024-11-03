import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useConversations,
  useStreamConversations,
  useClient,
} from "@xmtp/react-sdk";

export const ListConversations = ({
  searchTerm,
  selectConversation,
  onConversationFound,
  isPWA = false,
  isConsent = false,
}) => {
  const { client } = useClient();
  const { conversations, error } = useConversations();
  const [streamedConversations, setStreamedConversations] = useState([]);

  const styles = {
    conversationListItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      margin: "0px",
      borderBottom: "1px solid #e0e0e0",
      cursor: "pointer",
      backgroundColor: "#f0f0f0",
      transition: "background-color 0.3s ease",
      padding: isPWA ? "15px" : "10px",
    },
    conversationDetails: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: "75%",
      marginLeft: isPWA ? "15px" : "10px",
      overflow: "hidden",
    },
    conversationName: {
      fontSize: isPWA ? "20px" : "16px",
      fontWeight: "bold",
    },
    messagePreview: {
      fontSize: isPWA ? "18px" : "14px",
      color: "#666",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    conversationTimestamp: {
      fontSize: isPWA ? "16px" : "12px",
      color: "#999",
      width: "25%",
      textAlign: "right",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const isMatchingSearchTerm = conversation?.peerAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const isNotSelf = conversation?.peerAddress !== client.address;
      return isMatchingSearchTerm && isNotSelf;
    });
  }, [conversations, searchTerm, client.address]);

  useEffect(() => {
    if (filteredConversations.length > 0) {
      onConversationFound(true);
    } else {
      onConversationFound(false);
    }
  }, [filteredConversations, onConversationFound]);

  const onConversation = useCallback((conversation) => {
    setStreamedConversations((prev) => [...prev, conversation]);
  }, []);

  useStreamConversations(onConversation);

  if (error) {
    return (
      <div style={{ color: "red" }}>
        Error fetching conversations: {error.message}
      </div>
    );
  }

  return (
    <>
      {filteredConversations.map((conversation) => (
        <li
          key={conversation.id}
          style={styles.conversationListItem}
          onClick={() => selectConversation(conversation)}
        >
          <div style={styles.conversationDetails}>
            <span style={styles.conversationName}>
              {conversation.peerAddress.substring(0, 6) +
                "..." +
                conversation.peerAddress.substring(
                  conversation.peerAddress.length - 4
                )}
            </span>
            <span style={styles.messagePreview}>...</span>
          </div>
          <div style={styles.conversationTimestamp}>
            {getRelativeTimeLabel(conversation.createdAt)}
          </div>
        </li>
      ))}
    </>
  );
};

const getRelativeTimeLabel = (dateString) => {
  const diff = new Date() - new Date(dateString);
  const diffMinutes = Math.floor(diff / 1000 / 60);
  const diffHours = Math.floor(diff / 1000 / 60 / 60);
  const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);
  const diffWeeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);

  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
};
