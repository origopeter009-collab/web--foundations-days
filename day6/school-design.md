# School Database Design

## Tables

- **students**: one row per student. Columns: `student_id` (primary key), `first_name`, `last_name` and `email`. The email is `NOT NULL` and `UNIQUE`, so two students cannot share one.
- **courses**: one row per course. Columns: `course_id` (primary key), `title` and `credits`.
- **enrolments**: one row for each time a student takes a course. Columns: `enrolment_id` (primary key), `student_id` and `course_id` (both foreign keys), and `grade`. The grade is empty (`NULL`) until one is given. A `UNIQUE (student_id, course_id)` rule stops the same student enrolling on the same course twice.

## Relationships

- **students to enrolments: one-to-many.** One student can have many enrolments, but each enrolment belongs to exactly one student.
- **courses to enrolments: one-to-many.** One course can have many enrolments, but each enrolment belongs to exactly one course.
- **students to courses: many-to-many.** A student takes many courses, and a course has many students.
- **Why a join table is needed:** a single table cannot hold a many-to-many link cleanly. Putting a list of courses in one student column would break the one-value-per-cell rule, and repeating student rows for each course would duplicate names and emails. The `enrolments` table sits in between and turns one many-to-many link into two one-to-many links. It is also the natural place to store data about the link itself, such as the grade.

## Index

- **Index to add:** `CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);`
- **Reason:** the `UNIQUE (student_id, course_id)` rule already creates an index that helps lookups by student. Lookups by course alone, such as "all students on one course" or "students per course", cannot use it well, so they would scan the whole enrolments table. An index on `course_id` keeps these queries fast as the number of enrolments grows.

## SQL or NoSQL?

I would choose SQL for this system. The data is structured and has clear relationships: students, courses and enrolments always have the same fields and link to each other. A relational database enforces these links with foreign keys, so an enrolment can never point to a student or course that does not exist. It also enforces rules such as unique emails and no duplicate enrolments, and it handles questions across tables easily with JOIN and GROUP BY, like students per course or students with no enrolments. Grades and enrolments also need to stay correct and consistent, which SQL transactions support well. NoSQL would be a better fit for very large, fast-changing or loosely structured data, such as activity logs or chat messages, but a school's records do not need that flexibility.
