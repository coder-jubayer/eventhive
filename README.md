# EventHive

Event management app (React + Express + MongoDB). Copy this folder to any computer and run it with Node.js — **you do not need to change the database URI**.

## Prerequisites

- [Node.js 18+](https://nodejs.org) (LTS recommended)
- npm (comes with Node.js)
- Internet access (uses a hosted MongoDB Atlas cluster)

## Run on another device

1. Copy the whole project folder (or clone the repo) onto the new computer. **Do not copy `node_modules`** — especially between Windows and Mac/Linux.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:3000** in a browser.

No `.env` file is required. MongoDB is already wired up in `server.ts`. Leave that URI as-is.

Optional: copy `.env.example` to `.env` only if you want a custom port or JWT secret.

## Other device on the same Wi‑Fi

The server listens on all network interfaces. After `npm run dev`, the terminal prints a LAN URL such as:

```text
On another device (same network): http://192.168.x.x:3000
```

Open that URL on a phone or another laptop on the same network.

## Production build

```bash
npm run build
npm start
```

Then open http://localhost:3000 (or the LAN URL printed in the terminal).

## Scripts

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Development server             |
| `npm run build` | Production build               |
| `npm start`     | Run the production build       |
| `npm run lint`  | Typecheck                      |
| `npm run clean` | Delete the `dist` folder       |

## MongoDB connection

If the app starts but you see `MongoDB connection error`, the new network’s IP may not be allowed on Atlas. In [MongoDB Atlas](https://cloud.mongodb.com) → Network Access, allow the current IP (or `0.0.0.0/0` for development). **Do not change the database URI.**
