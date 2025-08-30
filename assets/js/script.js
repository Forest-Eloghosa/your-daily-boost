//
// Data: Quotes by Mood (Default Library)
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
// Normalize mood key (defensive against typos)
//
function normalizeMood(mood) {
  return (mood || '').toString().toLowerCase().replace(/[^a-z]/g, '');
}

//
// Merge any saved custom quotes into the default library
//
(function mergeSavedQuotes() {
  try {
    const saved = JSON.parse(localStorage.getItem("quotes"));
    if (!saved) return;
    Object.keys(saved).forEach(key => {
      const k = normalizeMood(key);
      quotes[k] = Array.from(new Set([...(quotes[k] || []), ...saved[key]]));
    });
  } catch (e) { /* ignore */ }
})();

//
// Toast / Feedback
//
function showToast(message) {
  const toastEl = document.getElementById("toast");
  if (!toastEl) return alert(message); // fallback
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1800);
}

// Get Random Quote
function randomQuoteFor(moodKey) {
  const list = quotes[moodKey] || [];
  if (!list.length) {
    return "Take a deep breath — you’re doing great, one step at a time.";
  }
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];

}

//
// Save Mood
//
function saveMood(moodRaw) {
  const mood = normalizeMood(moodRaw);
  const today = new Date().toLocaleDateString();
  const entry = { date: today, mood };

  const store = JSON.parse(localStorage.getItem("moods") || "[]");
  store.push(entry);
  localStorage.setItem("moods", JSON.stringify(store));

  const quote = randomQuoteFor(mood);
  const out = document.getElementById("quoteOutput");
  if (out) out.textContent = quote;

  showToast(`Saved "${mood}" for ${today}`);
  renderHistory();
}

//
// Wire up mood buttons
//
(function bindMoodButtons() {
  const buttons = document.querySelectorAll('[data-mood]');
  if (!buttons.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      saveMood(mood);
    });
  });
})();

//
// Add Custom Quote
//
(function bindAddQuote() {
  const form = document.getElementById("addQuoteForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const mood = normalizeMood(document.getElementById("moodSelect").value);
    const newQuote = (document.getElementById("newQuote").value || "").trim();
    if (!newQuote) return showToast("Please enter a quote before adding.");

    // Update in-memory
    quotes[mood] = Array.from(new Set([...(quotes[mood] || []), newQuote]));

    // Persist
    const saved = JSON.parse(localStorage.getItem("quotes") || "{}");
    saved[mood] = Array.from(new Set([...(saved[mood] || []), newQuote]));
    localStorage.setItem("quotes", JSON.stringify(saved));

    // Also add to history with quote
    const moods = JSON.parse(localStorage.getItem("moods") || "[]");
    const today = new Date().toLocaleDateString();
    moods.push({ date: today, mood, quote: newQuote });
    localStorage.setItem("moods", JSON.stringify(moods));

    form.reset();
    showToast(`Quote added to ${mood}!`);
    renderHistory();
  });
})();

//
// Render Mood History
//
function renderHistory() {
  // Use 'history-list' for <ul> or 'historyList' for Bootstrap grid
  const grid = document.getElementById("historyList") || document.getElementById("history-list");
  if (!grid) return;

  const moods = JSON.parse(localStorage.getItem("moods") || "[]");
  grid.innerHTML = "";

  moods.forEach(({ date, mood, quote }) => {
    // Bootstrap card layout if grid, else <li>
    if (grid.id === "historyList") {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-lg-4';

      const card = document.createElement('div');
      card.className = 'card history-card h-100';

      const body = document.createElement('div');
      body.className = 'card-body';

      const badge = document.createElement('span');
      badge.className = `badge badge-mood bg-brand`;
      badge.textContent = (mood || '').charAt(0).toUpperCase() + (mood || '').slice(1);

      const dateEl = document.createElement('p');
      dateEl.className = 'text-muted mb-2 small';
      dateEl.textContent = date;

      const quoteEl = document.createElement('p');
      quoteEl.className = 'mb-0';
      quoteEl.textContent = quote ? `"${quote}"` : randomQuoteFor(mood);

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

// Initial render if on history page
document.addEventListener('DOMContentLoaded', renderHistory);
