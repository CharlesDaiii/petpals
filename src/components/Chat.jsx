import React, { useState, useEffect, useRef } from "react";
import "../styles/Friends.css"; // we append chat styles here
import getCSRFToken from "./getCSRFToken";
import Header from './Header';
import { useParams } from "react-router-dom";

function Chat() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [pendingMessage, setPendingMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { room_name } = useParams();

  // 用于滚动到底部
  const bottomRef = useRef(null);
  const messagesWrapRef = useRef(null);

  const scrollToBottom = () => {
    // 优先用底部锚点滚动
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat/messages/${room_name}/`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
      }
    } finally {
      setLoading(false);
      // 等 DOM 更新后滚动
      setTimeout(scrollToBottom, 0);
    }
  };

  const handleSendMessage = async () => {
    const text = pendingMessage.trim();
    if (!text) return;

    // 可选：乐观更新
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat/messages/${room_name}/send/`, {
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
    const fetchAuth = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/redirect/`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.is_authenticated) {
            setIsLogin(true);
            setUsername(data.username);
          } else {
            setIsLogin(false);
            setUsername("");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAuth();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [room_name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLoginClick = async () => {
    if (isLogin) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pets/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": await getCSRFToken(),
        }
      })
      .then(() => {
        setIsLogin(false);
        setUsername("");
      });
    } else {
      window.location.href = '/Register';
    }
  };

  return (
    <div className="chat-page">
      <Header
        username={username}
        isLogin={isLogin}
        handleLogin={handleLoginClick}
        menuItems={[
          { label: "Homepage", path: "/" },
          { label: "Profile", path: "/MyProfile" },
          { label: "Friends", path: "/Friends" }
        ]}
      />

      <div className="chat-wrapper">
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-room-name">#{room_name}</div>
            {isLogin ? <div className="chat-me">👤 {username}</div> : <div className="chat-me muted">未登录</div>}
          </div>

          <div className="messages-wrap" ref={messagesWrapRef}>
            {loading ? (
              <div className="empty muted">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="empty muted">开始对话吧～</div>
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
              placeholder="输入消息…"
              value={pendingMessage}
              onChange={(e) => setPendingMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button className="composer-send" onClick={handleSendMessage} disabled={!pendingMessage.trim()}>
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;