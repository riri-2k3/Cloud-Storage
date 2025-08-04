# ☁️ CloudStore – Secure Cloud File Manager

A **full-stack cloud storage web app** that lets users securely upload, preview, download, and delete files. Built using **React.js**, **Node.js**, **Express**, **MongoDB**, and **AWS S3**, it ensures secure access through **JWT-based authentication** and robust backend validations.

---

## 🚀 Features

- 🔐 **Authentication (JWT)** – User login & registration with token-based access
- ☁️ **Upload to AWS S3** – Secure cloud storage integration
- 👁️ **File Preview** – Inline preview for images, PDFs, and text files
- 📥 **Download & Delete** – Secure file actions with confirmation prompts
- 📂 **Drag & Drop Upload** – Modern file upload experience
- 🔍 **Search Files** – Filter uploaded files by name
- ✅ **Status Feedback** – Inline success/error notifications

---

## 🛠️ Tech Stack

| Layer      | Tools & Libraries                             |
|------------|-----------------------------------------------|
| Frontend   | React, HTML/CSS, React Hooks                  |
| Backend    | Node.js, Express.js, Mongoose                 |
| Database   | MongoDB (via Mongoose)                        |
| Auth       | JSON Web Tokens (JWT), Bcrypt                 |
| Storage    | AWS S3                                        |
| Middleware | Custom Error Handling, Token Validation       |

---

## 📁 Supported File Types & Limits

| Category        | Types                                 | Max Size |
|------------------|----------------------------------------|----------|
| Images           | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` | 50 MB    |
| Documents        | `.pdf`, `.docx`, `.txt`, `.csv`        | 50 MB    |
| Presentations    | `.ppt`, `.pptx`                        | 50 MB    |
| Spreadsheets     | `.xls`, `.xlsx`                        | 50 MB    |

> ❗ Files above 50MB or with unsupported types will be rejected.

---

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cloudstore.git
cd cloudstore
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Create `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
CLIENT_URL=http://localhost:3000
```

#### Start the backend:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## 🧾 API Endpoints

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | `/api/users/register` | Register new user           |
| POST   | `/api/users/login`    | Login user & receive token  |
| GET    | `/api/files`          | List all uploaded files     |
| POST   | `/api/files/upload`   | Upload a new file           |
| DELETE | `/api/files/:id`      | Delete a file by ID         |
| GET    | `/api/files/:id/download` | Download a file        |
| GET    | `/api/users/verify`   | Check if token is valid     |

All `/api/files/*` routes require the `Authorization: Bearer <token>` header.

---

## 📂 Project Structure

```
cloudstore/
├── backend/
│   ├── routes/
│   │   ├── files.js
│   │   └── user.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── *.css
├── README.md
```

---

## 🖼️ Screenshots

> *(You can add these later)*

- Login/Signup Page
- File Upload & Preview
- Search Interface
- Error Notifications

---

## 📌 Deployment Tips

- **Frontend**: Deploy via [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- **Backend**: Use [Render](https://render.com), [Railway](https://railway.app), or [Heroku](https://heroku.com)
- **Database**: Host MongoDB via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Storage**: Use AWS S3 (IAM credentials + bucket setup required)

Ensure to configure production environment variables securely in your hosting platform.

---

## 🔮 Future Enhancements

- 📦 Folder-based file organization
- 🌐 Public/Private file sharing
- 🔑 Password-protected download links
- 📊 File usage dashboard
- 📱 Mobile responsive design
- 🧠 AI-assisted file tagging (coming soon?)

---

## 👩‍💻 Author

**Hrishika Singh**  
B.Tech, IIIT Allahabad  
GitHub: [@riri-2k3](https://github.com/riri-2k3)

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
