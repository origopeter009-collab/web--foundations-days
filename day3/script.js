// Starting notes
const notes = [
  { id: 1, text: "Buy groceries for the week", category: "personal" },
  { id: 2, text: "Finish the project report", category: "work" },
  { id: 3, text: "Review JavaScript arrays", category: "study" },
  { id: 4, text: "Call the dentist", category: "personal" },
  { id: 5, text: "Practice array methods", category: "study" }
];

const CATEGORIES = ["personal", "work", "study"];

// Trim, collapse repeated spaces and lower-case so comparisons ignore case and extra spaces
function normalize(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

// Returns an array of notes whose text contains the word, ignoring case
function searchNotes(word) {
  const term = word.toLowerCase();
  return notes.filter(function (note) {
    return note.text.toLowerCase().includes(term);
  });
}

// Returns the note with the most characters, or null if there are no notes
function longestNote() {
  if (notes.length === 0) {
    return null;
  }
  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// Returns an object counting notes per category, e.g. { personal: 2, work: 1, study: 2 }
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category] === undefined) {
      counts[note.category] = 0;
    }
    counts[note.category] += 1;
  }
  return counts;
}

// Returns a sentence such as "5 notes: 2 personal, 1 work, 2 study."
function getSummary() {
  if (notes.length === 0) {
    return "0 notes.";
  }
  const counts = countByCategory();
  const parts = Object.keys(counts).map(function (category) {
    return `${counts[category]} ${category}`;
  });
  const noun = notes.length === 1 ? "note" : "notes";
  return `${notes.length} ${noun}: ${parts.join(", ")}.`;
}

// Returns true if a note with the same text already exists (ignoring case and extra spaces)
function isDuplicate(text) {
  const target = normalize(text);
  return notes.some(function (note) {
    return normalize(note.text) === target;
  });
}

// Adds a note if valid. Returns true when added, false otherwise (and logs the reason).
function addNote(text, category) {
  const clean = typeof text === "string" ? text.trim() : "";

  if (clean.length < 1 || clean.length > 200) {
    console.log("Not added: text must be 1-200 characters.");
    return false;
  }
  if (!CATEGORIES.includes(category)) {
    console.log("Not added: category must be personal, work or study.");
    return false;
  }
  if (isDuplicate(clean)) {
    console.log("Not added: a note with this text already exists.");
    return false;
  }

  const nextId = notes.length > 0 ? Math.max(...notes.map(function (n) { return n.id; })) + 1 : 1;
  notes.push({ id: nextId, text: clean, category: category });
  return true;
}

// ---------- Tests ----------

// searchNotes
console.log(searchNotes("array"));  // Expected: notes 3 and 5 (arrays / array)
console.log(searchNotes("ARRAY"));  // Expected: same two notes (case is ignored)
console.log(searchNotes("zzz"));    // Expected: [] (no results)

// longestNote
console.log(longestNote());         // Expected: { id: 1, text: "Buy groceries for the week", category: "personal" }
const saved = notes.splice(0);      // temporarily empty the array
console.log(longestNote());         // Expected: null (no notes)

// countByCategory (array is still empty here)
console.log(countByCategory());     // Expected: {} (no notes)
notes.push(...saved);               // restore the notes
console.log(countByCategory());     // Expected: { personal: 2, work: 1, study: 2 }

// getSummary
console.log(getSummary());          // Expected: "5 notes: 2 personal, 1 work, 2 study."
notes.splice(1);                    // keep only the first note
console.log(getSummary());          // Expected: "1 note: 1 personal."
notes.splice(0);                    // empty the array
console.log(getSummary());          // Expected: "0 notes."
notes.push(...saved);               // restore all five notes

// isDuplicate
console.log(isDuplicate("  call THE   dentist "));  // Expected: true (ignores case and extra spaces)
console.log(isDuplicate("Water the plants"));       // Expected: false (not in the list)
console.log(isDuplicate("   "));                    // Expected: false (blank text)

// addNote
console.log(addNote("Water the plants", "personal"));        // Expected: true
console.log(addNote("  water THE plants ", "personal"));     // Expected: false, logs "Not added: a note with this text already exists."
console.log(addNote("", "work"));                            // Expected: false, logs "Not added: text must be 1-200 characters."
console.log(addNote("a".repeat(201), "work"));               // Expected: false, logs "Not added: text must be 1-200 characters."
console.log(addNote("Plan the sprint", "hobby"));            // Expected: false, logs "Not added: category must be personal, work or study."
console.log(addNote("a".repeat(200), "study"));              // Expected: true (exactly 200 characters is allowed)
console.log(getSummary());                                   // Expected: "7 notes: 3 personal, 1 work, 3 study."
