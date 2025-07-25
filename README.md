# Omni-Channel Communication App

A full-stack communication platform supporting:
- 📩 Email
- 💬 Chat (with file sharing)
- 📱 SMS (via Twilio)
- 📞 Voice Calls (via Twilio)
- 🌓 Dark & Light theme support

> Built using **MERN Stack (MongoDB, Express, React, Node.js)** and **Twilio APIs**.

---

## 🌐 Live Demo

Hosted on **Render** and **Vercel**  
> 🔗 Frontend: [https://your-frontend.vercel.app](https://your-frontend.vercel.app)  
> 🔗 Backend: [https://omni-channel-app.onrender.com](https://omni-channel-app.onrender.com)

---

## 📁 Project Structure

```
omni-channel-app/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js
- MongoDB
- Vite (for frontend)
- Twilio Account (for SMS/Voice)
- Vercel (for frontend deployment)
- Render or Railway (for backend deployment)

---

### 🔧 Backend Setup

1. Go to `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/omnichannel
   JWT_SECRET=your_jwt_secret
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```
4. Run the server:
   ```bash
   npm run dev
   ```

---

### 🌐 Frontend Setup

1. Go to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app locally:
   ```bash
   npm run dev
   ```

---

## 💬 Chat Feature

- Real-time 1:1 messaging using **Socket.IO**
- File attachment support
- Read receipt & timestamp
- History fetching from MongoDB
- Dark/light UI modes

---

## 📩 Email Feature

- Send emails with multiple file attachments
- View email history with collapsible UI
- Backend uses **Nodemailer**
- Email configuration is dynamic (supports `.env` or DB-based)

---

## 📱 SMS Feature (via Twilio)

### Prerequisites:
- [Sign up on Twilio](https://www.twilio.com/)
- Get a **Verified Phone Number**
- Setup your **Trial Number**

### Usage:

#### 1. Sending SMS
- Go to SMS tab in the UI
- Enter recipient number (in E.164 format, e.g., `+639XXXXXXXXX`)
- Type your message and click **Send**

#### 2. Receiving SMS
- Set your **Twilio Webhook URL** to:
  ```
  https://omni-channel-app.onrender.com/api/sms/receive
  ```
- This will automatically receive and log SMS messages into MongoDB and the UI

---

## 📞 Voice Call Feature (via Twilio)

### Prerequisites:
- Enable **Programmable Voice**
- Set **Voice webhook URL** on Twilio to:
  ```
  https://omni-channel-app.onrender.com/api/voice/receive
  ```

### Usage:

#### 1. Outbound Call
- Go to **Voice** tab
- Enter destination number (in international format)
- Click **Call Now**
- Your Twilio number will initiate the call

#### 2. Inbound Call
- When a call is received on your Twilio number, it will be auto-logged to the Voice History

---

## 🧪 API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/email/send` | POST | Send an email |
| `/api/email/history` | GET | Fetch sent emails |
| `/api/chat/upload` | POST | Upload chat file |
| `/api/chat/download/:filename` | GET | Download chat file |
| `/api/chat/history/:receiverId` | GET | Get chat history |
| `/api/sms/send` | POST | Send SMS |
| `/api/sms/receive` | POST | Receive SMS via webhook |
| `/api/voice/call` | POST | Initiate outbound call |
| `/api/voice/receive` | POST | Receive inbound call (Twilio webhook) |

---

## 🖼️ UI Features

- Fully responsive design
- Tailwind CSS + React Icons
- Consistent dark/light mode styling
- Auto-scroll chatbox
- Image and file preview
- Styled select dropdowns

---

## 🔐 Authentication

- JWT-based login system
- Token stored in `localStorage`
- Protected routes for Chat, SMS, Email, Voice pages

---

## 🚀 Deployment Notes

### Vercel (Frontend)
- Add rewrite rule:
  ```
  vercel.json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/" }
    ]
  }
  ```

### Render (Backend)
- Add build & start command:
  ```bash
  npm install && npm run dev
  ```

---

## 📌 Credits

- Built by **Matthew Ramon Raga** during residency assessment.
- Inspired by modern communication platforms.
- Uses public libraries and APIs (Twilio, Nodemailer, Socket.IO, etc.)

---

## 📫 Contact

Feel free to reach out via LinkedIn or GitHub if you want to collaborate or have feedback.