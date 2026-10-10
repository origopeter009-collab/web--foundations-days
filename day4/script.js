// 1. Select all the elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

const DRAFT_KEY = "day4-draft";
const THEME_KEY = "day4-theme";

// 2. Update both counters and the warning classes
function updateCounts() {
  const text = noteText.value;
  const chars = text.length;
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

  charCount.textContent = `${chars} / 200 characters`;
  wordCount.textContent = `${words} words`;

  charCount.classList.toggle("warning", chars > 180 && chars <= 200);
  charCount.classList.toggle("over", chars > 200);
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, noteText.value);
}

// Clears the textarea, counters and saved draft
function clearAll() {
  noteText.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
}

// 3. On every input: update counts and save the draft
noteText.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

// 4. Clear button and Escape key
clearBtn.addEventListener("click", clearAll);

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearAll();
  }
});

// 5. Theme toggle remembers the choice
themeToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});

// 6. On page load: restore draft and theme, then update counts
noteText.value = localStorage.getItem(DRAFT_KEY) || "";
applyTheme(localStorage.getItem(THEME_KEY) === "dark");
updateCounts();
