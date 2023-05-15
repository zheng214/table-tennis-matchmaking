import React from 'react'
import ScrollableFeed from 'react-scrollable-feed';
import { ChatState } from '../Context/ChatProvider';
import { Avatar } from '@mui/material';

import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import './ScrollableChat.scss'

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
  return (
    <>
      <ScrollableFeed className="scrollable-chat">
        {messages && messages.map((m, i) => {
          return (
            <div className="scrollable-chat" style={{ display: 'flex', alignItems: 'center' }} key={m._id}>
              {((isLastMessageOther(messages, i, user._id)) || isFinalMessage(messages, i, user._id)) && (
                <Avatar sx={{ width: 40, height: 40 }} alt={m.sender.name} src={m.sender.pic} />
              )}
              <span
                style={{
                  backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}`,
                  borderRadius: '20px',
                  padding: '5px 15px',
                  maxWidth: '75%',
                  marginLeft: calculateLeftMargin(messages, i, user._id),
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
          );
        })}
        <div>
          {showLottie ? <Lottie
            options={defaultOptions}
            height={40}
            width={70}
            style={{
              marginRight: '5px',
              marginLeft: '10px'
            }}
          /> : <></>}
        </div>
      </ScrollableFeed>
    </>
  )
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

const isLastMessageOther = (messages, i, userId) => {
  // check if next message is from a different user and the current message is not from the logged user
  // or if it's the last message and not from logged user
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