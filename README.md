# PolariX - Personal Finance Manager

PolariX is a personal finance management application built with **HTML, CSS, JavaScript** (frontend) and **Node.js, Express, MongoDB Atlas** (backend).  
It helps users track **income, expenses, assets, liabilities, and savings** with dynamic graphs and data persistence.

---

## 🚀 Features
- User Registration & Login (secure authentication).
- Add, edit, and delete transactions (income & expenses).
- Auto-generate and update user-specific Excel sheets.
- Dynamic charts for:
  - Income vs Expense
  - Assets vs Liabilities
  - Total Savings
- Data stored in **MongoDB Atlas** (cloud).
- Clean and responsive UI.

---

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Other:** Chart.js (for graphs), ExcelJS (for Excel file handling)

---

## 📂 Project Structure
```
PolariX/
│── public/          # Static frontend files (HTML, CSS, JS)
│── routes/          # Express route handlers
│── models/          # Mongoose models
│── controllers/     # Business logic
│── utils/           # Helper functions (Excel handling, etc.)
│── .env             # Environment variables (Mongo URI, secrets)
│── server.js        # Main entry point
│── package.json     # Dependencies & scripts
```

---

## ⚙️ Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/polarix.git
   cd polarix
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   MONGO_URI=your-mongodb-atlas-uri
   PORT=5000
   SESSION_SECRET=your-secret-key
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open `http://localhost:5000` in your browser.

---

## 🤝 Contributing
We welcome contributions!  
Please read the [Contributing Guidelines](CONTRIBUTING.md) and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

---
