# To-Do List Web Application

A full-stack To-Do List application built with **Node.js**, **Express**, **MySQL**, and a responsive **frontend** using vanilla JavaScript, HTML, and CSS. This application allows users to manage their tasks efficiently with features like user authentication, task prioritization, and filtering.

## Features

### Backend
- **User Authentication**: Register, login, and secure sessions using JWT.
- **Task Management**: Create, read, update, delete, and toggle task completion.
- **Database Integration**: MySQL database with schema initialization.
- **Validation & Security**:
  - Input validation using `express-validator`.
  - Password hashing with `bcryptjs`.
  - Protection against SQL injection with parameterized queries.
- **Error Handling**: Centralized error handling for consistent API responses.

### Frontend
- **Responsive Design**: Mobile-friendly UI with a clean and modern layout.
- **Task Filters**: Filter tasks by priority and completion status.
- **Notifications**: Real-time feedback for user actions.
- **Loading Indicators**: Visual cues during API calls.
- **Local Storage**: Persistent user sessions.

## Prerequisites

- **Node.js**: v14 or higher
- **MySQL**: v5.7 or higher
- **npm**: v6 or higher

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/todo-list-web-app.git
   cd todo-list-web-app
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `backend` directory with the following variables:
     ```properties
     PORT=3000
     JWT_SECRET=your_jwt_secret_key
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASSWORD=your_mysql_password
     DB_NAME=todo_app
     DB_PORT=3306
     ```
   - Initialize the database:
     - Option 1: Run the SQL script in `backend/database/init.sql`.
     - Option 2: Start the server, and the database tables will be created automatically.

   - Start the backend server:
     ```bash
     npm start
     ```
     For development with auto-restart:
     ```bash
     npm run dev
     ```

3. **Frontend Setup**:
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Update the `config.js` file with your backend server's DNS or IP:
     ```javascript
     window.env = {
         BACKEND_DNS: "localhost"
     }
     ```
   - Open `index.html` in your browser to access the application.

## API Endpoints

### Authentication
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Get Profile**: `GET /api/auth/profile`

### Tasks
- **Get All Tasks**: `GET /api/tasks`
- **Create Task**: `POST /api/tasks`
- **Update Task**: `PUT /api/tasks/:id`
- **Delete Task**: `DELETE /api/tasks/:id`
- **Toggle Completion**: `PATCH /api/tasks/:id/toggle`

## Project Structure

```
To-Do List Web App/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # API controllers
│   ├── middlewares/     # Custom middleware
│   ├── routes/          # API routes
│   ├── database/        # SQL scripts
│   ├── server.js        # Entry point for backend
│   └── .env             # Environment variables
├── frontend/
│   ├── index.html       # Login/Register page
│   ├── dashboard.html   # Task management page
│   ├── styles.css       # Styling for the application
│   ├── config.js        # Frontend configuration
│   ├── api.js           # API service
│   ├── auth.js          # Authentication logic
│   └── todo.js          # Task management logic
└── README.md            # Project documentation
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## Contact

For any inquiries or feedback, please contact [muhamadmamoun@gmail.com].
