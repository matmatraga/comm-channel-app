import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('https://omni-channel-app.onrender.com', {
  auth: { token: localStorage.getItem('token') || '' }
});

const ChatBox = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: user } = await axios.get('https://omni-channel-app.onrender.com/api/users/currentUser', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCurrentUser(user);

        const { data: userList } = await axios.get('https://omni-channel-app.onrender.com/api/users/details', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUsers(userList);
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
      }
    };

    fetchUserData();

    socket.on('private_message', (data) => {
      console.log(data);
      const incoming = {
        from: data.from,
        content: data.content,
        file: data.file,
        timestamp: new Date(data.timestamp || Date.now()).toLocaleString()
      };
      setMessages(prev => [...prev, incoming]);
    });

    return () => socket.off('private_message');
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!currentUser._id || !selectedReceiver?._id) return;

    const content = {
      message,
      file: file ? file.name : null
    };

    socket.emit('private_message', {
      // from: currentUser._id,
      to: selectedReceiver._id,
      content
    });

    // Upload file if exists
    // if (file) {
    //   const formData = new FormData();
    //   formData.append('file', file);
    //   await axios.post(`https://omni-channel-app.onrender.com/api/chat/upload`, formData, {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem('token')}`,
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });
    // }

    // Append message locally
    // setMessages(prev => [...prev, {
    //   from: currentUser,
    //   content: message,
    //   file: file ? file.name : null,
    //   timestamp: new Date().toLocaleString()
    // }]);

    setMessage('');
    setFile(null);
  };

  return (
    <div className="chat-box p-4 border rounded">
      <div className="mb-3">
        <label htmlFor="receiverSelect" className="form-label">Select Recipient:</label>
        <select
          id="receiverSelect"
          className="form-select"
          value={selectedReceiver?._id || ''}
          onChange={(e) => {
            const user = users.find(u => u._id === e.target.value);
            setSelectedReceiver(user);
          }}
        >
          <option value="" disabled>Select a user</option>
          {users
            .filter(user => user._id !== currentUser._id)
            .map(user => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
        </select>
      </div>

      <div className="messages mb-3" style={{ maxHeight: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.from._id === currentUser._id ? 'text-end' : 'text-start'}`}>
            <div><strong>{msg.from.name || 'User'}</strong>: {msg.content}</div>
            {msg.file && (
              <a
                href={`https://omni-channel-app.onrender.com/uploads/chat/${msg.file}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                📎 {msg.file}
              </a>
            )}
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{msg.timestamp}</div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message"
          required
        />
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;