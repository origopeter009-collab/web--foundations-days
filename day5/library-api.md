# Library API Design: Books Resource

Base path: `/books`. Requests and responses use JSON.

Example book:

```json
{
  "id": 12,
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "isbn": "9780385474542",
  "year": 1958,
  "available": true
}
```

## Endpoints

### 1. List books

- **Method:** GET
- **Path:** `/books`
- **Description:** Returns all books in the library.
- **Request body:** none
- **Success status:** 200 OK

### 2. Get one book

- **Method:** GET
- **Path:** `/books/{id}` (for example `/books/12`)
- **Description:** Returns the single book with that id.
- **Request body:** none
- **Success status:** 200 OK

### 3. Create a book

- **Method:** POST
- **Path:** `/books`
- **Description:** Adds a new book; the server assigns the `id`.
- **Request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "isbn": "9780385474542",
  "year": 1958
}
```

- **Success status:** 201 Created

### 4. Update a book (full replace)

- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Replaces all fields of an existing book.
- **Request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "isbn": "9780385474542",
  "year": 1958,
  "available": false
}
```

- **Success status:** 200 OK

### 5. Update a book (partial)

- **Method:** PATCH
- **Path:** `/books/{id}`
- **Description:** Changes only the fields that are sent.
- **Request body:**

```json
{
  "available": false
}
```

- **Success status:** 200 OK

### 6. Delete a book

- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Removes the book from the library.
- **Request body:** none
- **Success status:** 204 No Content

### 7. List books by author

- **Method:** GET
- **Path:** `/books?author={name}` (for example `/books?author=Chinua%20Achebe`)
- **Description:** Returns only the books written by that author, using a query parameter on the same `/books` path.
- **Request body:** none
- **Success status:** 200 OK (an empty list `[]` if the author has no books)

## Error codes

### 400 Bad Request

- **Meaning:** The request is malformed or contains invalid data.
- **Example:** `POST /books` with no `title`, or with `"year": "abc"` instead of a number.
- **Example:** `GET /books/abc` when the id must be a number.

### 404 Not Found

- **Meaning:** The requested book does not exist.
- **Example:** `GET /books/9999` when no book has id 9999.
- **Example:** `PUT /books/9999` or `DELETE /books/9999` for a missing book.

Example error response:

```json
{
  "error": "Not Found",
  "message": "No book with id 9999 exists."
}
```
