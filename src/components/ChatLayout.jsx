import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/chat-layout.css";
import Header from './Header';
import getCSRFToken from "./getCSRFToken";

function AddChatModal({ following, onClose, onCreate }) {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    onCreate(selected);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>New Chat</h3>
        <div className="list">
          {following.map((f) => (
            <label key={f.owner_id} className="list-item">
              <input
                type="checkbox"
                checked={selected.includes(f.owner_id)}
                onChange={() => toggleSelect(f.owner_id)}
              />
              <img src={f.photo} alt={f.name} className="avatar" />
              <span>{f.name}</span>
            </label>
          ))}
        </div>
        <div className="actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCreate} disabled={!selected.length}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatLayout() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const controller = new AbortController();
  async function fetchRooms() {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat/conversations/`, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) return;
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Failed to load rooms:", err);
      }
    }
  }
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pets/following/`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setFollowing(data.following);  // 你的 API 返回 {'following': [...]}
        }
      } catch (err) {
        console.error("Failed to load following:", err);
      }
    };
    if (isLogin) fetchFollowing();
  }, [isLogin]);
  useEffect(() => {
    fetchRooms();
    return () => controller.abort();
  }, [isLogin]);
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
        setId("");
      });
    } else {
      window.location.href = '/Register';
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
            setId(data.id);
          } else {
            setIsLogin(false);
            setUsername("");
            setId("");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAuth();
  }, []);
  const addChat = () => {
    if (!following.length) {
      alert("You haven't followed anyone");
      return;
    }
    setShowModal(true);
  };

  const handleCreateChat = async (ids) => {
    for (const id of ids) {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat/dm/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": await getCSRFToken(),
        },
        body: JSON.stringify({ user_id: id }),
      });
    }
    fetchRooms();
  };

  return (
    <div>
      <Header
        username={username}
        isLogin={isLogin}
        handleLogin={handleLoginClick}
        menuItems={[
          { label: "Homepage", path: "/" },
          { label: "Profile", path: "/MyProfile" },
          { label: "Friends", path: "/Friends" },
          { label: "Chat", path: "/Chat" }
        ]}
      />
    <div className="chat-shell">
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <div className="title">Chat Room</div>
          <button className="add-btn" onClick={() => addChat()}>＋</button>
        </div>

        <div className="room-search">
          <input placeholder="Search Room…" />
        </div>

        <nav className="room-list">
          {rooms.map(r => {
            return (
              <NavLink
                key={r.id}
                to={`/chat/${r.id}/`}
                className={({ isActive }) => "room-item" + (isActive ? " active" : "")}
              >
                <div className="room-avatar">{r.other.username.slice(0,1).toUpperCase()}</div>
                <div className="room-meta">
                  <div className="room-title">{r.title}</div>
                  <div className="room-sub">{r.other.username}</div>
                </div>
              </NavLink>
            );
           })}
        </nav>
      </aside>

      <main className="chat-main">
        <Outlet context={{rooms, username, isLogin}} />
        {showModal && (
          <AddChatModal
            following={following}
            onClose={() => setShowModal(false)}
            onCreate={handleCreateChat}
          />
        )}
      </main>
    </div>
    </div>
  );
}