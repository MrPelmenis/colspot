# Database Design

## ER Diagram
The following tables represent the entities in the database, including users, posts (spots), comments, pictures, and likes. 

---

## Tables

### 1. **User**
Represents the users who can be either administrators or regular users.

| Column      | Type    | Description                              |
|-------------|---------|------------------------------------------|
| `is_admin`  | BOOL    | Indicates if the user is an admin (`True` for admin, `False` for regular users) |
| `id`        | INT     | Primary key, unique identifier for the user |
| `nickname`  | STRING  | Username or nickname of the user |
| `email`     | STRING  | User's email address |
| `profile_pic`| BIN    | Binary data representing the user's profile picture |

---

### 2. **Post (Spot)**
Represents a "spot" or location added by users.

| Column      | Type        | Description                              |
|-------------|-------------|------------------------------------------|
| `id`        | INT         | Primary key, unique identifier for the post |
| `name`      | STRING      | Name of the spot |
| `description`| STRING     | Detailed description of the spot |
| `geolocation`| STRING     | Geolocation coordinates of the spot (latitude/longitude) |
| `user_id`   | INT         | Foreign key referencing the `User` who created the spot |
| `karma`     | INT         | Karma points (upvotes or downvotes) assigned to the spot |
| `time`      | DATETIME    | Timestamp of when the spot was posted |

---

### 3. **Comment**
Represents comments that users can leave on posts (spots).

| Column      | Type        | Description                              |
|-------------|-------------|------------------------------------------|
| `id`        | INT         | Primary key, unique identifier for the comment |
| `post_id`   | INT         | Foreign key referencing the `Post (Spot)` |
| `user_id`   | INT         | Foreign key referencing the `User` who made the comment |
| `text`      | STRING      | The content of the comment |
| `time`      | DATETIME    | Timestamp when the comment was created |
| `karma`     | INT         | Karma points associated with the comment |

---

### 4. **Picture**
Represents pictures uploaded for a specific spot.

| Column      | Type        | Description                              |
|-------------|-------------|------------------------------------------|
| `id`        | INT         | Primary key, unique identifier for the picture |
| `post_id`   | INT         | Foreign key referencing the `Post (Spot)` |
| `picture`   | BIN         | Binary data representing the picture file |

---

### 5. **Likes**
Tracks which users have liked specific posts.

| Column      | Type        | Description                              |
|-------------|-------------|------------------------------------------|
| `id`        | INT         | Primary key, unique identifier for the like |
| `user_id`   | INT         | Foreign key referencing the `User` who liked the post |
| `post_id`   | INT         | Foreign key referencing the `Post (Spot)` that was liked |

---

### 6. **Comment Likes**
Tracks likes associated with specific comments.

| Column        | Type    | Description                              |
|---------------|---------|------------------------------------------|
| `id`          | INT     | Primary key, unique identifier for the like |
| `user_id`     | INT     | Foreign key referencing the `User` who liked the comment |
| `comment_id`  | INT     | Foreign key referencing the `Comment` that was liked |

---

## Relationships

- A **User** can create multiple **Posts (Spots)**.
- A **User** can leave multiple **Comments** on **Posts (Spots)**.
- A **Post (Spot)** can have multiple **Comments** and **Pictures**.
- A **User** can like multiple **Posts (Spots)** and **Comments**.
- A **Post (Spot)** can receive multiple **Likes**.
- A **Comment** can receive multiple **Likes**.

---

## Future Improvements

- **Search indexing:** Consider indexing columns like `geolocation` and `name` in the `Post (Spot)` table to allow for efficient searching.
- **Karma aggregation:** Add triggers to automatically update `karma` for posts and comments when new likes are added.

