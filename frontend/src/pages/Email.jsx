import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import EmailAccordion from '../components/EmailAccordion';
import axios from 'axios';

const EmailForm = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: '',
  });
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [emails, setEmails] = useState([]);

  // 📩 Fetch received emails on mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/emails/receive', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmails(response.data.emails || []);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchEmails();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    const data = new FormData();
    data.append('to', formData.to);
    data.append('subject', formData.subject);
    data.append('text', formData.text);
    for (let i = 0; i < files.length; i++) {
      data.append('attachments', files[i]); // must match multer field
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/emails/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        setStatus('Email sent successfully!');
      } else {
        setStatus(result.error || 'Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('An error occurred.');
    }
  };

    return (
        <Container className="my-5">
            <Card className="mb-5 shadow">
            <Card.Body>
                <Card.Title>Send Email</Card.Title>
                <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTo">
                    <Form.Label>To</Form.Label>
                    <Form.Control
                    type="email"
                    name="to"
                    placeholder="Enter recipient email"
                    value={formData.to}
                    onChange={handleChange}
                    required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formSubject">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                    type="text"
                    name="subject"
                    placeholder="Enter subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formMessage">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                    as="textarea"
                    name="text"
                    placeholder="Type your message here"
                    value={formData.text}
                    onChange={handleChange}
                    rows={5}
                    required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAttachments">
                    <Form.Label>Attachments</Form.Label>
                    <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Send Email
                </Button>

                {status && (
                    <Alert variant="info" className="mt-3">
                    {status}
                    </Alert>
                )}
                </Form>
            </Card.Body>
            </Card>

            {/* Inbox Section */}
            <div className="mb-5">
            <h3 className="mb-3">Inbox</h3>
            <EmailAccordion emails={emails} />
            </div>
        </Container>
    );
};

export default EmailForm;
