import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useSearchParams, useParams } from 'react-router-dom';

const socket = io('http://https://omni-channel-app.onrender.com/', {
  auth: {token: localStorage.getItem('token') || ''}
});

const ChatBox = () => {
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState({});
    const [users, setUsers] = useState([]);
    const [selectedReceiver, setSelectedReceiver] = useState(null);

  useEffect(() => {

    storedUser();
    userDetails();

    socket.on('private_message', (data) => {
      console.log("📥 Received:", data);
      setMessages(prev => [...prev, {
        from: data.from,
        content: data.content,
        file: data.file,
        timestamp: new Date(data.timestamp).toLocaleDateString()
      }]);
    });

   

    return () => socket.off('private_message');
  }, []);

  // useEffect(() => {
  //   console.log('Current User:', currentUser);
  //   console.log(users);
  // }, [currentUser, users]);

  const storedUser = async () => {
    const { data } = await axios.get('http://https://omni-channel-app.onrender.com//api/users/currentUser', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  console.log(data);
  setCurrentUser(data);
}

  
  const userDetails = async () => {
      const {data} = await axios.get('http://https://omni-channel-app.onrender.com//api/users/details', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    setUsers(data);
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    
    console.log('About to send:', {
        sender: currentUser._id,
        receiver: users[2]?._id,
        message,
        file
    });

    if (!currentUser._id || !users[2]?._id) return;

    // const outgoingMessage = {
    //   from: currentUser,
    //   content: message,
    //   file: file ? file.name : null,
    //   timestamp: new Date().toISOString()
    // }
    // setMessages(prev => [...prev, outgoingMessage]);

    const formData = new FormData();
    formData.append('senderEmail', currentUser._id);
    formData.append('receiverEmail', users[2]?._id);
    formData.append('message', message);
    if (file) formData.append('file', file);
    // console.log('Form Data:', formData);
    
    socket.emit('private_message', {from: currentUser._id, to: users[2]?._id, content: {message, file}});
    // socket.on('private_message', (data) => {
    // setMessages(prev => [...prev, {
    //     from: data.from,
    //     content: data.content,
    //     file: data.file,
    //     timestamp: new Date(data.timestamp).toLocaleDateString()
    //   }]);
    // });
    setMessage('');
    setFile(null);
  };

  
  return (
    <div className="chat-box p-4 border rounded">
      <div className="messages mb-3" style={{ maxHeight: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.from.name === currentUser.name ? 'text-end' : 'text-start'}`}>
            <div><strong>{msg.from.name}</strong>: {msg.content}</div>
            {msg.file && (
              <a
                href={`http://https://omni-channel-app.onrender.com//uploads/chat/${msg.file}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                📎 {msg.file}
              </a>
            )}
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
