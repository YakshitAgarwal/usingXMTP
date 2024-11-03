import React, { useState, useCallback, useRef, useEffect } from "react";
import { MessageInput } from "./MessageInput";
import {
  useMessages,
  useSendMessage,
  useStreamMessages,
  useClient,
} from "@xmtp/react-sdk";
import MessageItem from "./MessageItem";

export const MessageContainer = ({
  conversation,
  isPWA = false,
  isContained = false,
}) => {
  const messagesEndRef = useRef(null);
  const { client } = useClient();
  const { messages, isLoading } = useMessages(conversation);
  const [sending, setSending] = useState(false);

  const styles = {
    messagesContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
      fontSize: isPWA ? "1.2em" : ".9em",
    },
    loadingText: {
      textAlign: "center",
    },
    messagesList: {
      paddingLeft: "5px",
      paddingRight: "5px",
      margin: "0px",
      alignItems: "flex-start",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
    },
  };

  const onMessage = useCallback((message) => {}, []);

  useStreamMessages(conversation, { onMessage });

  const { sendMessage } = useSendMessage();

  useEffect(() => {
    if (!isContained) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isContained]);

  const handleSendMessage = async (newMessage) => {
    if (!newMessage.trim()) {
      alert("Empty message");
      return;
    }
    if (conversation && conversation.peerAddress) {
      setSending(true);
      try {
        await sendMessage(conversation, newMessage);
      } catch (error) {
        alert("Failed to send message: " + error.message);
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <div style={styles.messagesContainer}>
      {isLoading ? (
        <small style={styles.loadingText}>Loading messages...</small>
      ) : (
        <>
          <ul style={styles.messagesList}>
            {messages.map((message) => (
              <MessageItem
                isPWA={isPWA}
                key={message.id}
                message={message}
                senderAddress={message.senderAddress}
                client={client}
              />
            ))}
            <div ref={messagesEndRef} />
          </ul>
          <MessageInput
            isPWA={isPWA}
            onSendMessage={(msg) => handleSendMessage(msg)}
            disabled={sending}
          />
        </>
      )}
    </div>
  );
};
