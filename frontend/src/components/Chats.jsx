import React, { useEffect, useState, useRef } from "react";
import { Send, Search, MoreVertical, Trash2 } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api/ocr";

const Chats = ({ theme }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUsername = localStorage.getItem("username");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeleteClick = (msg) => {
  const isSender = msg.sender_username === currentUsername;

  setDeleteTarget({
    messageId: msg.id,
    isSender,
  });
};
 

  const isDark = theme === "dark";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await fetch(`${API_BASE}/chat/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      const sorted = [...data].sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time) - new Date(a.last_message_time);
    });

        setUsers(sorted);

    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const openChat = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    setRoom(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('access');
      const res = await fetch(`${API_BASE}/chat/room/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await res.json();

      setRoom(data);
      await fetchMessages(data.id);
    } catch (err) {
      console.error("Failed to open chat", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const token = localStorage.getItem('access');
      const res = await fetch(`${API_BASE}/chat/messages/${roomId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

const sendMessage = async () => {
  if (!newMessage.trim() || !room) return;

  try {
    const token = localStorage.getItem("access");
    const res = await fetch(`${API_BASE}/chat/messages/${room.id}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newMessage }),
    });

    const data = await res.json();

    // ✅ update messages
    setMessages((prev) => [...prev, data]);

    // ✅ update users list (ONLY HERE)
    setUsers((prev) => {
      const updated = prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              last_message: data.content,
              last_message_time: data.created_at,
            }
          : u
      );

      return updated.sort(
        (a, b) =>
          new Date(b.last_message_time || 0) -
          new Date(a.last_message_time || 0)
      );
    });

    setNewMessage("");
  } catch (err) {
    console.error("Failed to send message", err);
  }
};



  const deleteForMe = async () => {
  if (!deleteTarget) return;

  const token = localStorage.getItem("access");

  await fetch(
    `${API_BASE}/chat/messages/${deleteTarget.messageId}/delete-for-me/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setMessages((prev) =>
    prev.filter((m) => m.id !== deleteTarget.messageId)
  );

  setDeleteTarget(null);
};

const deleteForEveryone = async () => {
  if (!deleteTarget) return;

  const token = localStorage.getItem("access");

  await fetch(
    `${API_BASE}/chat/messages/${deleteTarget.messageId}/delete-for-everyone/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setMessages((prev) =>
    prev.map((m) =>
      m.id === deleteTarget.messageId
        ? {
            ...m,
            is_deleted_for_everyone: true,
            content: "This message was deleted",
          }
        : m
    )
  );

  setDeleteTarget(null);
};



  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp || msg.created_at).toDateString();
      
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({
          type: "date",
          date: msg.timestamp || msg.created_at,
        });
      }
      
      groups.push({
        type: "message",
        data: msg,
      });
    });

    return groups;
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedMessages = groupMessagesByDate(messages);

  const styles = {
    container: {
      padding: "32px 40px",
      height: "100vh",
      backgroundColor: isDark ? "#111827" : "#f0f2f5",
      boxSizing: "border-box",
    },
    header: {
      marginBottom: 24,
    },
    title: {
      margin: 0,
      fontSize: 28,
      fontWeight: 700,
      color: isDark ? "#f9fafb" : "#111827",
    },
    subtitle: {
      color: isDark ? "#9ca3af" : "#6b7280",
      marginTop: 4,
    },
    chatContainer: {
      display: "flex",
      height: "calc(100vh - 180px)",
      backgroundColor: isDark ? "#1f2937" : "#fff",
      borderRadius: 12,
      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    usersList: {
      width: 380,
      borderRight: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      display: "flex",
      flexDirection: "column",
      backgroundColor: isDark ? "#111827" : "#fff",
    },
    usersHeader: {
      padding: "20px 16px",
      borderBottom: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      backgroundColor: isDark ? "#1f2937" : "#f9fafb",
    },
    searchContainer: {
      position: "relative",
      marginTop: 12,
    },
    searchInput: {
      width: "100%",
      padding: "10px 12px 10px 40px",
      borderRadius: 8,
      border: `1px solid ${isDark ? "#374151" : "#d1d5db"}`,
      fontSize: 14,
      backgroundColor: isDark ? "#374151" : "#f9fafb",
      color: isDark ? "#f9fafb" : "#111827",
      outline: "none",
      boxSizing: "border-box",
    },
    usersScroll: {
      flex: 1,
      overflowY: "auto",
    },
    userItem: (isSelected) => ({
      padding: "16px",
      cursor: "pointer",
      borderBottom: `1px solid ${isDark ? "#374151" : "#f3f4f6"}`,
      backgroundColor: isSelected
        ? isDark
          ? "#374151"
          : "#f0f9ff"
        : "transparent",
      transition: "background-color 0.15s",
    }),
    userAvatar: {
      width: 48,
      height: 48,
      borderRadius: "50%",
      backgroundColor: isDark ? "#3b82f6" : "#dbeafe",
      color: isDark ? "#93c5fd" : "#1e40af",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 18,
      marginRight: 12,
    },
    userName: {
      fontWeight: 600,
      fontSize: 15,
      color: isDark ? "#f9fafb" : "#111827",
      marginBottom: 4,
    },
    userStatus: {
      fontSize: 13,
      color: isDark ? "#6b7280" : "#9ca3af",
    },
    chatArea: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: isDark ? "#0f172a" : "#efeae2",
    },
    chatHeader: {
      padding: "16px 20px",
      borderBottom: `1px solid ${isDark ? "#374151" : "#d1d5db"}`,
      backgroundColor: isDark ? "#1f2937" : "#f0f2f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    chatHeaderLeft: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    messagesArea: {
      flex: 1,
      padding: "20px",
      overflowY: "auto",
      backgroundImage: isDark
        ? "none"
        : "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" opacity=\"0.03\"><text x=\"10\" y=\"50\" font-size=\"40\">💬</text></svg>')",
    },
    dateSeparator: {
      textAlign: "center",
      margin: "20px 0",
    },
    dateBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 8,
      backgroundColor: isDark ? "#374151" : "#fff",
      color: isDark ? "#d1d5db" : "#6b7280",
      fontSize: 13,
      fontWeight: 500,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    messageRow: (isSent) => ({
      display: "flex",
      justifyContent: isSent ? "flex-start" : "flex-end",
      alignItems: "flex-end",
      marginBottom: 16,
      gap: 8,
    }),
    messageBubble: (isSent) => ({
      display: "inline-block",
      maxWidth: "70%",
      minWidth: "80px",
      padding: "10px 14px",
      borderRadius: isSent ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
      backgroundColor: isSent
        ? isDark
          ? "#1f2937"
          : "#fff"
        : isDark
        ? "#005c4b"
        : "#d9fdd3",
      color: isDark ? "#f9fafb" : "#111827",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      wordWrap: "break-word",
      overflowWrap: "break-word",
      width: "auto",
    }),
    messageContainer: {
      display: "flex",
      alignItems: "flex-end",
      gap: 8,
      maxWidth: "75%",
    },
    senderAvatar: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      backgroundColor: isDark ? "#3b82f6" : "#dbeafe",
      color: isDark ? "#93c5fd" : "#1e40af",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      fontSize: 13,
      flexShrink: 0,
    },
    senderName: {
      fontSize: 12,
      fontWeight: 600,
      color: isDark ? "#9ca3af" : "#6b7280",
      marginBottom: 4,
      marginLeft: 4,
    },
    deleteButton: {
      background: isDark ? "#374151" : "#f3f4f6",
      border: "none",
      borderRadius: "50%",
      width: 28,
      height: 28,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ef4444",
      flexShrink: 0,
      opacity: 0,
      transition: "opacity 0.2s, background-color 0.15s",
      alignSelf: "flex-end",
      marginBottom: 4,
    },
    messageContent: {
      fontSize: 14.5,
      lineHeight: 1.5,
      wordWrap: "break-word",
      marginBottom: 4,
    },
    messageTime: {
      fontSize: 11,
      color: isDark ? "#9ca3af" : "#667781",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 4,
      marginTop: 2,
    },
    inputArea: {
      padding: "12px 20px",
      borderTop: `1px solid ${isDark ? "#374151" : "#d1d5db"}`,
      backgroundColor: isDark ? "#1f2937" : "#f0f2f5",
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    input: {
      flex: 1,
      padding: "12px 16px",
      borderRadius: 24,
      border: "none",
      fontSize: 15,
      backgroundColor: isDark ? "#374151" : "#fff",
      color: isDark ? "#f9fafb" : "#111827",
      outline: "none",
    },
    sendButton: {
      padding: "12px 16px",
      backgroundColor: "#25d366",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "transform 0.15s, background-color 0.15s",
      width: 48,
      height: 48,
    },
    emptyState: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: isDark ? "#6b7280" : "#9ca3af",
      gap: 12,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Messages</h1>
        <p style={styles.subtitle}>
          Communicate with your team members in real-time
        </p>
      </div>

      <div style={styles.chatContainer}>
        {/* Users List */}
        <div style={styles.usersList}>
          <div style={styles.usersHeader}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Chats</h3>
            <div style={styles.searchContainer}>
              <Search
                size={18}
                color={isDark ? "#6b7280" : "#9ca3af"}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.usersScroll}>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: isDark ? "#6b7280" : "#9ca3af" }}>
                {searchTerm ? "No users found" : "No contacts available"}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => openChat(u)}
                  style={styles.userItem(selectedUser?.id === u.id)}
                  onMouseEnter={(e) => {
                    if (selectedUser?.id !== u.id) {
                      e.currentTarget.style.backgroundColor = isDark ? "#1f2937" : "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUser?.id !== u.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={styles.userAvatar}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userName}>{u.username}</div>
                    <div style={styles.userStatus}>
                    {u.last_message || "No messages yet"}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                    {u.last_message_time &&
                        new Date(u.last_message_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {!selectedUser ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 64, opacity: 0.3 }}>💬</div>
              <h3 style={{ margin: 0, fontSize: 20 }}>
                Select a conversation
              </h3>
              <p style={{ margin: 0, fontSize: 14 }}>
                Choose a contact from the list to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderLeft}>
                  <div style={styles.userAvatar}>
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.userName}>{selectedUser.username}</div>
                    <div style={{ fontSize: 13, color: isDark ? "#6b7280" : "#9ca3af" }}>
                      {selectedUser.email || "Online"}
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 8,
                    borderRadius: "50%",
                  }}
                >
                  <MoreVertical size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                </button>
              </div>

              {/* Messages Area */}
              <div style={styles.messagesArea}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: isDark ? "#6b7280" : "#9ca3af" }}>
                    Loading messages...
                  </div>
                ) : groupedMessages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: isDark ? "#6b7280" : "#9ca3af" }}>
                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>
                      👋
                    </div>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {groupedMessages.map((item, idx) => {
                      if (item.type === "date") {
                        return (
                          <div key={`date-${idx}`} style={styles.dateSeparator}>
                            <span style={styles.dateBadge}>
                              {formatDateSeparator(item.date)}
                            </span>
                          </div>
                        );
                      }

                      const msg = item.data;
                      const isSent = msg.sender_username === currentUsername;

                      return (
                        <div key={msg.id} style={styles.messageRow(isSent)}>
                            {/* Avatar for received messages */}
                            {!isSent && (
                            <div style={styles.senderAvatar}>
                                {msg.sender_username?.charAt(0).toUpperCase() || "?"}
                            </div>
                            )}

                            <div
                            style={styles.messageContainer}
                            onMouseEnter={() => setHoveredMsg(msg.id)}
                            onMouseLeave={() => setHoveredMsg(null)}
                            >
                            <div style={{ flex: 1 }}>

                                {/* Message Bubble */}
                                <div style={styles.messageBubble(isSent)}>
                                {msg.is_deleted_for_everyone ? (
                                    <div
                                    style={{
                                        fontStyle: "italic",
                                        color: isDark ? "#9ca3af" : "#6b7280",
                                    }}
                                    >
                                    This message was deleted
                                    </div>
                                ) : (
                                    <>
                                    <div style={styles.messageContent}>
                                        {msg.content}
                                    </div>

                                    <div style={styles.messageTime}>
                                        {formatTime(msg.timestamp || msg.created_at)}
                                        {msg.is_edited && (
                                        <span
                                            style={{
                                            marginLeft: 6,
                                            fontSize: 11,
                                            opacity: 0.6,
                                            }}
                                        >
                                            edited
                                        </span>
                                        )}
                                    </div>
                                    </>
                                )}
                                </div>
                            </div>

                            {/* Delete button */}
                            {!msg.is_deleted_for_everyone && (
                                <button
                                onClick={() => handleDeleteClick(msg)}
                                style={{
                                    ...styles.deleteButton,
                                    opacity: hoveredMsg === msg.id ? 1 : 0,
                                }}
                                title="Delete message"
                                >
                                <Trash2 size={16} />
                                </button>
                            )}
                            </div>
                        </div>
                        );

                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div style={styles.inputArea}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={styles.input}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <button
                  onClick={sendMessage}
                  style={styles.sendButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#20bd5f";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#25d366";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} />

                
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {deleteTarget && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: theme === "dark" ? "#1f2937" : "#fff",
        padding: 20,
        borderRadius: 10,
        width: 320,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          color: theme === "dark" ? "#f9fafb" : "#111827",
        }}
      >
        Delete message?
      </h3>

      <p
        style={{
          fontSize: 14,
          color: theme === "dark" ? "#9ca3af" : "#555",
        }}
      >
        Choose how you want to delete this message.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {/* ✅ Always allowed */}
        <button
          onClick={deleteForMe}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
            background: "transparent",
            color: theme === "dark" ? "#f9fafb" : "#111827",
          }}
        >
          Delete for me
        </button>

        {/* ✅ ONLY for sent messages */}
        {deleteTarget.isSender && (
          <button
            onClick={deleteForEveryone}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 6,
              background: "#ef4444",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Delete for everyone
          </button>
        )}
      </div>

      <button
        onClick={() => setDeleteTarget(null)}
        style={{
          marginTop: 14,
          width: "100%",
          background: "transparent",
          border: "none",
          color: theme === "dark" ? "#9ca3af" : "#666",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}


    </div>
  );
};

export default Chats;