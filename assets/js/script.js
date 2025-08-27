// 
// Data: Quotes by Mood
// 
const quotes = {
  happy: [
    "Happiness is not something ready-made. It comes from your own actions.",
    "The purpose of our lives is to be happy.",
    "Smile, it’s contagious!",
    "Joy is the simplest form of gratitude."
  ],
  sad: [
    "Every day may not be good, but there’s something good in every day.",
    "Tough times never last, but tough people do.",
    "You are stronger than you think.",
    "Crying is how your heart speaks when your lips can’t explain the pain."
  ],
  stressed: [
    "Take a deep breath, you’re doing just fine.",
    "One step at a time. One moment at a time.",
    "Don’t stress. Do your best. Forget the rest.",
    "Peace begins with a deep breath."
  ],
  tired: [
    "Rest is productive too — your body needs it.",
    "Don’t push yourself too hard, tomorrow is another chance.",
    "It’s okay to pause and recharge.",
    "Sometimes the best thing you can do is sleep."
  ],
  notsure: [
    "It’s okay not to have all the answers right now.",
    "Uncertainty means possibility — something new can begin.",
    "Clarity comes with time, trust the process.",
    "Not knowing is the first step to discovering."
  ]
};

// Load saved quotes from localStorage (if any)
const savedQuotes = JSON.parse(localStorage.getItem("quotes"));
if (savedQuotes) {
  Object.assign(quotes, savedQuotes);
}

// 
//  Save Mood
// 
function saveMood(mood) {
  const moods = JSON.parse(localStorage.getItem("moods")) || [];
  const today = new Date().toLocaleDateString();

  moods.push({ date: today, mood: mood });
  localStorage.setItem("moods", JSON.stringify(moods));

  // Show a random quote for this mood
  getQuote(mood);

  // Update history if on the history page
  if (document.getElementById("history-list")) {
    renderHistory();
  }
}

//
//  Get Random Quote
//
function getQuote(mood) {
  const moodQuotes = quotes[mood];

  if (moodQuotes && moodQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * moodQuotes.length);
    document.getElementById("quoteOutput").innerText = moodQuotes[randomIndex];
  } else {
    document.getElementById("quoteOutput").innerText = 
      "Take a deep breath — you’re doing great, one step at a time.";
  }
}

// 
//  Add Custom Quote
// 
function addQuote() {
  const newQuote = document.getElementById("newQuote").value.trim();
  const mood = document.getElementById("moodSelect").value;

  if (newQuote === "") {
    alert("Please enter a quote before adding!");
    return;
  }

  if (!quotes[mood]) {
    quotes[mood] = [];
  }

  quotes[mood].push(newQuote);

  // Save updated quotes to localStorage
  localStorage.setItem("quotes", JSON.stringify(quotes));

  // Clear input
  document.getElementById("newQuote").value = "";

  alert(`Your quote has been added to the ${mood} mood! 🎉`);
}

// 
//  Render Mood History
// 
function renderHistory() {
  const moods = JSON.parse(localStorage.getItem("moods")) || [];
  const list = document.getElementById("history-list");
  if (!list) return;

  list.innerHTML = ""; // Clear previous entries

  moods.forEach(entry => {
    const li = document.createElement("li");
    li.innerText = `${entry.date}: ${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}`;
    list.appendChild(li);
  });
}

// Automatically render history on page load
if (document.getElementById("history-list")) {
  renderHistory();
}

//
//  Clear Mood History
// 
function clearMoods() {
  localStorage.removeItem("moods");
  const historyList = document.getElementById("history-list");
  if (historyList) {
    historyList.innerHTML = "";
  }
  alert("Mood history cleared!");
}
