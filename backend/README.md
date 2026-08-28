# ⚙️ ProjectGuide-AI — Backend API Specifications

This directory is designated for the backend service (Node.js/Express, Python/FastAPI, Go, or Java Spring Boot).

---

## 📋 REST API Endpoints Contract

### 1. 🔐 Authentication (`/api/auth`)
- **`POST /api/auth/register`**
  - **Body**: `{ "name": "Arjun Sharma", "email": "arjun@college.edu", "password": "...", "role": "student", "rollNo": "21CS101" }`
  - **Response**: `{ "token": "JWT...", "user": { ... } }`
- **`POST /api/auth/login`**
  - **Body**: `{ "email": "arjun@college.edu", "password": "..." }`
  - **Response**: `{ "token": "JWT...", "user": { ... } }`

---

### 2. 👤 Student Profile (`/api/profile`)
- **`GET /api/profile/me`**
  - Returns current user profile with skills, domain interests, year, and team size.
- **`PUT /api/profile/me`**
  - **Body**:
    ```json
    {
      "firstName": "Arjun",
      "lastName": "Sharma",
      "branch": "Computer Science & Engineering",
      "year": "3rd Year",
      "skills": { "python": 4, "react": 3, "ml": 3 },
      "otherSkills": "Rust, GraphQL",
      "domains": ["aiml", "web"],
      "otherDomains": "Quantum Computing",
      "aboutMe": "Interested in building computer vision models",
      "teamSize": 3,
      "avatarUrl": "https://..."
    }
    ```

---

### 3. 💡 Projects & Roadmaps (`/api/projects`)
- **`GET /api/projects`**
  - Returns all projects belonging to the student.
- **`POST /api/projects`**
  - Submits a new project idea.
  - **Body**:
    ```json
    {
      "title": "Smart Attendance System",
      "desc": "Facial recognition attendance system with analytics.",
      "domain": "aiml",
      "durationDays": 30,
      "teamSize": 3
    }
    ```
  - **Logic**: Calls the `/ai-agent` service to generate:
    - `feasibility`: Integer (0–100)
    - `techStack`: Array of suggested frameworks/tools
    - `milestones`: Generated milestone array based on `durationDays`.
- **`PUT /api/projects/:id`**
  - Updates title, description, or duration.
- **`PATCH /api/projects/:id/milestone`**
  - Updates completed milestone index.

---

### 4. 👨‍🏫 Faculty Endpoints (`/api/faculty`)
- **`GET /api/faculty/students`**
  - Returns list of assigned students with their projects, progress, and review statuses.
- **`POST /api/faculty/review/:projectId`**
  - **Body**: `{ "action": "approve" | "request_revision", "feedback": "Looks great, ensure tests are written." }`
- **`POST /api/faculty/broadcast`**
  - **Body**: `{ "message": "Reminder: Phase 2 deliverables due this Friday." }`

---

### 5. 🤖 AI Chat Mentor (`/api/chat`)
- **`POST /api/chat/message`**
  - **Body**: `{ "projectId": 123, "message": "How do I structure my FastAPI routes?" }`
  - **Response**: `{ "reply": "...", "timestamp": "2026-08-28T..." }`
