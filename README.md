# CVWO Web Forum Application

This is a simple web forum application developed as part of CVWO's winter assignment. The application includes a React frontend, a Go (Gin) backend, and a PostgreSQL database.

- **Deployed here**: [https://cvwo2025.netlify.app/](https://cvwo2025.netlify.app/)
- **Hosting**:
  - **Frontend**: Netlify
  - **Backend & Database**: Render

---

## **Features**

- User authentication
- Basic CRUD operations: Threads and comments (Comments as Threads)
- Tag and category management
- Like/dislike, Save functionality
- Search and Sorting functionality
- Light/Dark Theme
- Profile page with biography, metrics and scores
- Leaderboard of contribution scores (TBU)
- Backup automation

---

## **Setup Instructions**

### **Prerequisites**

Ensure the following tools are installed on your machine:

- **Node.js** (v16 or later) and **npm/yarn**
- **Go** (v1.20 or later)
- **PostgreSQL** (if running locally)

---

## **Local Development**

### **Environment Configuration**

#### **Backend .env**

Create a `.env` file in the `backend` directory with the following variables:

```env
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=your-password
PG_DB=your-database-name
PG_PORT=5432
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=your_database_url
```

#### **Frontend .env**

Create a `.env` file in the `frontend` directory with the following variable:

```env
REACT_APP_API_URL=http://localhost:8080
```

### **Backend Setup**

1. Clone the repository:

   ```bash
   git clone https://github.com/IceyFoxes/CVWO
   ```

2. Navigate to the backend folder:

   ```bash
   cd backend
   ```

3. Install dependencies (if applicable):

   ```bash
   go mod tidy
   ```

4. Start the backend:

   ```bash
   go run main.go
   ```

   The backend will use the local database specified in the `.env` file and listen on [http://localhost:8080](http://localhost:8080).

### **Frontend Setup**

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Run the frontend:

   ```bash
   yarn start
   ```

   The frontend will be available at [http://localhost:3000](http://localhost:3000).

### **Database Setup**

1. Install PostgreSQL if not already installed.

2. Start the PostgreSQL service and create a user and database:

   ```bash
   psql -U postgres
   CREATE DATABASE <database_name>;
   ```

3. Use the following format to construct your `DATABASE_URL`:

   ```bash
   postgres://postgres:<password>@localhost:<port>/<database_name>?sslmode=disable
   ```

   Replace `<password>`, `<port>` (default is `5432`), and `<database_name>` with your database details.

---

## **Deployment**

### **Environment Configuration**

#### **Backend .env**

Create a `.env` file in the `backend` directory with the following variables:

```env
PG_HOST=your-database-host
PG_USER=your-database-username
PG_PASSWORD=your-database-password
PG_DB=your-database-name
PG_PORT=5432
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=your_database_url
```

#### **Frontend .env**

Create a `.env` file in the `frontend` directory with the following variable:

```env
REACT_APP_API_URL=https://your-backend-url
```

### **Backend Deployment**

1. Deploy the backend to Render:

   - Push your backend code to a GitHub repository.
   - Create a new Web Service on Render and connect it to your repository.
   - Configure the environment variables in Render using the `.env` values.

2. Update the `DATABASE_URL` with the connection string provided by Render.

### **Frontend Deployment**

1. Deploy the frontend to Netlify:
   - Push your frontend code to a GitHub repository.
   - Create a new site on Netlify and connect it to your repository.
   - Configure the environment variable `REACT_APP_API_URL` in Netlify to point to your deployed backend.

---

### **Backup Automation**

1. Ensure the `backup.bat` script is in the root directory of your backend project.

2. Open Windows Task Scheduler:

   - Press `Win + R`, type `taskschd.msc`, and press Enter.

3. Create a new task:

   - **General Tab**: Provide a name (e.g., `PostgreSQL Backup`) and select "Run whether user is logged on or not."
   - **Triggers Tab**: Add a schedule (e.g., daily at 2:00 AM).
   - **Actions Tab**: Add an action to "Start a program" and browse to the `backup.bat` file.
   - **Conditions Tab**: Uncheck "Start the task only if the computer is on AC power" if running on a server.

4. Save the task. Ensure the `backup.bat` script points to your PostgreSQL database.

5. To restore the database from a `.dump` file:

   - For **local** database:

     ```bash
     pg_restore -h localhost -U $PG_USER -d $PG_DB --clean --no-owner <path-to-backup.dump>
     ```

   - For **Render** deployed database:

     ```bash
     pg_restore -h $PG_HOST -p 5432 -U $PG_USER -d $PG_DB --clean --no-owner <path-to-backup.dump>
     ```

   - Replace `<path-to-backup.dump>` with the path to your backup file.

   - Update the variables accordingly.

   - This will drop existing database objects and recreate them based on the dump file.

---

### **Troubleshooting**

- **Backend not starting?**

  - Check the `.env` file for missing or incorrect variables.
  - Ensure PostgreSQL is running and accessible.

- **Frontend not connecting to backend?**

  - Verify `REACT_APP_API_URL` in the frontend `.env` file.
  - Check CORS configuration in the backend.

- **Backup issues?**

  - Ensure PostgreSQL credentials in `.env` are correct.
  - Verify the `backup.bat` script and Task Scheduler setup.

---

If you encounter any issues, feel free to contact me or create an issue in the repository. 🚀
