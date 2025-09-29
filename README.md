# Google SMTP Event Notifier

A fullstack event notification app with Express.js backend, Nginx frontend, and Docker Compose. It allows you to create, edit, and delete events with Google Calendar-like details, and sends email notifications to event attendees using Gmail SMTP.

## Features
- Full CRUD for events (title, description, location, start/end time, attendees)
- Email notifications sent to event attendees at the scheduled time
- Responsive HTML/CSS frontend served by Nginx
- Backend and frontend run in Docker containers
- Events are persisted in a JSON file (not committed to git)
- Environment variables for sensitive data
- Timezone support (set to Asia/Bangkok by default)

## Quick Start

### 1. Clone the repository
```sh
git clone https://github.com/aceyoga/google-smtp-events.git
cd google-smtp-events
```

### 2. Set up Gmail App Password
- Follow this guide: [How to use the Gmail SMTP server to send emails for free](https://www.geeksforgeeks.org/techtips/how-to-use-the-gmail-smtp-server-to-send-emails-for-free/)
- Enable 2FA on your Google account
- Create an App Password for this Google SMTP Mail app

### 3. Configure environment variables
- Copy `.env-sample` to `.env` and fill in your Gmail address and app password:

```
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```

### 4. Build and run with Docker Compose
```sh
docker-compose up --build
```
- The frontend will be available at [http://localhost:8880](http://localhost:8880)

### 5. Usage
- On first load, you'll see the event list and a button to add events.
- Click "Add Event" to open the form.
- Fill in event details, including comma-separated attendee emails.
- At the scheduled start time, all attendees will receive an email notification.

## File Structure
```
├── app
│   ├── server.js         # Express backend
│   ├── events.json       # Event data (gitignored)
│   └── package.json      # Node dependencies
├── public                # Frontend static files
│   ├── index.html
│   ├── style.css
│   └── main.js
├── .env                  # Your secrets (gitignored)
├── .env-sample           # Example env file
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## Security Notes
- Never commit your real `.env` or `events.json` to git.
- Use app passwords, not your main Gmail password.
- For production, use a dedicated email account and review security best practices.

## Reference
- [How to use the Gmail SMTP server to send emails for free](https://www.geeksforgeeks.org/techtips/how-to-use-the-gmail-smtp-server-to-send-emails-for-free/)

---

Made with ❤️ by aceyoga
