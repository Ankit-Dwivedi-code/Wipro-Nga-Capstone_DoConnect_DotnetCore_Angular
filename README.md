# DoConnect — Capstone Submission

A Q&A platform built with **ASP.NET Core Web API (.NET 9)** + **Angular**. Users can register, log in, post questions, attach images, answer, and an **Admin** can moderate content.



## 1) Features 
- JWT authentication (register / login)
- Roles: **User**, **Admin**
- Post Questions & Answers
- Basic search for questions (e.g., `GET /api/questions?q=...`)
- Image uploads for Questions/Answers → files saved under `wwwroot/uploads`
- Admin moderation endpoints for approval/rejection (see Swagger)
- Angular front-end with routes for auth, questions, answers, admin dashboard
- Swagger API docs enabled

## 2) Tech stack
- **Backend**: ASP.NET Core Web API (C# / .NET 9), EF Core (SQL Server)
- **Frontend**: Angular
- **DB**: SQL Server
- **Tests**: xUnit (+ Moq/FluentAssertions) if included in your solution

## 3) Project structure (top-level)
```
DoConnect.Api/                # ASP.NET Core Web API
doconnect-frontend/           # Angular app
DoConnect.Tests/              # xUnit tests (if present)
docs/                         # (this folder) ERD, screenshots, docs
```

## 4) Prerequisites
- .NET 9 SDK
- Node.js 20+ & npm
- SQL Server (localdb or full instance)

## 5) Local quick start

### 5.1 Configure database
- Edit **`DoConnect.Api/appsettings.json`** → `ConnectionStrings.DefaultConnection` to point to your SQL Server.
- Create / update DB schema:
  ```bash
  cd DoConnect.Api
  dotnet ef database update
  ```

### 5.2 Run the API
```bash
cd DoConnect.Api
dotnet run
```
- Default swagger: `http://localhost:5108/swagger` (adjust to your launch profile/port)
- The project seeds a default **Admin** (if your `Program.cs` seeding is present):
  - **Username**: `admin`
  - **Email**: `admin@doconnect.local`
  - **Password**: `Admin@123`

### 5.3 Run the Angular app
- Update **`src/environments/environment.ts`** (and `environment.prod.ts`) e.g.:
  ```ts
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:5108/api',
    apiOrigin: 'http://localhost:5108'
  };
  ```
- Install & start:
  ```bash
  cd doconnect-frontend
  npm install
  npm start # or: ng serve
  ```
- Visit `http://localhost:4200`

## 6) API docs
- Browse **Swagger** at your API URL → `/swagger`
- Import the included **Postman collection** (`docs/DoConnect.postman_collection.json`) and set the `{{baseUrl}}` variable (e.g., `http://localhost:5108`).

## 7) Tests (if included)
```bash
dotnet test
```

## 8) ERD & Architecture
- See **docs/ERD.png** for the data model (Users, Questions, Answers, ImageFiles and relationships).
- Typical flow: *User registers → logs in → asks question (+images) → another user answers (+images) → Admin approves → content visible in lists*.

## 9) Submission checklist
- [x] Source code for API and Angular
- [x] Database migrations included
- [x] Swagger enabled
- [x] README + User Guide 
- [x] ERD image included
- [x] Postman collection included
- [x] Test project present 

## 10) Known limits 
- No rate limiting
- No real-time notifications (SignalR) yet
- Image validation (size/type) may be basic depending on your current code
- Cleanup of orphaned image files may require manual handling if you delete entities
- Pagination/sorting might be basic or absent (use as-is or adapt per Swagger)

## 11) Future work (nice to have)
- Real-time notifications for new answers (SignalR)
- Tags, bookmarks, voting, user profiles
- Rich moderation tools & audit logs
- Advanced search & filters
- Docker + docker-compose for one-command run
- CI pipeline

---

### Maintainers
- Ankit Dwivedi (owner)
- Stack: .NET 9 / Angular
