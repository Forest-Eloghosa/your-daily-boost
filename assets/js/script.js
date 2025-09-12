/* jshint esversion: 11 */

// Your Daily Boost — script.js (polished)

//
// Default Quote Library
//
const quotes = {
  happy: [
    "Happiness is contagious—spread it everywhere you go.",
    "A smile is the shortest distance between two people.",
    "Joy is not in things; it is in us.",
    "Happiness is homemade.",
    "Celebrate the little victories every day.",
    "The more you praise and celebrate your life, the more there is to celebrate.",
    "Do more of what makes you happy.",
    "Happiness radiates like the fragrance from a flower."
  ],
  sad: [
    "It’s okay to not be okay. Better days are coming.",
    "Tears are words the heart can’t express.",
    "Sadness flies away on the wings of time.",
    "This too shall pass.",
    "Even the darkest night will end and the sun will rise.",
    "Sometimes crying is the only way your eyes speak when your mouth can’t explain how broken your heart is.",
    "Give yourself permission to rest. Healing takes time.",
    "Behind every storm is a rainbow waiting to shine."
  ],
  tired: [
    "Rest is not a waste of time; it’s an investment in yourself.",
    "Take a break. You’ve earned it.",
    "Sometimes the most productive thing you can do is rest.",
    "Fatigue is the body’s way of asking for kindness.",
    "A little rest can bring back a lot of strength.",
    "Sleep is the best meditation.",
    "Pause. Recharge. Continue.",
    "Your body deserves care as much as your mind."
  ],
  stressed: [
    "Breathe in peace, breathe out stress.",
    "Don’t let stress steal your joy.",
    "One step at a time is all you need.",
    "You are bigger than whatever is stressing you out.",
    "Relax—nothing is under control, and that’s okay.",
    "Stress is caused by being ‘here’ but wanting to be ‘there.’ Stay present.",
    "Let go of what you can’t control.",
    "Calm mind, strong heart."
  ],
  notsure: [
    "Uncertainty is the beginning of possibility.",
    "It’s okay not to have all the answers right now.",
    "Every step, even small, brings you clarity.",
    "Trust the process, even if you don’t see the whole path.",
    "Doubt kills more dreams than failure ever will.",
    "When nothing is certain, everything is possible.",
    "Confusion is the first step toward clarity.",
    "Sometimes being lost is how you find yourself."
  ]
};

//
// Utilities
 //
function normalizeMood(mood) {
  const m = (mood || "").toString().toLowerCase().trim();
  if (m === "not sure" || m === "not-sure" || m === "not_sure") return "notsure";
  return m.replace(/[^a-z]/g, ""); // keep letters only
}

function shuffleArray(arr) {
  // Fisher–Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showToast(message) {
  const el = document.getElementById("toast");
  if (el) {
    el.textContent = message;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1800);
    return;
  }
  // Fallback minimal toast
  const t = document.createElement("div");
  t.textContent = message;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.bottom = "28px";
  t.style.transform = "translateX(-50%)";
  t.style.background = "#333";
  t.style.color = "#fff";
  t.style.padding = "12px 18px";
  t.style.borderRadius = "8px";
  t.style.zIndex = "9999";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

//
// Session Randomization & Saved Merging
//
const sessionIndex = {}; // tracks where we are in each mood's shuffled list

(function initQuotes() {
  // Shuffle default arrays (per session)
  Object.keys(quotes).forEach(mood => {
    quotes[mood] = shuffleArray([...quotes[mood]]);
    sessionIndex[mood] = 0;
  });

  // Merge saved custom quotes from localStorage with dedup
  try {
    const saved = JSON.parse(localStorage.getItem("quotes") || "{}");
    Object.keys(saved).forEach(key => {
      const mood = normalizeMood(key);
      const base = new Set(quotes[mood] || []);
      (saved[key] || []).forEach(q => base.add(q));
      quotes[mood] = shuffleArray(Array.from(base));
      if (!(mood in sessionIndex)) sessionIndex[mood] = 0;
    });
  } catch (e) {
    console.error("Error merging saved quotes:", e);
  }
})();

