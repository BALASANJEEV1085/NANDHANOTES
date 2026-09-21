# NANDHANOTES

## 📌 Project Overview

NANDHANOTES is a full-stack MERN application developed for college
students to store, manage, and share study notes and materials
efficiently.\
This project was **designed and developed by Bala Sanjeev C** as part of
academic and practical learning.

The application focuses on clean architecture, scalability, and
real-world usability.

------------------------------------------------------------------------

## 🚀 Features

-   User authentication (Login / Signup)
-   Create, read, update, and delete notes
-   Organized storage of study materials
-   Responsive and user-friendly interface
-   RESTful backend APIs

------------------------------------------------------------------------

## 🧱 Tech Stack

### Frontend

-   React.js
-   JavaScript (ES6+)
-   HTML5, CSS3
-   Tailwind CSS

### Backend

-   Node.js
-   Express.js
-   MongoDB

### Tools

-   Git & GitHub
-   Postman
-   VS Code

------------------------------------------------------------------------

## 📁 Project Structure

    NANDHANOTES/
    ├── frontend/
    ├── backend/
    ├── README.md

------------------------------------------------------------------------

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v14+)
-   MongoDB
-   Git

------------------------------------------------------------------------

## 📥 Installation & Setup

### Clone the Repository

``` bash
git clone https://github.com/BALASANJEEV1085/NANDHANOTES.git
cd NANDHANOTES
```

### Backend Setup

``` bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Frontend Setup

``` bash
cd ../frontend
npm install
npm start
```

Frontend runs at:

    http://localhost:3000

------------------------------------------------------------------------

## 🔌 API Testing

Use **Postman** to test APIs.

Example endpoints:

    POST /api/auth/login
    POST /api/auth/register
    GET  /api/notes
    POST /api/notes

------------------------------------------------------------------------

## 👨‍💻 Author

**Bala Sanjeev C**\
📧 Email: balasnjeev1085@gmail.com\
🔗 GitHub: https://github.com/BALASANJEEV1085

------------------------------------------------------------------------

## 📄 License

This project is licensed under the **MIT License**.
