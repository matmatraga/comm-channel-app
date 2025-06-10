import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Form, Button, Card, InputGroup, ListGroup } from 'react-bootstrap';

const socket = io('http://localhost:5000');

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sender, setSender] = useState('User');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/chat/history')
      .then((res) => res.json())
      .then(setMessages);

    socket.on('chat', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off('chat');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('sender', sender);
    formData.append('message', input);
    if (file) formData.append('file', file);

    const res = await fetch('http://localhost:5000/api/chat/send', {
      method: 'POST',
      body: formData,
    });

    setInput('');
    setFile(null);
  };

  return (
    <Card className="shadow">
      <Card.Header>
        <strong>Chat</strong>
      </Card.Header>
      <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <ListGroup variant="flush">
          {messages.map((msg) => (
            <ListGroup.Item key={msg.id}>
              <div>
                <strong>{msg.sender}</strong> <small className="text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
              <div>{msg.message}</div>
              {msg.file && (
                <a href={`http://localhost:5000${msg.file.path}`} download className="d-block mt-1">
                  📎 {msg.file.filename}
                </a>
              )}
            </ListGroup.Item>
          ))}
          <div ref={messagesEndRef} />
        </ListGroup>
      </Card.Body>
      <Card.Footer>
        <Form onSubmit={handleSend}>
          <InputGroup className="mb-2">
            <Form.Control
              type="text"
              placeholder="Enter message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
            <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
            <Button type="submit" variant="primary">Send</Button>
          </InputGroup>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default ChatBox;