//
// Quote Selection
//
function nextQuoteFor(moodKey) {
  const list = quotes[moodKey] || [];
  if (!list.length) {
    return "Take a deep breath — you’re doing great, one step at a time.";
  }
  const idx = sessionIndex[moodKey] % list.length;
  sessionIndex[moodKey] = idx + 1;
   return list[idx];
}

//
// Save Mood + Update UI
//
function saveMood(moodRaw) {
  const mood = normalizeMood(moodRaw);
  const today = new Date().toLocaleDateString();
  const quote = nextQuoteFor(mood);
  const entry = { date: today, mood, quote };

  const store = JSON.parse(localStorage.getItem("moods") || "[]");
  store.push(entry);
  localStorage.setItem("moods", JSON.stringify(store));
 
  const out = document.getElementById("quoteOutput");
  if (out) out.textContent = quote;

  showToast(`Saved "${mood}" for ${today}`);
  renderHistory();
 }
 
 //
// Add Custom Quote
//
function bindAddQuote() {
  const form = document.getElementById("addQuoteForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const moodRaw = (document.getElementById("moodSelect") || {}).value || "";
    const newQuote = (document.getElementById("newQuote") || {}).value || "";
    const mood = normalizeMood(moodRaw);
    const quoteText = newQuote.trim();

    if (!mood || !quoteText) {
      showToast("Please select a mood and enter a quote.");
      return;
    }

    // In-memory dedup
    const setMem = new Set(quotes[mood] || []);
    setMem.add(quoteText);
    quotes[mood] = Array.from(setMem);

    // Persisted dedup
    const saved = JSON.parse(localStorage.getItem("quotes") || "{}");
    const setSaved = new Set(saved[mood] || []);
    setSaved.add(quoteText);
    saved[mood] = Array.from(setSaved);
    localStorage.setItem("quotes", JSON.stringify(saved));

    // Also add to mood history (the exact quote user added)
    const today = new Date().toLocaleDateString();
    const moods = JSON.parse(localStorage.getItem("moods") || "[]");
    moods.push({ date: today, mood, quote: quoteText });
    localStorage.setItem("moods", JSON.stringify(moods));

    form.reset();
    showToast(`Quote added to ${mood}!`);
    renderHistory();
  });
}

//
// History Rendering
//
 function renderHistory() {
  const grid = document.getElementById("historyList") || document.getElementById("history-list");
  if (!grid) return;

  const moods = JSON.parse(localStorage.getItem("moods") || "[]");
  grid.innerHTML = "";

  moods.forEach(({ date, mood, quote }) => {

    if (grid.id === "historyList") {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";

      const card = document.createElement("div");
      card.className = "card history-card h-100";

      const body = document.createElement("div");
      body.className = "card-body";

      const badge = document.createElement("span");
      badge.className = `badge badge-mood bg-brand`;
      badge.textContent = (mood || "").charAt(0).toUpperCase() + (mood || "").slice(1);

      const dateEl = document.createElement("p");
      dateEl.className = "text-muted mb-2 small";
      dateEl.textContent = date;

      const quoteEl = document.createElement("p");
      quoteEl.className = "mb-0";
      quoteEl.textContent = quote ? `"${quote}"` : "";

      body.appendChild(badge);
      body.appendChild(dateEl);
       body.appendChild(quoteEl);

      card.appendChild(body);
      col.appendChild(card);
      grid.appendChild(col);
    } else {
      const li = document.createElement("li");
      li.innerText = quote
        ? `${date}: ${mood.charAt(0).toUpperCase() + mood.slice(1)} — "${quote}"`
        : `${date}: ${mood.charAt(0).toUpperCase() + mood.slice(1)}`;
      grid.appendChild(li);
    }
  });
}

// Clear Mood History
(function bindClear() {
  const btn = document.getElementById("clearHistoryBtn");
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!confirm("Clear all saved moods? This cannot be undone.")) return;
  localStorage.removeItem("moods");
  renderHistory();
  showToast("Mood history cleared.");
  });
})();

//
// Event Wiring
//
function bindMoodButtons() {
  const btns = document.querySelectorAll("[data-mood]");
  if (!btns.length) return; // still supports inline onclick="saveMood('happy')"
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mood = btn.getAttribute("data-mood");
      saveMood(mood);
    });
  });
}

// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  bindMoodButtons();
  bindAddQuote();
});
