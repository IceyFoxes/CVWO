Zhang Li Kevin
E1406431@u.nus.edu

Description

This is a simple web forum application developed as part of CVWO's winter assignment. The application uses a React frontend and a Go (Gin) backend with SQLite as the database.

Setup Instructions

Prerequisites

    Node.js (v16 or later) and npm/yarn installed

    Go (v1.20 or later) installed

    SQLite installed or included with your system

Backend Setup

Clone the repository

    git clone https://github.com/IceyFoxes/CVWO

Navigate to the backend folder

    cd backend

Run the backend

    go run main.go

The backend will run on http://localhost:8080.

Frontend Setup

Navigate to the frontend folder

    cd frontend

Install dependencies

    npm install

Run the frontend

    npm start

The frontend will be available on http://localhost:3000.

Backup Setup

Open Windows Task Scheduler (Win + R, type taskschd.msc, press Enter).

Click Create Task.

In the General tab:

    Provide a name.

    Select "Run whether user is logged on or not."

In the Triggers tab:

    Click New and set the schedule.

In the Actions tab:

    Click New.

    Select Start a Program.

    Browse to the backup.bat file.

In the Conditions tab:

    Uncheck "Start the task only if the computer is on AC power" if running on a server.

Save the task.

If you encounter any issues, feel free to contact me.
