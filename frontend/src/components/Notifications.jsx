import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getAuth } from 'firebase/auth'
import './Notifications.css'

function formatDate(iso) {
  return new Date(iso).toLocaleString([], {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function Notifications() {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    const user = getAuth().currentUser
    if (!user) return
    axios
      .get('http://localhost:1080/api/notifications', { params: { user: user.uid } })
      .then(res => setNotes(res.data))
      .catch(console.error)
  }, [])

  const markRead = async (id) => {
    await axios.put(`http://localhost:1080/api/notifications/${id}/read`)
    setNotes(n => n.map(x => x._id === id ? { ...x, read: true } : x))
  }

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Your Notifications</h2>
      {notes.length > 0 ? (
        <div className="notifications-list">
          {notes.map(n => (
            <div key={n._id} className={`notification-card ${n.read ? 'read' : 'unread'}`}>
              <div className="notification-info">
                <p className="notification-message">{n.message}</p>
                <span className="notification-date">{formatDate(n.createdAt)}</span>
              </div>
              {!n.read && (
                <button
                  className="notification-action"
                  onClick={() => markRead(n._id)}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-notifications">No notifications right now.</p>
      )}
    </div>
  )
}