import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useSearchParams, useParams } from 'react-router-dom';

const socket = io('http://localhost:5000');

const ChatBox = () => {
    const { recipientEmail } = useParams();
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [searchParams] = useSearchParams();

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (storedUser?.email) {
    setCurrentUserEmail(storedUser.email);
  }

  if (storedUser?.email && recipientEmail) {
    fetchChats(storedUser.email, recipientEmail);
  }

  socket.on('receiveMessage', (msg) => {
    if (msg.receiver.email === storedUser?.email) {
      setMessages(prev => [...prev, msg]);
    }
  });

  return () => socket.off('receiveMessage');
}, [recipientEmail]);


  const fetchChats = async (senderEmail, receiverEmail) => {
    const { data } = await axios.get(`http://localhost:5000/api/chats/${senderEmail}/${receiverEmail}`);
    setMessages(data);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    console.log('About to send:', {
        senderEmail: currentUserEmail,
        receiverEmail: recipientEmail,
        message,
        file,
    });
    if (!currentUserEmail || !recipientEmail) return;

    const formData = new FormData();
    formData.append('senderEmail', currentUserEmail);
    formData.append('receiverEmail', recipientEmail);
    formData.append('message', message);
    if (file) formData.append('file', file);


    const { data } = await axios.post('http://localhost:5000/api/chats', formData);
    socket.emit('sendMessage', data);
    setMessages(prev => [...prev, data]);
    setMessage('');
    setFile(null);
  };

  return (
    <div className="chat-box p-4 border rounded">
      <div className="messages mb-3" style={{ maxHeight: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.sender.email === currentUserEmail ? 'text-end' : 'text-start'}`}>
            <div><strong>{msg.sender.email}</strong>: {msg.message}</div>
            {msg.file && (
              <a
                href={`http://localhost:5000/uploads/chat/${msg.file}`}
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
