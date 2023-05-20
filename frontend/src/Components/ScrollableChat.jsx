import React, { useEffect, useRef } from 'react'
import ScrollableFeed from 'react-scrollable-feed';
import { ChatState } from '../Context/ChatProvider';
import { Avatar } from '@mui/material';

import './ScrollableChat.scss';

import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const ScrollableChat = ({ messages, showLottie }) => {
  const { user } = ChatState();

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView()
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, showLottie]);

  return (
    <>
      <ScrollableFeed forceScroll>
        {messages && messages.map((m, i) => {
          return (
            <>
              {(displayDate(messages, i)) && (
                <div className="date-divider">{formatDate(messages[i].createdAt)}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center' }} key={m._id}>
                {((isNextMessageByMe(messages, i, user._id)) || isFinalMessage(messages, i, user._id)) && (
                  <Avatar sx={{ width: 40, height: 40 }} alt={m.sender.name} src={m.sender.pic} />
                )}
                <span
                  style={{
                    backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}`,
                    borderRadius: '20px',
                    padding: '5px 15px',
                    maxWidth: '75%',
                    marginLeft: calculateLeftMargin(messages, i, user._id),
                    marginRight: 'auto',
                    marginTop: 3,
                    marginBottom: 3,
                    marginRight: '5px',
                    whiteSpace: 'pre-line',
                    overflowWrap: 'break-word'
                  }}
                >
                  {m.content}
                </span>
              </div>
            </>
          );
        })}
        {showLottie ? <Lottie
          options={defaultOptions}
          height={40}
          width={70}
          style={{
            marginRight: '5px',
            marginLeft: '10px'
          }}
        /> : <></>}
        <div ref={messagesEndRef} />
      </ScrollableFeed>
    </>
  )
}

export const formatDate = (timestamp) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = new Date(timestamp);
  return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`
}

const displayDate = (messages, i) => {
  if (i === 0) return true;
  const currentMessageDate = new Date(messages[i].createdAt);
  const previousMessageDate = new Date(messages[i - 1].createdAt);
  if (currentMessageDate.getDate() !== previousMessageDate.getDate() || currentMessageDate.getMonth() !== previousMessageDate.getMonth() || currentMessageDate.getFullYear() !== previousMessageDate.getFullYear()) {
    return true;
  }
}

const calculateLeftMargin = (messages, i, userId) => {
  if ( // other user, no avatar
    i < messages.length - 1 &&
    messages[i + 1].sender._id === messages[i].sender._id &&
    messages[i].sender._id !== userId
  ) { 
    return 40;
  } 
  
  if ( // other user, with avatar
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== messages[i].sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  ) {
    return 0;
  }
  
  // same user
  return "auto";
};

const isNextMessageByMe = (messages, i, userId) => {
  // check if next message is from a different user and the current message is not from the logged user
  // or if it's the last message and not from logged user
  // in order to display avatar
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== messages[i].sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

const isFinalMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId
  );
};

export default ScrollableChat