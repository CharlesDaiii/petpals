import React, { useState, useEffect, useRef } from "react";
import "../styles/Friends.css";
import getCSRFToken from "./getCSRFToken";
import { useOutletContext } from "react-router-dom";
import { useParams } from "react-router-dom";

function Chat() {
  const { rooms,username, isLogin } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [pendingMessage, setPendingMessage] = useState("");
  const { id } = useParams();
  // 用于滚动到底部
  const bottomRef = useRef(null);
  const messagesWrapRef = useRef(null);
  
  const room = rooms.find(r => String(r.id) === id);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat/conversations/${id}/messages`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
      }
    } finally {
      setTimeout(scrollToBottom, 0);
    }
  };

  const handleSendMessage = async () => {
    const text = pendingMessage.trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      text,
      sender_name: username || "me",
      created_at: new Date().toISOString(),
      __optimistic: true,
    }]);
    setPendingMessage("");

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat/conversations/${id}/messages/send/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': await getCSRFToken(),
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Send failed: ${response.status}`);
      }

      // 以服务端返回为准刷新
      await fetchMessages();
    } catch (e) {
      // 如果失败，移除乐观消息并恢复输入
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setPendingMessage(text);
      console.error(e);
    } finally {
      setTimeout(scrollToBottom, 0);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-wrapper">
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-room-name">
              {room && room.participants && room.participants.length > 1 ? room.participants[1].username : "Loading…"}
            </div>
            {isLogin ? <div className="chat-me">👤 {username}</div> : <div className="chat-me muted">Not logged in</div>}
          </div>

          <div className="messages-wrap" ref={messagesWrapRef}>
            {messages.length === 0 ? (
              <div className="empty muted">Let's Chat～</div>
            ) : (
              <ul className="messages">
                {messages.map((m) => {
                  const isMine = username && (m.sender_name === username);
                  return (
                    <li key={m.id} className={`message-row ${isMine ? "mine" : "other"}`}>
                      {!isMine && (
                        <div className="avatar">{(m.sender_name || "U").slice(0, 1).toUpperCase()}</div>
                      )}
                      <div className="bubble">
                        {!isMine && <div className="meta">{m.sender_name || "anonymous"}</div>}
                        <div className="text">{m.text}</div>
                        {m.created_at && (
                          <div className="time">{new Date(m.created_at).toLocaleTimeString()}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
                <div ref={bottomRef} />
              </ul>
            )}
          </div>

          <div className="composer">
            <input
              type="text"
              className="composer-input"
              placeholder="Enter message..."
              value={pendingMessage}
              onChange={(e) => setPendingMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button className="composer-send" onClick={handleSendMessage} disabled={!pendingMessage.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;