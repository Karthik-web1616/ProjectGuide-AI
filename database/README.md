# 🗄️ ProjectGuide-AI — Database Schema & Models

This directory contains the database migration scripts, ORM schemas (Prisma, SQLAlchemy, Mongoose, TypeORM), and sample seeds for PostgreSQL / MySQL / MongoDB.

---

## 📊 Relational Entity Model (ERD)

### 1. `users`
- `id`: UUID / Serial Primary Key
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `role`: ENUM('student', 'faculty', 'admin') NOT NULL
- `created_at`: TIMESTAMP DEFAULT NOW()

### 2. `profiles`
- `id`: UUID / Serial Primary Key
- `user_id`: Foreign Key (`users.id`) ON DELETE CASCADE
- `first_name`: VARCHAR(100)
- `last_name`: VARCHAR(100)
- `roll_number`: VARCHAR(50)
- `branch`: VARCHAR(100)
- `year_of_study`: VARCHAR(50)
- `skills`: JSONB / JSON (e.g. `{"python": 4, "react": 3}`)
- `other_skills`: TEXT
- `domains`: VARCHAR[] / JSONB
- `other_domains`: TEXT
- `about_me`: TEXT
- `team_size`: INTEGER DEFAULT 3
- `avatar_url`: VARCHAR(500)

### 3. `projects`
- `id`: UUID / Serial Primary Key
- `student_id`: Foreign Key (`users.id`) ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `description`: TEXT NOT NULL
- `domain`: VARCHAR(100)
- `duration_days`: INTEGER DEFAULT 30
- `team_size`: INTEGER DEFAULT 3
- `feasibility_score`: INTEGER
- `tech_stack`: JSONB / VARCHAR[]
- `status`: ENUM('draft', 'review', 'active', 'submitted', 'completed') DEFAULT 'review'
- `submitted_at`: TIMESTAMP DEFAULT NOW()

### 4. `milestones`
- `id`: UUID / Serial Primary Key
- `project_id`: Foreign Key (`projects.id`) ON DELETE CASCADE
- `phase_order`: INTEGER NOT NULL
- `phase_label`: VARCHAR(100) -- e.g. "Day 1–10" or "Week 1"
- `title`: VARCHAR(255) NOT NULL
- `description`: TEXT
- `is_completed`: BOOLEAN DEFAULT FALSE
- `completed_at`: TIMESTAMP

### 5. `faculty_feedback`
- `id`: UUID / Serial Primary Key
- `project_id`: Foreign Key (`projects.id`) ON DELETE CASCADE
- `faculty_id`: Foreign Key (`users.id`) ON DELETE CASCADE
- `feedback_text`: TEXT NOT NULL
- `decision`: ENUM('approved', 'changes_requested')
- `created_at`: TIMESTAMP DEFAULT NOW()
