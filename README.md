# H2HCube

A real-time, head-to-head speedcubing web app. Compete, track, and connect with friends in speedcubing matches.

## Features

- Real-time head-to-head matches
- WCA login integration
- Friends system with requests and notifications
- Live match invites and notifications
- Match statistics and history

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Supabase, PostgreSQL
- **Authentication:** Passport.js (WCA OAuth)
- **Deployment:** AWS EC2

## Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase project
- WCA OAuth credentials

### Supabase Project Setup

Please see the schema.sql file in the root directory. Once you create a supabase project,
you should be able to paste it into the SQL editor. If this doesn't work, try following
the instructions [here](https://github.com/orgs/supabase/discussions/773#discussioncomment-5806539)

### Backend Setup

1. Copy `.env.example` to `.env` in `h2hbackend/` and fill in your secrets.
2. Install dependencies:
   ```bash
   cd h2hbackend
   npm install
   ```
3. Start the express server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Copy `.env.example` to `.env` in `h2hweb/` and fill in your API URLs and Supabase keys.
2. Install dependencies:
   ```bash
   cd h2hweb
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

### Issues/Questions

If you have any questions, find any bugs, or have any suggestions for improvement, please don't hesitate to [submit an issue](https://github.com/ShidemantleJ/h2h/issues)

## License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)

---

Made with ❤️ for the speedcubing community.
