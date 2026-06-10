const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const ATTACHMENTS_DIR = path.join(__dirname, '..', 'emails', 'attachments');

if (!fs.existsSync(ATTACHMENTS_DIR)) {
  fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
}

const getGmailCredentials = () => {
  const user = process.env.FROM_EMAIL?.trim();
  const rawPass = process.env.FROM_PASSWORD ?? "";
  // Gmail app passwords are often copied as "xxxx xxxx xxxx xxxx" — IMAP needs no spaces
  const password = rawPass.replace(/\s/g, "");
  return { user, password };
};

const sendEmail = async ({ to, subject, text, attachments }) => {
  const { user, password } = getGmailCredentials();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass: password },
  });

  const mailOptions = {
    from: user,
    to,
    subject,
    text,
    attachments,
  };

  await transporter.sendMail(mailOptions);
};

const getEmails = () => {
  return new Promise((resolve, reject) => {
    const { user, password } = getGmailCredentials();

    if (!user || !password) {
      return reject(new Error("FROM_EMAIL and FROM_PASSWORD must be set in backend .env"));
    }

    const imap = new Imap({
      user,
      password,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const emailPromises = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        imap.search(['ALL', ['SINCE', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]], (err, results) => {
          if (err || !results.length) {
            imap.end();
            return resolve([]);
          }

          const fetch = imap.fetch(results.slice(-20), { bodies: '', struct: true });

          fetch.on('message', (msg) => {
            const promise = new Promise((res) => {
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) return res(null);

                  const attachments = [];

                  if (parsed.attachments?.length) {
                    for (const file of parsed.attachments) {
                      const fileId = uuidv4();
                      const filename = file.filename || 'unnamed-file';
                      const generatedName = `${fileId}-${filename}`;
                      const filePath = path.join(ATTACHMENTS_DIR, generatedName);

                      fs.writeFileSync(filePath, file.content);

                      attachments.push({
                        filename: filename,
                        generatedName: generatedName, // Used in frontend
                      });
                    }
                  }

                  res({
                    subject: parsed.subject,
                    from: parsed.from?.text,
                    to: parsed.to?.text,
                    cc: parsed.cc?.text,
                    bcc: parsed.bcc?.text,
                    text: parsed.text,
                    html: parsed.html,
                    date: parsed.date,
                    attachments,
                    messageId: parsed.messageId,
                    priority: parsed.priority,
                    size: parsed.size,
                  });
                });
              });
            });

            emailPromises.push(promise);
          });

          fetch.once('end', async () => {
            imap.end();
          });
        });
      });
    });

    imap.once("error", reject);
    imap.once('end', async () => {
      const emails = (await Promise.all(emailPromises)).filter(Boolean);
      emails.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      resolve(emails);
    });

    imap.connect();
  });
};

module.exports = { sendEmail, getEmails };