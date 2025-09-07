# DoConnect — User Guide

This is a concise guide for reviewers and users to exercise the app quickly.

## 1) Roles & Login

- **Admin**
  - Email: `admin@doconnect.local`
  - Username - `admin`
  - Password: `Admin@123`
  - Use to approve/reject content.

- **User**
  - Register a new user from the UI or via API (`/api/auth/register`).

## 2) Typical Scenarios

### A) Register → Login
1. Open the app → go to **Register**.
2. Enter username, email, password (8+ characters).
3. After success, go to **Login**.
4. Enter email + password → you’re logged in.

### B) Ask a Question (with images)
1. Navigate to **Ask** page.
2. Fill **Title** and **Text**.
3. Upload 1–n images.
4. Submit → question is created (Pending for normal user autoapproved for admin).

### C) Answer a Question
1. Open a question’s detail page.
2. Type your answer; optionally upload images.
3. Submit.

### D) Admin Moderation
1. Login as **Admin**.
2. Open **Admin Dashboard**.
3. Approve/Reject questions and/or answers.
4. Approved content becomes visible in lists for all users.

### E) Search
- Use the search on the Questions list (or call `GET /api/questions?q=term`).

## 3) API Quick Reference (see Swagger for full details)

### Auth
- `POST /api/auth/register` — `{ username, email, password }`
- `POST /api/auth/login` — `{ email, password }` → returns `{ token, user }`

### Questions
- `GET /api/questions` — optional `?q=searchTerm`
- `POST /api/questions` — (auth) create a question
- `POST /api/questions/{id}/images` — (auth) multipart form `file=<image>`
- `DELETE /api/questions/{id}` — (admin)

### Answers
- `GET /api/answers?questionId={guid}`
- `POST /api/answers?questionId={guid}` — (auth)
- `POST /api/answers/{id}/images` — (auth)
- `DELETE /api/answers/{id}` — (admin)



## 4) Troubleshooting
- If Angular can’t load images, ensure `environment.apiOrigin` is set to your API base (e.g., `http://localhost:5108`).  
- If DB connection fails, verify `ConnectionStrings.DefaultConnection` and that SQL Server is running.
- If builds fail due to file lock on Windows, stop the running API process before rebuilding (`taskkill /IM DoConnect.Api.exe /F`).

## 5) Demo Script (2–5 minutes)
1. Start API (`dotnet run`) and Angular (`ng serve`).
2. Show Swagger → `/swagger`.
3. Register user → log in from UI.
4. Ask a question + upload an image.
5. Log out → log in as Admin; approve the question.
6. Log back in as the user; open the question and post an answer.
7. Use search to find the question by title term.
8. Show that images appear (from `/uploads/...`) and are accessible.
