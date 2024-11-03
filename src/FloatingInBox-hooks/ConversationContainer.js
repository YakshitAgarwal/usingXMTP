import React, { useState, useCallback } from "react";
import { MessageContainer } from "./MessageContainer";
import { useCanMessage, useClient } from "@xmtp/react-sdk";
import { ListConversations } from "./ListConversations";
import { ethers } from "ethers";
import { NewConversation } from "./NewConversation";

export const ConversationContainer = ({
  selectedConversation,
  setSelectedConversation,
  isPWA = false,
  isConsent = false,
  isContained = false,
}) => {
  const { client } = useClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [peerAddress, setPeerAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const { canMessage } = useCanMessage();
  const [createNew, setCreateNew] = useState(false);
  const [conversationFound, setConversationFound] = useState(false);

  const styles = {
    conversations: {
      height: "100%",
      fontSize: isPWA ? "1.2em" : ".9em",
    },
    conversationList: {
      overflowY: "auto",
      padding: "0px",
      margin: "0",
      listStyle: "none",
    },
    smallLabel: {
      fontSize: isPWA ? "1.5em" : ".9em",
    },
    createNewButton: {
      border: "1px",
      padding: "5px",
      borderRadius: "5px",
      marginTop: "10px",
      fontSize: isPWA ? "1.2em" : ".9em",
    },
    peerAddressInput: {
      width: "100%",
      padding: "10px",
      boxSizing: "border-box",
      border: "0px solid #ccc",
      fontSize: isPWA ? "1em" : ".9em",
      outline: "none",
    },
  };

  const isValidEthereumAddress = (address) =>
    /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleSearchChange = useCallback(
    async (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      setMessage("Searching...");
      setCreateNew(false);
      setConversationFound(false);

      const isEthDomain = /\.eth$/.test(value);
      let resolvedAddress = value;

      if (isEthDomain) {
        setLoadingResolve(true);
        try {
          const provider = new ethers.providers.CloudflareProvider();
          resolvedAddress = await provider.resolveName(value);
        } catch (error) {
          console.error(error);
          setMessage("Error resolving address");
        } finally {
          setLoadingResolve(false);
        }
      }

      if (resolvedAddress && isValidEthereumAddress(resolvedAddress)) {
        processEthereumAddress(resolvedAddress);
      } else {
        setMessage("Invalid Ethereum address");
        setPeerAddress(null);
        setCreateNew(false);
      }
    },
    [client]
  );

  const processEthereumAddress = async (address) => {
    setPeerAddress(address);
    if (address === client.address) {
      setMessage("No self-messaging allowed");
      setCreateNew(false);
      return;
    }

    const canMessageStatus = await client.canMessage(address);
    if (canMessageStatus) {
      setMessage("Address is on the network ✅");
      setCreateNew(true);
    } else {
      setMessage("Address is not on the network ❌");
      setCreateNew(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", fontSize: "small" }}>Loading...</div>
    );
  }

  return (
    <div style={styles.conversations}>
      {!selectedConversation && (
        <ul style={styles.conversationList}>
          <input
            type="text"
            placeholder="Enter a 0x wallet or ENS address"
            value={searchTerm}
            onChange={handleSearchChange}
            style={styles.peerAddressInput}
            aria-label="Search for a conversation"
          />
          {loadingResolve && searchTerm && <small>Resolving address...</small>}
          <ListConversations
            isPWA={isPWA}
            isConsent={isConsent}
            searchTerm={searchTerm}
            selectConversation={setSelectedConversation}
            onConversationFound={(state) => {
              setConversationFound(state);
              if (state) setCreateNew(false);
            }}
          />
          {message && !conversationFound && <small>{message}</small>}
          {peerAddress && createNew && canMessage && (
            <button
              style={styles.createNewButton}
              onClick={() => setSelectedConversation({ messages: [] })}
              aria-label="Create new conversation"
            >
              Create new conversation
            </button>
          )}
        </ul>
      )}
      {selectedConversation && (
        <>
          {selectedConversation.id ? (
            <MessageContainer
              isPWA={isPWA}
              isContained={isContained}
              conversation={selectedConversation}
            />
          ) : (
            <NewConversation
              isPWA={isPWA}
              selectConversation={setSelectedConversation}
              peerAddress={peerAddress}
            />
          )}
        </>
      )}
    </div>
  );
};
