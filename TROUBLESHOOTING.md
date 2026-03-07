# Troubleshooting Server Connection

If you see "Server Connection Failed" or cannot log in, please follow these steps:

## 1. Ensure MongoDB is Running
The application requires a local MongoDB database.
1.  Open a new terminal.
2.  Run `mongod` (or start MongoDB service via Task Manager/Services).
3.  If MongoDB is not installed, download and install MongoDB Community Server.

## 2. Check Backend Server
1.  Open a terminal in the `backend` folder.
2.  Run `node server.js`.
3.  You should see:
    ```
    Server running on port 5000
    MongoDB Connected
    ```
    If you see error messages about connection, MongoDB is not running.

## 3. Seed Database (Optional)
If you need test users:
1.  Ensure MongoDB and Backend are running.
2.  In `backend` folder, run `node seed.js`.

## 4. Check Frontend
1.  In the root folder, run `npm run dev`.
2.  Open http://localhost:5173/.

## 5. Verify API
Open http://localhost:5000/ in your browser. You should see "IVF Patient Companion API Running".
