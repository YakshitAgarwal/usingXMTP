import React from "react";
import { FloatingInbox } from "./FloatingInBox-hooks";

const InboxPage = () => {
  return <FloatingInbox env={process.env.REACT_APP_XMTP_ENV} isPWA={true} />;
};

export default InboxPage;
