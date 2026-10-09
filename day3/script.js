// Starting notes
const notes = [
  { id: 1, text: "Buy groceries for the week", category: "personal" },
  { id: 2, text: "Finish the project report", category: "work" },
  { id: 3, text: "Review JavaScript arrays", category: "study" },
  { id: 4, text: "Call the dentist", category: "personal" },
  { id: 5, text: "Practice array methods", category: "study" }
];

const CATEGORIES = ["personal", "work", "study"];

// Lowercase, trim and collapse repeated spaces so comparisons ignore case and extra spaces
function normalize(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

// Returns notes whose text contains the word (case-insensitive)
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
  return notes.reduce(function (longest, note) {
    return note.text.length > longest.text.length ? note : longest;
  });
}

// Returns an object counting notes per category, e.g. { personal: 2, work: 1, study: 2 }
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

// Returns a sentence such as "5 notes: 2 personal, 1 work, 2 study."
function getSummary() {
  const total = notes.length;
  const label = total === 1 ? "note" : "notes";
  if (total === 0) {
    return "0 notes.";
  }
  const counts = countByCategory();
  const parts = Object.keys(counts).map(function (category) {
    return counts[category] + " " + category;
  });
  return total + " " + label + ": " + parts.join(", ") + ".";
}

// True if a note with the same text exists (ignoring case and extra spaces)
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
console.log("--- searchNotes ---");
console.log("searchNotes('array') -> expect notes 3 and 5:", searchNotes("array"));
console.log("searchNotes('ARRAY') -> same result (ignores case):", searchNotes("ARRAY"));
console.log("searchNotes('zzz') -> expect []:", searchNotes("zzz"));

console.log("--- longestNote ---");
console.log("longestNote() -> expect note 1 (26 characters):", longestNote());
const backup = notes.splice(0, notes.length);
console.log("longestNote() with no notes -> expect null:", longestNote());
notes.push(...backup);

console.log("--- countByCategory ---");
console.log("countByCategory() -> expect { personal: 2, work: 1, study: 2 }:", countByCategory());

console.log("--- getSummary ---");
console.log("getSummary() -> expect '5 notes: 2 personal, 1 work, 2 study.':", getSummary());

console.log("--- isDuplicate ---");
console.log("isDuplicate('  call THE   dentist ') -> expect true:", isDuplicate("  call THE   dentist "));
console.log("isDuplicate('Water the plants') -> expect false:", isDuplicate("Water the plants"));

console.log("--- addNote ---");
console.log("addNote('Water the plants', 'personal') -> expect true:", addNote("Water the plants", "personal"));
console.log("addNote('water the  plants', 'personal') -> expect false (duplicate):", addNote("water the  plants", "personal"));
console.log("addNote('', 'work') -> expect false (empty):", addNote("", "work"));
console.log("addNote(201 characters, 'work') -> expect false (too long):", addNote("a".repeat(201), "work"));
console.log("addNote('Plan the sprint', 'hobby') -> expect false (bad category):", addNote("Plan the sprint", "hobby"));
console.log("getSummary() after adding -> expect '6 notes: 3 personal, 1 work, 2 study.':", getSummary());
