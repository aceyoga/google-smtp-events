const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const fs = require('fs');
const EVENTS_FILE = path.join(__dirname, 'events.json');
let events = [];
// Load events from file
try {
  if (fs.existsSync(EVENTS_FILE)) {
    events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
  }
} catch (e) {
  events = [];
}

function saveEvents() {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

function scheduleNotification(event) {
  if (event.startTime && !event.notified) {
    schedule.scheduleJob(new Date(event.startTime), async function () {
      if (event.notified) return; // Prevent double notification
      let recipients = Array.isArray(event.attendees) ? event.attendees.filter(Boolean) : [];
      if (!recipients.length) {
        console.warn(`No attendees defined for event '${event.title}', skipping email notification.`);
        return;
      }
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipients.join(','),
        subject: `Event Reminder: ${event.title}`,
        text: `Reminder: ${event.title}\nDescription: ${event.description || ''}\nLocation: ${event.location || ''}\nStart: ${event.startTime}\nEnd: ${event.endTime}\nAttendees: ${recipients.join(', ')}`,
      });
      event.notified = true;
      saveEvents();
    });
  }
}

// CRUD Endpoints
app.get('/events', (req, res) => {
  res.json(events);
});

app.post('/events', (req, res) => {
  const { title, description, location, startTime, endTime, attendees } = req.body;
  const event = {
    id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
    title,
    description,
    location,
    startTime,
    endTime,
    attendees,
    notified: false
  };
  events.push(event);
  saveEvents();
  scheduleNotification(event);
  res.status(201).json(event);
});

app.put('/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const event = events.find(e => e.id === id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  event.title = req.body.title || event.title;
  event.description = req.body.description || event.description;
  event.location = req.body.location || event.location;
  event.startTime = req.body.startTime || event.startTime;
  event.endTime = req.body.endTime || event.endTime;
  event.attendees = req.body.attendees || event.attendees;
  event.notified = false;
  saveEvents();
  scheduleNotification(event);
  res.json(event);
});

app.delete('/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });
  events.splice(index, 1);
  saveEvents();
  res.status(204).send();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Reschedule notifications for all future events on server start
events.forEach(event => {
  if (event.startTime && !event.notified) {
    scheduleNotification(event);
  }
});

app.listen(3000, () => {
  console.log('Event Notifier running on port 3000');
});
