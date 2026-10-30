-- Day 6: School database (SQLite)
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- 1. TABLES ---------------------------------------------------------

CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  course_id INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  credits   INTEGER NOT NULL
);

CREATE TABLE enrolments (
  enrolment_id INTEGER PRIMARY KEY,
  student_id   INTEGER NOT NULL,
  course_id    INTEGER NOT NULL,
  grade        TEXT,  -- NULL until a grade is given
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id)  REFERENCES courses(course_id),
  UNIQUE (student_id, course_id)  -- same student cannot join the same course twice
);

-- 2. SAMPLE DATA ----------------------------------------------------

INSERT INTO students (student_id, first_name, last_name, email) VALUES
  (1, 'Amina', 'Otieno', 'amina.otieno@school.test'),
  (2, 'Brian', 'Kamau',  'brian.kamau@school.test'),
  (3, 'Chebet', 'Korir', 'chebet.korir@school.test'),
  (4, 'David', 'Mwangi', 'david.mwangi@school.test');

INSERT INTO courses (course_id, title, credits) VALUES
  (1, 'Web Foundations', 4),
  (2, 'Databases', 3),
  (3, 'Mathematics', 3);

INSERT INTO enrolments (student_id, course_id, grade) VALUES
  (1, 1, 'A'),
  (1, 2, 'B'),
  (2, 1, 'B'),
  (2, 3, NULL),
  (3, 1, 'A');

-- 3. QUERIES --------------------------------------------------------

-- Q1: all courses for one student (by name)
SELECT c.title, c.credits, e.grade
FROM students s
JOIN enrolments e ON e.student_id = s.student_id
JOIN courses c    ON c.course_id  = e.course_id
WHERE s.first_name = 'Amina' AND s.last_name = 'Otieno';

-- Q2: all students on one course
SELECT s.first_name, s.last_name, s.email, e.grade
FROM courses c
JOIN enrolments e ON e.course_id  = c.course_id
JOIN students s   ON s.student_id = e.student_id
WHERE c.title = 'Web Foundations';

-- Q3: number of students per course (courses with none show 0)
SELECT c.title, COUNT(e.enrolment_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON e.course_id = c.course_id
GROUP BY c.course_id, c.title;

-- Q4: students who have no enrolments
SELECT s.student_id, s.first_name, s.last_name
FROM students s
LEFT JOIN enrolments e ON e.student_id = s.student_id
WHERE e.enrolment_id IS NULL;

-- Q5: update one enrolment's grade (Brian's Mathematics grade)
UPDATE enrolments
SET grade = 'C'
WHERE student_id = (SELECT student_id FROM students WHERE email = 'brian.kamau@school.test')
  AND course_id  = (SELECT course_id FROM courses WHERE title = 'Mathematics');

-- Check the update
SELECT s.first_name, c.title, e.grade
FROM enrolments e
JOIN students s ON s.student_id = e.student_id
JOIN courses c  ON c.course_id  = e.course_id
WHERE s.email = 'brian.kamau@school.test';
