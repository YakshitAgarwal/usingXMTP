import React, { useState, useEffect, useRef } from "react";

export const MessageInput = ({
  onSendMessage,
  replyingToMessage,
  isPWA = false,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef(null);

  const styles = {
    newMessageContainer: {
      display: "flex",
      alignItems: "center",
      padding: "10px",
      flexWrap: "wrap",
    },
    messageInputField: {
      flexGrow: 1,
      padding: "5px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: isPWA ? "1.2em" : ".9em",
      outline: "none",
    },
    sendButton: {
      padding: "5px 10px",
      marginLeft: "5px",
      border: "1px solid #ccc",
      cursor: "pointer",
      borderRadius: "5px",
      fontSize: isPWA ? "1.0em" : ".6em",
    },
  };

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && newMessage.trim()) {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div style={styles.newMessageContainer}>
      {replyingToMessage && (
        <div style={{ marginRight: "10px", color: "#888" }}>
          Replying to: {replyingToMessage.content}
        </div>
      )}
      <input
        ref={inputRef}
        style={styles.messageInputField}
        type="text"
        value={newMessage}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <button
        style={styles.sendButton}
        onClick={handleSendMessage}
        disabled={!newMessage.trim()}
      >
        Send
      </button>
    </div>
  );
};
