const categories = Object.keys(vocab);

// ════════════════════════════════════════════════
// GLOBAL STATE
// ════════════════════════════════════════════════
let currentPanel = "dashboard";
let sidebarOpen = window.innerWidth > 768;

// flashcard state
let fcCat = categories[0];
let fcIdx = 0;
let fcFlipped = false;
let fcCards = [];
let fcFilter = "";


// quiz states (index + score per section)
const qState = {};
["h1", "h2", "h3", "l1", "l2", "l3", "s1", "s2", "sp1", "sp2", "sp3"].forEach((k) => {
  qState[k] = { idx: 0, score: 0, answered: {} };
});

// ════════════════════════════════════════════════
// LAYOUT
// ════════════════════════════════════════════════
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("open", sidebarOpen);
    sidebar.classList.remove("closed");
    if (backdrop) backdrop.classList.toggle("active", sidebarOpen);
  } else {
    sidebar.classList.toggle("closed", !sidebarOpen);
    sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
  }
}

const panelMeta = {
  dashboard: { title: "Dashboard", sub: "Goethe A1 Exam Prep" },
  flashcards: { title: "📚 Flashcards", sub: "Vocabulary" },
  hoeren1: { title: "🎧 Hören Teil 1", sub: "Multiple Choice – 300 questions" },
  hoeren2: { title: "🎧 Hören Teil 2", sub: "Richtig / Falsch – 300 questions" },
  hoeren3: { title: "📞 Hören Teil 3", sub: "Voicemail Comprehension – 300 questions" },
  lesen1: { title: "📖 Lesen Teil 1", sub: "Richtig / Falsch – 50 sets" },
  lesen2: { title: "🔍 Lesen Teil 2", sub: "Match the Ad – 210 questions" },
  lesen3: { title: "🪧 Lesen Teil 3", sub: "Signs & Notices – 100 questions" },
  schreiben1: { title: "📝 Schreiben Teil 1", sub: "Form Filling – 30 exercises" },
  schreiben2: { title: "✉️ Schreiben Teil 2", sub: "Email Writing – 44 prompts" },
  sprechen1: { title: "🙂 Sprechen Teil 1", sub: "Sich vorstellen – 10 questions" },
  sprechen2: { title: "🗣 Sprechen Teil 2", sub: "Answer Questions – 298 prompts" },
  sprechen3: { title: "🙋 Sprechen Teil 3", sub: "Asking Questions – 163 cards" },
};
const sectionDescriptions = {
  h1: `
    <strong>Hören Teil 1 – Short Conversations</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Questions:</strong> 6</li>
      <li><strong>Marks:</strong> 6 (1 mark each)</li>
      <li><strong>Audio:</strong> Played twice</li>
    </ul>

    Listen to short everyday conversations and choose the correct answer (A, B, or C).

    <br><br>

    <strong>Focus on:</strong>
    <ul>
      <li>Names, numbers, prices, dates, and times.</li>
      <li>Understand the main idea instead of every word.</li>
    </ul>
  `,

  h2: `
    <strong>Hören Teil 2 – Announcements</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Questions:</strong> 4</li>
      <li><strong>Marks:</strong> 4 (1 mark each)</li>
      <li><strong>Audio:</strong> Played Once</li>
    </ul>

    Listen to public announcements and decide whether each statement is <strong>Richtig</strong> or <strong>Falsch</strong>.
  `,

  h3: `
    <strong>Hören Teil 3 – Telephone Messages</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Questions:</strong> 5</li>
      <li><strong>Marks:</strong> 5 (1 mark each)</li>
      <li><strong>Audio:</strong> Played twice</li>
    </ul>

    Listen to short telephone messages and choose the correct answer.
  `,

  l1: `
    <strong>Lesen Teil 1 – Personal Messages</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Questions:</strong> 5</li>
      <li><strong>Marks:</strong> 5 (1 mark each)</li>
    </ul>

    Read short emails, notes, or messages and decide whether each statement is <strong>Richtig</strong> or <strong>Falsch</strong>.
  `,

  l2: `
    <strong>Lesen Teil 2 – Matching Situations</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Questions:</strong> 5</li>
      <li><strong>Marks:</strong> 5 (1 mark each)</li>
    </ul>

    Read an everyday situation and choose the advertisement or website that best matches the person's needs.
  `,

  l3: `
    <strong>Lesen Teil 3 – Signs and Notices</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Questions:</strong> 5</li>
      <li><strong>Marks:</strong> 5 (1 mark each)</li>
    </ul>

    Read short public signs and decide whether the statement is <strong>Richtig</strong> or <strong>Falsch</strong>.
  `,

  s1: `
    <strong>Schreiben Teil 1 – Form Filling</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Questions:</strong> 1 Form</li>
      <li><strong>Marks:</strong> 5</li>
    </ul>

    Read the scenario and complete the German registration form using the given information.
  `,

  s2: `
    <strong>Schreiben Teil 2 – Email Writing</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Task:</strong> Write 1 Email</li>
      <li><strong>Marks:</strong> 10</li>
    </ul>

    Write a short informal email covering all required points with simple and correct German.
  `,

  sp1: `
    <strong>Sprechen Teil 1 – Self Introduction</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Task:</strong> Introduce Yourself</li>
      <li><strong>Marks:</strong> Part of Speaking Score</li>
    </ul>

    Introduce yourself using the information on your exam card such as your name, age, country, city, occupation, languages, and hobbies.
  `,

  sp2: `
    <strong>Sprechen Teil 2 – Asking & Answering Questions</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Task:</strong> Ask & Answer Questions</li>
      <li><strong>Typical Topics:</strong> 2–3</li>
      <li><strong>Marks:</strong> Part of Speaking Score</li>
    </ul>

    Practice answering simple questions about family, hobbies, shopping, travel, food, work, school, and daily life.

    <br><br>

    <strong>Important:</strong>
    The questions in this practice are <strong>examples only</strong>. In the real Goethe A1 exam, the you or your partner may ask <strong>different questions</strong> on the same topics or similar everyday situations.

    <br><br>

    <strong>Tip:</strong>
    Focus on speaking naturally instead of memorizing answers.
  `,

  sp3: `
    <strong>Sprechen Teil 3 – Making Requests</strong><br><br>

    📋 <strong>Exam Information</strong>
    <ul>
      <li><strong>Task:</strong> Make Polite Requests</li>
      <li><strong>Typical Cards:</strong> 2</li>
      <li><strong>Marks:</strong> Part of Speaking Score</li>
    </ul>

    Practice making polite requests using everyday objects.

    <br><br>

    <strong>Useful Patterns:</strong>
    <ul>
      <li>Können Sie mir bitte ... geben/kaufen/nehemen?</li>
      <li>Kann ich bitte ... haben?</li>
      <li>Darf ich ... benutzen?</li>
      <li>Ich brauche bitte ...</li>
    </ul>
  `
};

function sectionDescHtml(key) {
  return `<div class="section-desc">${sectionDescriptions[key] || ""}</div>`;
}

function showPanel(name, navEl) {
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
  document.getElementById("panel-" + name).classList.add("active");
  if (navEl) navEl.classList.add("active");
  else {
    const match = document.querySelector(`[data-panel="${name}"]`);
    if (match) match.classList.add("active");
  }
  const m = panelMeta[name] || {};
  document.getElementById("topbar-title").textContent = m.title || name;
  document.getElementById("topbar-sub").textContent = m.sub || "";
  currentPanel = name;

  // Close sidebar on mobile after choosing a panel
  if (window.innerWidth <= 768) {
    sidebarOpen = false;
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
  }

  // lazy render
  if (name === "flashcards") fcInit();
  else if (name === "hoeren1") renderH1();
  else if (name === "hoeren2") renderH2();
  else if (name === "hoeren3") renderH3();
  else if (name === "lesen1") renderL1();
  else if (name === "lesen2") renderL2();
  else if (name === "lesen3") renderL3();
  else if (name === "schreiben1") renderS1();
  else if (name === "schreiben2") { renderS2(); s2gInit(); }
  else if (name === "sprechen1") renderSp1();
  else if (name === "sprechen2") renderSp2();
  else if (name === "sprechen3") renderSp3();
}

// ════════════════════════════════════════════════
// FLASHCARDS
// ════════════════════════════════════════════════
const catEmojisFC = {
  Alphabet: "🔤",
  Numbers: "🔢",
  "Ordinal Numbers": "🔢",
  "Roman Numbers": "Ⅻ",
  Months: "📅",
  "Days & Times of Day": "🌅",
  Time: "🕐",
  Weekdays: "📆",
  "Time Measurements": "⏱",
  "Years & Seasons": "🍂",
  Colors: "🎨",
  "Countries & Nationalities": "🌍",
  Directions: "🧭",
  Greetings: "👋",
  "Travel & Transport": "✈️",
  "Places & Locations": "🏛",
  "Food & Drinks": "🍽",
  "House & Objects": "🏠",
  "Work & School": "💼",
  "Shopping & Money": "🛍",
  "Doctor & Health": "⚕️",
  "Emotions & Attitudes": "💭",
  "Weather & Nature": "🌤",
  Restaurant: "🍷",
  "Parts of Body": "🫀",
  "Signs & Notices": "🪧",
  "Internet & Technology": "💻",
  "Measures & Weight": "⚖️",
  "Family & Relatives": "👪",
  "Personal Information": "🧾",
  "Introducing Yourself": "🙋",
  "Hobbies & Free Time": "🎯",
  "Daily Routine": "⏰",
  "Clothing & Accessories": "👗",
  "Family Celebrations": "🎉",
  "Birthday & Age": "🎂",
  Furniture: "🛋",
  "Household Activities": "🧹",
  "Pets & Animals": "🐾",
  "City & Village": "🏙",
  "Public Services": "🏛",
  "Bank & Post Office": "🏦",
  "Telephone & Communication": "📞",
  "Computer & Technology": "💻",
  "Leisure Activities": "🎲",
  "Sports & Fitness": "🏃",
  "Holidays & Vacation": "🏖",
  "Hotel & Accommodation": "🏨",
  "At the Train Station": "🚉",
  "At the Airport": "✈️",
  "Emergency Situations": "🚑",
  Invitations: "🎫",
  "Festivals & Holidays": "🎊",
  "Friends & Relationships": "🤝",
  "Personality Traits": "🧠",
  "Education & Subjects": "🎓",
  "Jobs & Professions": "💼",
  "Office Vocabulary": "📎",
  "Kitchen Vocabulary": "🍳",
  "Fruits & Vegetables": "🥦",
  "Family Life": "🏡",
  Environment: "🌿",
  "Television & Media": "📺",
  "Music & Entertainment": "🎵",
  "Reading & Books": "📚",
  "Apartment & Rent": "🏠",
  Neighborhood: "🏘",
  "Basic Verbs": "🔁",
  "Common Adjectives": "✨",
  "Common Nouns": "📦",
  Prepositions: "📍",
  "Question Words (W-Fragen)": "❓",
  "Daily Activities": "📝",
  "Giving Opinions": "🗣",
  "Likes & Dislikes": "👍",
  "Simple Conversations": "💬",
  "Forms & Applications": "📝",
  "Classroom Vocabulary": "🏫",
  "Common Expressions": "🗨",
  "Household Appliances": "🔌",
  "Festivals in Germany": "🍺",
  "Cultural Activities": "🎭",
  "Health Emergencies": "🚨",
  "Personal Hygiene": "🧼",
  "Appearance & Description": "👀",
  "Transportation Tickets": "🎟",
  "Weekend Activities": "🛶",
  "Social Media & Communication": "🌐",
};

function fcInit() {
  fcRenderCatList();
  fcLoadCat(fcCat);
}
function fcFilterCats(v) {
  fcFilter = v;
  fcRenderCatList();
}
function fcRenderCatList() {
  const list = document.getElementById("fc-cat-list");
  list.innerHTML = "";
  const f = fcFilter.trim().toLowerCase();
  categories
    .filter((c) => !f || c.toLowerCase().includes(f))
    .forEach((cat) => {
      const el = document.createElement("div");
      el.className = "cat-item" + (cat === fcCat ? " active" : "");
      el.innerHTML = `<span>${catEmojisFC[cat] || "📖"}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis">${cat}</span><span class="cc">${vocab[cat].length}</span>`;
      el.onclick = () => fcLoadCat(cat);
      list.appendChild(el);
    });
}
function fcLoadCat(cat) {
  fcCat = cat;
  fcIdx = 0;
  fcFlipped = false;
  fcCards = [...vocab[cat]];
  fcRenderCatList();
  fcRenderCard();
  fcRenderWordList();
}
function fcRenderCard() {
  if (!fcCards.length) return;
  const c = fcCards[fcIdx];
  document.getElementById("fc-front").textContent = c.front;
  document.getElementById("fc-back").textContent = c.back;
  document.getElementById("fc-article").textContent = c.article ? "Article: " + c.article : "";
  document.getElementById("fc-example").textContent = c.example || "";
  document.getElementById("fc-progress").style.width = ((fcIdx + 1) / fcCards.length) * 100 + "%";
  document.getElementById("fc-num").textContent = fcIdx + 1 + " / " + fcCards.length;
  document.getElementById("fc-card-inner").classList.toggle("flipped", fcFlipped);
  // highlight in word list
  document
    .querySelectorAll("#fc-word-items .word-item")
    .forEach((el, i) => el.classList.toggle("active", i === fcIdx));
}
function fcRenderWordList() {
  const container = document.getElementById("fc-word-items");
  container.innerHTML = "";
  fcCards.forEach((c, i) => {
    const el = document.createElement("div");
    el.className = "word-item" + (i === fcIdx ? " active" : "");
    el.innerHTML = `<span class="word-term">${c.front}</span><span class="word-expl">${c.back}</span>`;
    el.onclick = () => {
      fcIdx = i;
      fcFlipped = false;
      fcRenderCard();
    };
    container.appendChild(el);
  });
}
function fcFlip() {
  fcFlipped = !fcFlipped;
  fcRenderCard();
}
function fcNext() {
  fcFlipped = false;
  fcIdx = (fcIdx + 1) % fcCards.length;
  fcRenderCard();
}
function fcPrev() {
  fcFlipped = false;
  fcIdx = (fcIdx - 1 + fcCards.length) % fcCards.length;
  fcRenderCard();
}
function fcShuffle() {
  for (let i = fcCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fcCards[i], fcCards[j]] = [fcCards[j], fcCards[i]];
  }
  fcIdx = 0;
  fcFlipped = false;
  fcRenderCard();
  fcRenderWordList();
}
function fcSpeak() {
  if (!fcCards.length) return;
  const u = new SpeechSynthesisUtterance(fcCards[fcIdx].front);
  u.lang = "de-DE";
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
document.addEventListener("keydown", (e) => {
  if (currentPanel !== "flashcards") return;
  if (e.code === "Space") {
    e.preventDefault();
    fcFlip();
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    fcNext();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    fcPrev();
  }
});

// ════════════════════════════════════════════════
// QUIZ HELPERS
// ════════════════════════════════════════════════
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function checkAnswerMatch(userVal, correctVal) {
  if (!userVal || !correctVal) return false;
  const clean = (s) =>
    String(s)
      .toLowerCase()
      .trim()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  return clean(userVal) === clean(correctVal);
}
function randomSubset(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

function quizNavHtml(key, idx, total) {
  return `<div class="nav-row-quiz">
    <button class="q-btn" onclick="qNav('${key}',-1)">← Prev</button>
    <span class="q-counter">${idx + 1} / ${total}</span>
    <button class="q-btn" onclick="qNav('${key}',1)">Next →</button>
    <button class="q-btn" onclick="qReset('${key}')">↺ Reset</button>
  </div>`;
}

function quizScoreHtml(key) {
  const s = qState[key];
  const total = Object.keys(s.answered).length;
  return total ? `<div class="quiz-score-box">✅ ${s.score} / ${total}</div>` : "";
}

function qNav(key, dir) {
  window.speechSynthesis.cancel();
  const s = qState[key];
  const data = getQData(key);
  s.idx = (s.idx + dir + data.length) % data.length;
  renderSection(key);
}
function qReset(key) {
  qState[key] = { idx: 0, score: 0, answered: {} };
  renderSection(key);
}
function getQData(key) {
  if (key === "h1") return D.hoeren1;
  if (key === "h2") return D.hoeren2;
  if (key === "h3") return D.hoeren3;
  if (key === "l1") return D.lesen1;
  if (key === "l2") return D.lesen2;
  if (key === "l3") return D.lesen3;
  if (key === "s1") return D.schreiben1;
  if (key === "s2") return D.schreiben2;
  if (key === "sp2") return D.sprechen2;
  if (key === "sp3") return D.sprechen3;
  return [];
}
function renderSection(key) {
  if (key === "h1") renderH1();
  else if (key === "h2") renderH2();
  else if (key === "h3") renderH3();
  else if (key === "l1") renderL1();
  else if (key === "l2") renderL2();
  else if (key === "l3") renderL3();
  else if (key === "s1") renderS1();
  else if (key === "s2") renderS2();
  else if (key === "sp2") renderSp2();
  else if (key === "sp3") renderSp3();
}

// ════════════════════════════════════════════════
// VOICE DETECTION & SELECTION
// ════════════════════════════════════════════════
function selectGermanVoice(preferredNames) {
  const voices = window.speechSynthesis.getVoices();
  const germanVoices = voices.filter(v => v.lang && v.lang.startsWith("de"));
  
  // Try to find voice matching any of the preferred names
  for (const name of preferredNames) {
    const found = germanVoices.find(v => v.name.includes(name));
    if (found) return found;
  }
  
  // Fallback to any German voice
  return germanVoices.length > 0 ? germanVoices[0] : null;
}

function getMaleVoice() {
  return selectGermanVoice(["Stefan", "Martin", "Christian", "Hans"]);
}

function getFemaleVoice() {
  return selectGermanVoice(["Katja", "Hedda", "Anna", "Sarah", "Claudia"]);
}

// ════════════════════════════════════════════════
// AUDIO TTS SYSTEM
// ════════════════════════════════════════════════
const audioState = {};
let audioPaused = false;

function getAudioState(key) {
  if (!audioState[key]) audioState[key] = {};
  const idx = qState[key].idx;
  if (!audioState[key][idx]) audioState[key][idx] = { played: 0, playing: false };
  return audioState[key][idx];
}

/**
 * Get the current button label and state for the toggle button
 * Returns { label, ariaLabel, disabled, isPlaying, isPaused }
 */
function getAudioButtonState(key, maxPlays) {
  const st = getAudioState(key);
  const remaining = maxPlays - st.played;
  
  let label, ariaLabel, disabled;
  
  if (remaining <= 0) {
    // All plays exhausted
    label = "✓ Done";
    ariaLabel = "Audio finished - no more plays remaining";
    disabled = true;
  } else if (st.playing) {
    if (audioPaused) {
      // Currently paused, show Resume
      label = "▶ Resume Audio";
      ariaLabel = "Resume audio playback";
      disabled = false;
    } else {
      // Currently playing
      label = "⏸ Pause";
      ariaLabel = "Pause audio playback";
      disabled = false;
    }
  } else {
    // Not playing
    label = "▶ Play Audio";
    ariaLabel = "Play audio";
    disabled = false;
  }
  
  return { label, ariaLabel, disabled, isPlaying: st.playing, isPaused: audioPaused };
}

function handleAudioToggle(key, maxPlays) {
  const st = getAudioState(key);
  const remaining = maxPlays - st.played;
  
  // If all plays exhausted, do nothing
  if (remaining <= 0) return;
  
  // If audio is currently playing
  if (st.playing) {
    if (audioPaused) {
      // Resume: resume without incrementing play count
      window.speechSynthesis.resume();
      audioPaused = false;
    } else {
      // Pause: pause without changing play count
      window.speechSynthesis.pause();
      audioPaused = true;
    }
  } else {
    // Start new playback: increment play count only here
    st.playing = true;
    st.played++;
    audioPaused = false;
    playTTSInternal(key);
  }
  
  renderSection(
    currentPanel === "hoeren1" ? "h1" :
    currentPanel === "hoeren2" ? "h2" :
    currentPanel === "hoeren3" ? "h3" : ""
  );
}

function playTTSInternal(key) {
  const data = getQData(key);
  const q = data[qState[key].idx];
  const text = q.dialogue || q.audio_transcript || "";

  const maleVoice = getMaleVoice();
  const femaleVoice = getFemaleVoice();

  const lines = text.split(/(?=Kunde:|Verkäuferin:)/);
  let index = 0;

  function speakNext() {
    if (index >= lines.length) {
      const st = getAudioState(key);
      st.playing = false;
      audioPaused = false;
      renderSection(key);
      return;
    }

    const line = lines[index].trim();
    const isKunde = line.startsWith("Kunde:");
    const isVerkaeuferin = line.startsWith("Verkäuferin:");

    const cleanText = line
      .replace("Kunde:", "")
      .replace("Verkäuferin:", "")
      .trim();
    
    if (!cleanText) {
      index++;
      speakNext();
      return;
    }

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = "de-DE";

    if (isKunde) {
      utter.voice = maleVoice;
      utter.pitch = 0.90;  // Lower pitch for male
      utter.rate = 0.90;   // Slightly slower
      utter.volume = 1;
    } else if (isVerkaeuferin) {
      utter.voice = femaleVoice;
      utter.pitch = 1.10;  // Higher pitch for female
      utter.rate = 1.0;    // Normal speed
      utter.volume = 1;
    } else {
      utter.voice = maleVoice || femaleVoice;
    }

    utter.onend = () => {
      index++;
      setTimeout(speakNext, 250);
    };

    utter.onerror = () => {
      index++;
      setTimeout(speakNext, 250);
    };

    window.speechSynthesis.speak(utter);
  }

  window.speechSynthesis.cancel();
  speakNext();
}

function audioPlayerHtml(key, maxPlays) {
  const st = getAudioState(key);
  const remaining = maxPlays - st.played;
  const buttonState = getAudioButtonState(key, maxPlays);
  const playsLabel =
    remaining > 0 ? `(${remaining} play${remaining > 1 ? "s" : ""} remaining)` : "";

  return `<div class="audio-player">
    <div class="audio-controls">
      <button
        class="play-btn"
        onclick="handleAudioToggle('${key}', ${maxPlays})"
        aria-label="${buttonState.ariaLabel}"
        ${buttonState.disabled ? "disabled" : ""}>
        ${buttonState.label}
      </button>
      <span class="play-count">${playsLabel}</span>
    </div>
  </div>`;
}

// Preload voices and log available German voices
window.speechSynthesis.onvoiceschanged = () => {
  const voices = window.speechSynthesis.getVoices();
  const germanVoices = voices.filter(v => v.lang && v.lang.startsWith("de"));
  console.log("🎤 Available German voices:", germanVoices.map(v => v.name));
};

// ════════════════════════════════════════════════
// HÖREN 1 – Multiple choice
// ════════════════════════════════════════════════
function renderH1() {
  const key = "h1";
  const s = qState[key];
  const data = D.hoeren1;
  const q = data[s.idx];
  const ans = s.answered[s.idx];
  const opts = q.options;
  const letters = Object.keys(opts);

  let optHtml = letters
    .map((l) => {
      let cls = "option-btn";
      if (ans !== undefined) {
        if (l === q.answer) cls += " correct";
        else if (l === ans && ans !== q.answer) cls += " wrong";
        else cls += " revealed";
      }
      return `<button class="${cls}" onclick="answerH1('${l}')" ${ans !== undefined ? "disabled" : ""}>
      <span class="option-letter">${l.toUpperCase()}</span>${escHtml(opts[l])}
    </button>`;
    })
    .join("");

  const expl =
    ans !== undefined ? `<div class="explanation">💡 ${escHtml(q.explanation || "")}</div>` : "";
  const transcript = q.dialogue || q.audio_transcript || "";
  const showTrans = s.answered[s.idx] !== undefined || audioState["h1"]?.[s.idx]?.played >= 2;
  const transHtml = showTrans
    ? `<div class="transcript-box">${escHtml(transcript)}</div>`
    : `<div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-style:italic">Listen to the audio, then answer. Transcript shows after 2 plays.</div>`;

  document.getElementById("h1-layout").innerHTML = `
<div class="quiz-meta">
    <h2>Hören Teil 1</h2>
    <div class="quiz-controls">${quizScoreHtml(key)}</div>
</div>
${sectionDescHtml('h1')}


    <div class="q-progress"><div class="q-progress-bar" style="width:${((s.idx + 1) / data.length) * 100}%"></div></div>
    <div class="question-card">
      <div class="question-num">Question ${s.idx + 1} of ${data.length} · Topic: ${escHtml(q.topic || "")}</div>
      ${audioPlayerHtml("h1", 2)}
      <div class="question-text">${escHtml(q.question)}</div>
      <div class="options">${optHtml}</div>
      ${expl}
    </div>
    ${quizNavHtml(key, s.idx, data.length)}`;
}
function answerH1(l) {
  const s = qState["h1"];
  const q = D.hoeren1[s.idx];
  if (s.answered[s.idx] !== undefined) return;
  s.answered[s.idx] = l;
  if (l === q.answer) s.score++;
  renderH1();
}

// ════════════════════════════════════════════════
// HÖREN 2 – Richtig/Falsch
// ════════════════════════════════════════════════
function renderH2() {
  const key = "h2";
  const s = qState[key];
  const data = D.hoeren2;
  const q = data[s.idx];
  const ans = s.answered[s.idx];
  const correct = q.answer === "Richtig";

  function tfCls(val) {
    if (ans === undefined) return "tf-btn";
    const chosen = (val === "Richtig") === (ans === true);
    const isRight = (val === "Richtig") === correct;
    if (isRight) return "tf-btn correct";
    if (chosen && !isRight) return "tf-btn wrong";
    return "tf-btn";
  }

  const expl =
    ans !== undefined ? `<div class="explanation">💡 ${escHtml(q.explanation || "")}</div>` : "";
  const transcriptH2 = q.audio_transcript || "";
  const showTransH2 = ans !== undefined || audioState["h2"]?.[s.idx]?.played >= 1;
  const transHtmlH2 = showTransH2
    ? `<div class="transcript-box">${escHtml(transcriptH2)}</div>`
    : `<div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-style:italic">Listen once, then decide Richtig or Falsch. Transcript shows after playing.</div>`;

  document.getElementById("h2-layout").innerHTML = `
    <div class="quiz-meta">
      <h2>Hören Teil 2</h2>
      <div class="quiz-controls">${quizScoreHtml(key)}</div>
    </div>
    ${sectionDescHtml('h2')}
    <div class="q-progress"><div class="q-progress-bar" style="width:${((s.idx + 1) / data.length) * 100}%"></div></div>
    <div class="question-card">
      <div class="question-num">Question ${s.idx + 1} of ${data.length} · Context: ${escHtml(q.context || "")}</div>
      ${audioPlayerHtml("h2", 1)}
      <div class="question-text">${escHtml(q.statement)}</div>
      <div class="tf-options">
        <button class="${tfCls("Richtig")}" onclick="answerH2(true)" ${ans !== undefined ? "disabled" : ""}>✔ Richtig</button>
        <button class="${tfCls("Falsch")}" onclick="answerH2(false)" ${ans !== undefined ? "disabled" : ""}>✗ Falsch</button>
      </div>
      ${expl}
    </div>
    ${quizNavHtml(key, s.idx, data.length)}`;
}
function answerH2(val) {
  const s = qState["h2"];
  const q = D.hoeren2[s.idx];
  if (s.answered[s.idx] !== undefined) return;
  s.answered[s.idx] = val;
  if ((val === true) === (q.answer === "Richtig")) s.score++;
  renderH2();
}

// ════════════════════════════════════════════════
// HÖREN 3 – Multiple choice (voicemail)
// ════════════════════════════════════════════════
function renderH3() {
  const key = "h3";
  const s = qState[key];
  const data = D.hoeren3;
  const q = data[s.idx];
  const ans = s.answered[s.idx];
  const opts = q.options || {};
  const letters = Object.keys(opts);

  let optHtml = letters
    .map((l) => {
      let cls = "option-btn";
      if (ans !== undefined) {
        if (l === q.correct_answer) cls += " correct";
        else if (l === ans) cls += " wrong";
        else cls += " revealed";
      }
      return `<button class="${cls}" onclick="answerH3('${l}')" ${ans !== undefined ? "disabled" : ""}>
      <span class="option-letter">${l.toUpperCase()}</span>${escHtml(opts[l])}
    </button>`;
    })
    .join("");

  const transcriptH3 = q.audio_transcript || "";
  const showTransH3 = q._showTrans || ans !== undefined || audioState["h3"]?.[s.idx]?.played >= 2;
  const transBtn = `<button class="show-trans-btn" onclick="toggleH3Trans(${s.idx})">
    ${showTransH3 ? "▲ Hide transcript" : "▼ Show transcript"}
  </button>`;
  const transBox = showTransH3 ? `<div class="transcript-box">${escHtml(transcriptH3)}</div>` : "";

  document.getElementById("h3-layout").innerHTML = `
    <div class="quiz-meta">
      <h2>Hören Teil 3</h2>
      <div class="quiz-controls">${quizScoreHtml(key)}</div>
    </div>
    ${sectionDescHtml('h3')}
    <div class="q-progress"><div class="q-progress-bar" style="width:${((s.idx + 1) / data.length) * 100}%"></div></div>
    <div class="question-card">
      <div class="question-num">Question ${s.idx + 1} of ${data.length}</div>
      ${audioPlayerHtml("h3", 2)}
      <div class="question-text">${escHtml(q.question || "")}</div>
      <div class="options">${optHtml}</div>
    </div>
    ${quizNavHtml(key, s.idx, data.length)}`;
}
function toggleH3Trans(idx) {
  D.hoeren3[idx]._showTrans = !D.hoeren3[idx]._showTrans;
  renderH3();
}
function answerH3(l) {
  const s = qState["h3"];
  const q = D.hoeren3[s.idx];
  if (s.answered[s.idx] !== undefined) return;
  s.answered[s.idx] = l;
  if (l === q.correct_answer) s.score++;
  renderH3();
}

// ════════════════════════════════════════════════
// LESEN 1 – Richtig/Falsch on sets
// ════════════════════════════════════════════════
function renderL1() {
  const key = "l1";
  const s = qState[key];
  const data = D.lesen1;
  const set = data[s.idx];
  const ans = s.answered[s.idx] || {};

  let qHtml = set.questions
    .map((q, qi) => {
      const a = ans[qi];
      const correct = q.answer === "Richtig";
      function tfCls(val) {
        if (a === undefined) return "tf-btn";
        const chosen = (val === "Richtig") === (a === true);
        const isRight = (val === "Richtig") === correct;
        if (isRight) return "tf-btn correct";
        if (chosen && !isRight) return "tf-btn wrong";
        return "tf-btn";
      }
      const expl =
        a !== undefined ? `<div class="explanation">💡 ${escHtml(q.explanation || "")}</div>` : "";
      const allDone = Object.keys(ans).length >= set.questions.length;
      return `<div style="margin-bottom:14px">
      <div style="font-size:14px;font-weight:600;margin-bottom:8px;color:var(--text)">${qi + 1}. ${escHtml(q.statement)}</div>
      <div class="tf-options">
        <button class="${tfCls("Richtig")}" onclick="answerL1(${qi},true)" ${a !== undefined ? "disabled" : ""}>✔ Richtig</button>
        <button class="${tfCls("Falsch")}" onclick="answerL1(${qi},false)" ${a !== undefined ? "disabled" : ""}>✗ Falsch</button>
      </div>${expl}
    </div>`;
    })
    .join("");

  document.getElementById("l1-layout").innerHTML = `
    <div class="quiz-meta">
      <h2>Lesen Teil 1</h2>
      <div class="quiz-controls">${quizScoreHtml(key)}</div>
    </div>
    ${sectionDescHtml('l1')}
    <div class="q-progress"><div class="q-progress-bar" style="width:${((s.idx + 1) / data.length) * 100}%"></div></div>
    <div class="question-card">
      <div class="question-num">Set ${s.idx + 1} of ${data.length}</div>
      <span class="text-type-tag">${escHtml(set.text_type || "Text")}</span>
      <div class="text-passage">${escHtml(set.text).replace(/\n/g, "<br>")}</div>
      ${qHtml}
    </div>
    ${quizNavHtml(key, s.idx, data.length)}`;
}
function answerL1(qi, val) {
  const s = qState["l1"];
  const set = D.lesen1[s.idx];
  if (!s.answered[s.idx]) s.answered[s.idx] = {};
  if (s.answered[s.idx][qi] !== undefined) return;
  s.answered[s.idx][qi] = val;
  if ((val === true) === (set.questions[qi].answer === "Richtig")) s.score++;
  renderL1();
}

// ════════════════════════════════════════════════
// LESEN 2 – Match the ad
// ════════════════════════════════════════════════
function renderL2() {
  const key = "l2";
  const s = qState[key];
  const data = D.lesen2;
  const q = data[s.idx];
  const ans = s.answered[s.idx];
  const opts = q.options || {};
  const letters = Object.keys(opts);

  let optHtml = letters
    .map((l) => {
      const o = opts[l];
      let cls = "l2-option";
      if (ans !== undefined) {
        if (l === q.answer) cls += " correct";
        else if (l === ans) cls += " wrong";
      }
      const details = (o.details || []).map((d) => `• ${escHtml(d)}`).join("<br>");
      return `<div class="${cls}" onclick="answerL2('${l}')" style="${ans !== undefined ? "pointer-events:none" : ""}">
      <div class="l2-option-letter">Option ${l.toUpperCase()}</div>
      <div class="l2-option-title">${escHtml(o.title || "")}</div>
      ${o.url ? `<div class="l2-option-url">🔗 ${escHtml(o.url)}</div>` : ""}
      <div class="l2-option-details">${details}</div>
    </div>`;
    })
    .join("");

  const expl =
    ans !== undefined ? `<div class="explanation">💡 ${escHtml(q.explanation || "")}</div>` : "";

  document.getElementById("l2-layout").innerHTML = `
    <div class="quiz-meta">
      <h2>Lesen Teil 2</h2>
      <div class="quiz-controls">${quizScoreHtml(key)}</div>
    </div>
    ${sectionDescHtml('l2')}
    <div class="q-progress"><div class="q-progress-bar" style="width:${((s.idx + 1) / data.length) * 100}%"></div></div>
    <div class="question-card">
      <div class="question-num">Question ${s.idx + 1} of ${data.length}</div>
      <div class="situation-box"><strong>Situation:</strong> ${escHtml(q.situation)}</div>
      <div style="margin-bottom:10px;font-size:13px;color:var(--muted)">Which option best fits the situation?</div>
      <div class="lesen2-options">${optHtml}</div>
      ${expl}
    </div>
    ${quizNavHtml(key, s.idx, data.length)}`;
}
function answerL2(l) {
  const s = qState["l2"];
  const q = D.lesen2[s.idx];
  if (s.answered[s.idx] !== undefined) return;
  s.answered[s.idx] = l;
  if (l === q.answer) s.score++;
  renderL2();
}

// ════════════════════════════════════════════════
// LESEN 3 – Richtig/Falsch (signs)
// ════════════════════════════════════════════════
function renderL3() {
  const key = "l3";
  const s = qState[key];
  const data = D.lesen3;
  const q = data[s.idx];
  const ans = s.answered[s.idx];
  const correct = q.answer === "Richtig";

  function tfCls(val) {
    if (ans === undefined) return "tf-btn";
    const chosen = (val === "Richtig") === (ans === true);
    const isRight = (val === "Richtig") === correct;
    if (isRight) return "tf-btn correct";
    if (chosen && !isRight) return "tf-btn wrong";
    return "tf-btn";
  }
  const expl =
    ans !== undefined ? `<div class="explanation">💡 ${escHtml(q.explanation || "")}</div>` : "";

  document.getElementById("l3-layout").innerHTML = `
    <div class="quiz-meta">
      <h2>Lesen Teil 3</h2>
      <div class="quiz-controls">${quizScoreHtml(key)}</div>
    </div>${sectionDescHtml('l3')}
    <div class="q-progress"><div class="q-progress-bar" style="width:${((s.idx + 1) / data.length) * 100}%"></div></div>
    <div class="question-card">
      <div class="question-num">Question ${s.idx + 1} of ${data.length}</div>
      <div class="text-passage" style="font-size:16px;font-weight:600">${escHtml(q.text)}</div>
      <div class="question-text" style="margin-top:14px">${escHtml(q.statement)}</div>
      <div class="tf-options">
        <button class="${tfCls("Richtig")}" onclick="answerL3(true)" ${ans !== undefined ? "disabled" : ""}>✔ Richtig</button>
        <button class="${tfCls("Falsch")}" onclick="answerL3(false)" ${ans !== undefined ? "disabled" : ""}>✗ Falsch</button>
      </div>
      ${expl}
    </div>
    ${quizNavHtml(key, s.idx, data.length)}`;
}
function answerL3(val) {
  const s = qState["l3"];
  const q = D.lesen3[s.idx];
  if (s.answered[s.idx] !== undefined) return;
  s.answered[s.idx] = val;
  if ((val === true) === (q.answer === "Richtig")) s.score++;
  renderL3();
}

// ════════════════════════════════════════════════
// SCHREIBEN 1 – Form filling
// ════════════════════════════════════════════════
function renderS1() {
  const key = "s1";
  const s = qState[key];
  const data = D.schreiben1;
  const q = data[s.idx];
  const fieldHtml = q.fields
    .map((f, fi) => {
      if (!f.blank) {
        return `<div class="form-field">
        <div class="field-label">${escHtml(f.label)}</div>
        <div class="field-value">${escHtml(f.value)}</div>
      </div>`;
      }

      const fieldState = (s.answered[s.idx] && s.answered[s.idx][fi]) || {};
      const userVal = fieldState.user || "";
      const statusCls = fieldState.status === "correct" ? "correct" : fieldState.status === "incorrect" ? "incorrect" : "";

      return `<div class="form-field">
        <div class="field-label">${escHtml(f.label)}</div>
        <input
          class="field-input ${statusCls}"
          id="s1-input-${s.idx}-${fi}"
          value="${escHtml(userVal)}"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          oninput="saveS1Input(${s.idx}, ${fi}, this.value)"
        />
      </div>`;
    })
    .join("");

  const resultText = s.answered[s.idx] && s.answered[s.idx].result ? `<div class="check-result">${escHtml(s.answered[s.idx].result)}</div>` : "";

  document.getElementById("s1-layout").innerHTML = `
    <div class="quiz-meta">
      <h2>Schreiben Teil 1</h2>
    </div>${sectionDescHtml('s1')}
    <div class="q-progress"><div class="q-progress-bar" style="width:${((s.idx + 1) / data.length) * 100}%"></div></div>
    <div class="scenario-box"><strong>Scenario:</strong><br>${escHtml(q.context)}</div>
    <div class="form-card">
      <h3>${escHtml(q.form_title || "Registration Form")}</h3>
      ${fieldHtml}
      <div class="action-row">
        <button class="q-btn primary" onclick="checkS1Answers()">Check Answers</button>
        <button class="q-btn" onclick="showS1Solution()">Show Solution</button>
        <button class="q-btn" onclick="resetS1Fields()">Reset</button>
      </div>
      ${resultText}
    </div>
    ${quizNavHtml(key, s.idx, data.length)}`;
}

function checkS1Answers() {
  const key = "s1";
  const s = qState[key];
  const q = D.schreiben1[s.idx];

  if (!s.answered[s.idx]) s.answered[s.idx] = {};

  let correctCount = 0;
  let total = 0;

  q.fields.forEach((f, fi) => {

    if (!f.blank) return;

    total++;

    // use field.number instead of fi
    const correctAnswer = q.answers?.[f.number] || "";

    const userVal = (s.answered[s.idx][fi]?.user || "").trim();

    const isCorrect = checkAnswerMatch(userVal, correctAnswer);

    s.answered[s.idx][fi] = {
      user: userVal,
      status: isCorrect ? "correct" : "incorrect"
    };

    if (isCorrect) correctCount++;
  });

  s.answered[s.idx].result =
      `${correctCount} out of ${total} correct`;

  renderS1();
}
function showS1Solution() {

    const key = "s1";
    const s = qState[key];
    const q = D.schreiben1[s.idx];

    if (!s.answered[s.idx])
        s.answered[s.idx] = {};

    q.fields.forEach((field, fi) => {

        if (!field.blank) return;

        s.answered[s.idx][fi] = {
            user: q.answers[field.number],
            status: "correct"
        };

    });

    s.answered[s.idx].result = "Solution shown";

    renderS1();
}
function resetS1Fields() {
  const s = qState["s1"];
  if (s.answered[s.idx]) delete s.answered[s.idx];
  renderS1();
}

function saveS1Input(qIdx, fi, val) {
  const s = qState["s1"];
  if (!s.answered[qIdx]) s.answered[qIdx] = {};
  if (!s.answered[qIdx][fi]) s.answered[qIdx][fi] = {};
  s.answered[qIdx][fi].user = val;
  delete s.answered[qIdx][fi].status;
  delete s.answered[qIdx].result;
}

// ════════════════════════════════════════════════
// SCHREIBEN 2 – Email writing
// ════════════════════════════════════════════════
function renderS2() {
  const key = "s2";
  const s = qState[key];
  const data = D.schreiben2;
  const q = data[s.idx];
  const pts = (q.required_points || []).map((p) => `<li>${escHtml(p)}</li>`).join("");
  const sampleVisible = (s.answered[s.idx] || {}).sampleVisible;
  const sampleText = [q.salutation, q.model_answer, q.closing]
    .filter(Boolean)
    .join("\n\n");

  document.getElementById("s2-layout").innerHTML = `
    <div class="quiz-meta">
      <h2>Schreiben Teil 2</h2>
    </div>${sectionDescHtml('s2')}
    <div class="q-progress"><div class="q-progress-bar" style="width:${((s.idx + 1) / data.length) * 100}%"></div></div>
    <div class="email-card compact">
      <h3>${escHtml(q.topic || "")}</h3>
      <div class="email-scenario">${escHtml(q.scenario || "")}</div>
      <div class="required-label">Required points:</div>
      <ul class="points-list">${pts}</ul>
      <div class="sample-action-row">
        <button class="q-btn" onclick="toggleS2Sample()">
          ${sampleVisible ? "Hide Sample Answer" : "Sample Answer"}
        </button>
      </div>
      ${sampleVisible ? `<div class="sample-answer-card" style="white-space: pre-wrap">${escHtml(sampleText)}</div>` : ""}
    </div>
    ${quizNavHtml(key, s.idx, data.length)}`;
}

function toggleS2Sample() {
  const s = qState["s2"];
  if (!s.answered[s.idx]) s.answered[s.idx] = {};
  s.answered[s.idx].sampleVisible = !s.answered[s.idx].sampleVisible;
  renderS2();
}

// ════════════════════════════════════════════════
// SCHREIBEN 2 – Interactive Guide (intro before the 44 letters)
// ════════════════════════════════════════════════
const s2gContent = {
  overview: [
    { icon: "✉️", title: "The Task", text: "You get a short situation with 3 required points. You write a short email or letter answering all 3 points." },
    { icon: "🎯", title: "The Goal", text: "Show that you can write simple, correct sentences and cover every point — not that you write a lot." },
    { icon: "🧭", title: "First Decision", text: "Before writing a single word, decide: is this letter formal (Sie) or informal (du)? Everything else follows from that." },
    { icon: "⏱️", title: "Time Management", text: "Read the task twice, underline the 3 points, choose your style, then write directly — don't overthink each sentence." },
  ],
  formal: {
    label: "Formal Letter",
    emoji: "🎩",
    when: ["Writing to someone you don't know", "Writing to an office, institute, school, or company", "The question shows \"Herr/Frau\" + a surname", "The person's gender or identity is unknown"],
    pronoun: "Sie · Ihre · Ihnen",
    tone: "Polite, respectful, no first names",
    greeting: "Sehr geehrte Damen und Herren,",
    closing: "Mit freundlichen Grüßen",
    example: {
      prompt: "Sie möchten im Juli Frankfurt besuchen. Schreiben Sie eine E-Mail an die Touristeninformation:\n– Warum schreiben Sie?\n– Bitten Sie: Informationen über Restaurants, Museen usw.\n– Fragen Sie: Hoteladressen?",
      answer: "Sehr geehrte Damen und Herren,\nmein Name ist Usama Ehsan. Ich möchte im Juli nach Frankfurt reisen. Ich brauche Informationen über Restaurants und Museen in Frankfurt. Können Sie mir auch ein paar Hotels empfehlen?\nVielen Dank im Voraus für Ihre Hilfe.\n\nMit freundlichen Grüßen\nUsama Ehsan",
    },
  },
  informal: {
    label: "Informal Letter",
    emoji: "😊",
    when: ["Writing to a friend or family member", "The question gives you only a first name", "Writing to a Freund/Freundin, Nachbar/Nachbarin", "Writing to a Kollege/Kollegin with no \"Herr/Frau\" + name given"],
    pronoun: "du · dein · dir",
    tone: "Friendly, casual, first names",
    greeting: "Lieber Thomas,",
    closing: "Viele Grüße",
    example: {
      prompt: "Sie möchten Ihren Geburtstag feiern und Ihren Freund Thomas einladen. Schreiben Sie Thomas eine E-Mail:\n– Warum schreiben Sie?\n– Sagen Sie: Wann und wo feiern Sie?\n– Fragen Sie: kommen?",
      answer: "Lieber Thomas,\nwie geht es dir? Ich hoffe, es geht dir gut. Ich möchte dich zu meinem Geburtstag einladen. Die Feier ist am Freitag um 18:00 Uhr bei mir zu Hause. Kannst du kommen?\nIch freue mich auf deine Antwort.\n\nViele Grüße\nUsama",
    },
  },
  structure: ["Greeting", "Opening sentence", "Answer Point 1", "Answer Point 2", "Answer Point 3", "Closing sentence", "Signature"],
  greetingsFormal: [
    { de: "Sehr geehrter Herr [Name],", en: "one man, name known" },
    { de: "Sehr geehrte Frau [Name],", en: "one woman, name known" },
    { de: "Sehr geehrte Damen und Herren,", en: "person / gender unknown" },
    { de: "Sehr geehrter Herr [Name] und sehr geehrter Herr [Name],", en: "two men" },
    { de: "Sehr geehrte Frau [Name] und sehr geehrte Frau [Name],", en: "two women" },
    { de: "Sehr geehrter Herr [Name] und sehr geehrte Frau [Name],", en: "one man + one woman" },
  ],
  greetingsInformal: [
    { de: "Lieber [Name],", en: "one male friend" },
    { de: "Liebe [Name],", en: "one female friend" },
    { de: "Lieber [Name] und lieber [Name],", en: "two male friends" },
    { de: "Liebe [Name] und liebe [Name],", en: "two female friends" },
    { de: "Lieber [Name] und liebe [Name],", en: "one male + one female friend" },
  ],
  sentenceCategories: [
    { title: "Giving Information", icon: "ℹ️", items: [
      { de: "Ich brauche Informationen über …", en: "I need information about …" },
      { de: "Ich möchte ein paar Informationen über … haben.", en: "I would like to have some information about …" },
    ]},
    { title: "Accepting an Invitation", icon: "✅", items: [
      { de: "Ich komme gern.", en: "I will gladly come." },
    ]},
    { title: "Declining an Invitation", icon: "🚫", items: [
      { de: "Leider kann ich nicht kommen.", en: "Unfortunately I cannot come." },
    ]},
    { title: "Saying When You'll Arrive", icon: "🕒", items: [
      { de: "Ich komme um [Uhrzeit].", en: "I will come at [time]." },
      { de: "Ich komme etwas später.", en: "I will come a little later." },
      { de: "Ich habe einen Termin um [Uhrzeit] und komme etwas später.", en: "I have an appointment at [time] and will come a little later." },
    ]},
    { title: "Asking a Question", icon: "❓", items: [
      { de: "Wann beginnt [die Feier / das Konzert]?", en: "When does [the party / the concert] begin?" },
      { de: "Wo ist die Feier? / Wo findet die Feier statt?", en: "Where is the celebration? / Where does it take place?" },
      { de: "Wie viel kostet [der Kurs / das Ticket]?", en: "How much does [the course / the ticket] cost?" },
    ]},
    { title: "Requesting Something", icon: "🙏", items: [
      { de: "Können Sie mir bitte (mehr) Informationen zu [Thema] schicken?", en: "Can you please send me (more) information about …?" },
      { de: "Kannst du / Können Sie mir bitte helfen?", en: "Can you please help me?" },
      { de: "Können Sie mir eine Liste mit [Dingen] schicken?", en: "Can you please send me a list of …?" },
    ]},
  ],
  closingSentences: [
    { de: "Vielen Dank im Voraus für Ihre Hilfe.", en: "Thanks in advance for your help.", tag: "Formal" },
    { de: "Ich freue mich auf Ihre Antwort.", en: "I will be happy for your answer.", tag: "Formal" },
    { de: "Ich freue mich auf deine Antwort.", en: "I will be happy for your answer.", tag: "Informal" },
  ],
  signOffs: [
    { de: "Mit freundlichen Grüßen", en: "Kind regards", tag: "Formal" },
    { de: "Viele Grüße", en: "Best wishes", tag: "Informal" },
  ],
  strategySteps: [
    { title: "Read the question", text: "Read the whole task once, without writing anything yet." },
    { title: "Identify the 3 points", text: "Underline or note the 3 things you must mention — every point earns marks." },
    { title: "Choose your style", text: "Look for \"Herr/Frau + Name\" (formal) or a first name / Freund (informal)." },
    { title: "Write the greeting", text: "Match the greeting exactly to the person and style you chose." },
    { title: "Answer every point", text: "Write one clear sentence per point, in the order they were asked." },
    { title: "Write the closing", text: "Add a closing sentence, then the correct sign-off and your name." },
    { title: "Check before finishing", text: "Re-read for capital nouns, verb position, and article endings." },
  ],
  examinerTips: [
    "Cover all three required points",
    "Match your greeting to formal or informal style",
    "Keep the verb in the correct position (2nd position in main clauses)",
    "Capitalize every noun",
    "Check article endings match the case (der → den/dem, die → der …)",
    "End with a matching closing sentence and Grußformel",
    "Write on rough paper first, then transfer neatly to the Antwortbogen",
  ],
  mistakes: [
    "Mixing formal \"Sie\" with informal \"du\" in the same letter",
    "Using the wrong greeting for the person's gender or number",
    "Forgetting to answer one of the three points",
    "Writing nouns in lowercase",
    "Wrong article ending after prepositions (e.g. \"zu seiner Feier\", not \"zu sein Feier\")",
    "Verb not placed correctly in the sentence",
    "Missing the closing sentence or the signature",
    "Copying the question instead of writing an original sentence",
  ],
  quiz: [
    {
      q: "You're writing to \"Frau Fischer\", someone you don't know personally. Which greeting is correct?",
      options: ["Liebe Frau Fischer,", "Sehr geehrte Frau Fischer,", "Hallo Frau Fischer,", "Frau Fischer,"],
      correct: 1,
      why: "\"Frau\" + a surname always signals a formal letter.",
    },
    {
      q: "\"Lieber Thomas,\" is a formal or informal greeting?",
      options: ["Formal", "Informal"],
      correct: 1,
      why: "A first name with \"Lieber/Liebe\" is always informal.",
    },
    {
      q: "What comes right after the greeting in a Schreiben Teil 2 email?",
      options: ["The closing sentence", "Your signature", "The opening sentence", "Answer point 3"],
      correct: 2,
      why: "Structure: Greeting → Opening sentence → the 3 points → Closing → Signature.",
    },
    {
      q: "Which sign-off matches \"Sehr geehrte Damen und Herren,\"?",
      options: ["Viele Grüße", "Mit freundlichen Grüßen", "Bis bald", "Dein Freund"],
      correct: 1,
      why: "A formal greeting always needs a formal sign-off.",
    },
    {
      q: "Which sentence correctly declines an invitation?",
      options: ["Ich komme gern.", "Ich freue mich auf deine Antwort.", "Leider kann ich nicht kommen.", "Wie geht es dir?"],
      correct: 2,
      why: "\"Leider kann ich nicht kommen\" politely says you cannot attend.",
    },
  ],
};

let s2gRendered = false;
let s2gScrollBound = false;
const s2gQuizState = {};

function s2gEsc(s) {
  return escHtml(s).replace(/\n/g, "&#10;");
}

function s2gCopyBtn(text) {
  return `<button class="s2g-copy-btn" data-copy="${s2gEsc(text)}" onclick="s2gCopy(this)">📋 Copy</button>`;
}

function s2gPhraseRow(item) {
  return `<div class="s2g-phrase">
    <div class="s2g-phrase-text">
      <div class="s2g-phrase-de">${escHtml(item.de)}</div>
      <div class="s2g-phrase-en">${escHtml(item.en)}</div>
    </div>
    ${s2gCopyBtn(item.de)}
  </div>`;
}

function s2gExampleCard(id, ex) {
  return `<div class="s2g-accordion" id="${id}">
    <button class="s2g-accordion-head" onclick="s2gToggleAcc('${id}')">
      <span>📄 See a real example</span><span class="s2g-acc-arrow">▾</span>
    </button>
    <div class="s2g-accordion-body">
      <div class="s2g-example-label">Task</div>
      <pre class="s2g-example-block">${escHtml(ex.prompt)}</pre>
      <div class="s2g-example-label">Sample Answer</div>
      <pre class="s2g-example-block s2g-example-answer">${escHtml(ex.answer)}</pre>
    </div>
  </div>`;
}

function s2gLetterCard(side, data) {
  return `<div class="s2g-letter-card s2g-${side}">
    <div class="s2g-letter-top"><span class="s2g-letter-emoji">${data.emoji}</span><h3>${escHtml(data.label)}</h3></div>
    <div class="s2g-letter-sub">Use when…</div>
    <ul class="s2g-letter-list">${data.when.map((w) => `<li>${escHtml(w)}</li>`).join("")}</ul>
    <div class="s2g-letter-grid">
      <div><span>Pronoun</span><strong>${escHtml(data.pronoun)}</strong></div>
      <div><span>Tone</span><strong>${escHtml(data.tone)}</strong></div>
    </div>
    <div class="s2g-letter-grid">
      <div><span>Greeting</span><strong>${escHtml(data.greeting)}</strong></div>
      <div><span>Closing</span><strong>${escHtml(data.closing)}</strong></div>
    </div>
    ${s2gExampleCard("s2g-ex-" + side, data.example)}
  </div>`;
}

function s2gRenderGuide() {
  const c = s2gContent;
  const html = `
  <div class="s2g">
    <nav class="s2g-nav">
      <div class="s2g-nav-inner">
        <span class="s2g-nav-brand">✉️ Schreiben Teil 2 Guide</span>
        <div class="s2g-nav-links">
          <a href="#s2g-formal">Formal/Informal</a>
          <a href="#s2g-structure">Structure</a>
          <a href="#s2g-greetings">Greetings</a>
          <a href="#s2g-phrases">Phrases</a>
          <a href="#s2g-mistakes">Mistakes</a>
          <a href="#s2g-quiz">Practice Quiz</a>
        </div>
        <button class="s2g-skip" onclick="s2gStartPracticing()">Skip to 44 Letters →</button>
      </div>
    </nav>

    <header class="s2g-hero">
      <div class="s2g-hero-shape s2g-shape1"></div>
      <div class="s2g-hero-shape s2g-shape2"></div>
      <div class="s2g-hero-shape s2g-shape3"></div>
      <div class="s2g-hero-icon">📮</div>
      <h1 class="s2g-reveal">🇩🇪 Schreiben Teil 2</h1>
      <p class="s2g-hero-sub s2g-reveal">Master Goethe A1 Letter Writing Before You Start Practicing</p>
      <p class="s2g-hero-desc s2g-reveal">Learn the complete format, greetings, sentence patterns, examiner tips, and common mistakes — then put it into practice on 44 real exam-style letters.</p>
      <button class="s2g-cta s2g-reveal" onclick="s2gScrollTo('s2g-overview')">🚀 Start Learning</button>
    </header>

    <section class="s2g-section" id="s2g-overview">
      <h2 class="s2g-reveal">What is Schreiben Teil 2?</h2>
      <div class="s2g-cards s2g-cards-4">
        ${c.overview.map((o) => `<div class="s2g-info-card s2g-reveal"><div class="s2g-info-icon">${o.icon}</div><h4>${escHtml(o.title)}</h4><p>${escHtml(o.text)}</p></div>`).join("")}
      </div>
    </section>

    <section class="s2g-section" id="s2g-formal">
      <h2 class="s2g-reveal">Formal vs Informal Letters</h2>
      <div class="s2g-letters-grid">
        <div class="s2g-reveal">${s2gLetterCard("formal", c.formal)}</div>
        <div class="s2g-reveal">${s2gLetterCard("informal", c.informal)}</div>
      </div>
    </section>

    <section class="s2g-section" id="s2g-structure">
      <h2 class="s2g-reveal">Letter Structure</h2>
      <div class="s2g-timeline">
        ${c.structure.map((step, i) => `
          <div class="s2g-tl-item s2g-reveal">
            <div class="s2g-tl-dot">${i + 1}</div>
            <div class="s2g-tl-label">${escHtml(step)}</div>
          </div>`).join("")}
      </div>
    </section>

    <section class="s2g-section" id="s2g-greetings">
      <h2 class="s2g-reveal">Greetings (Anrede)</h2>
      <div class="s2g-two-col">
        <div class="s2g-reveal">
          <div class="s2g-col-title">🎩 Formal Greetings</div>
          <div class="s2g-phrase-list">${c.greetingsFormal.map(s2gPhraseRow).join("")}</div>
        </div>
        <div class="s2g-reveal">
          <div class="s2g-col-title">😊 Informal Greetings</div>
          <div class="s2g-phrase-list">${c.greetingsInformal.map(s2gPhraseRow).join("")}</div>
        </div>
      </div>
    </section>

    <section class="s2g-section" id="s2g-phrases">
      <h2 class="s2g-reveal">Useful Sentence Patterns</h2>
      <div class="s2g-cat-grid">
        ${c.sentenceCategories.map((cat) => `
          <div class="s2g-cat-card s2g-reveal">
            <div class="s2g-cat-head">${cat.icon} ${escHtml(cat.title)}</div>
            <div class="s2g-phrase-list">${cat.items.map(s2gPhraseRow).join("")}</div>
          </div>`).join("")}
      </div>
    </section>

    <section class="s2g-section" id="s2g-closing">
      <h2 class="s2g-reveal">Closing Phrases</h2>
      <div class="s2g-chip-row s2g-reveal">
        ${c.closingSentences.map((s) => `<div class="s2g-chip" title="${escHtml(s.en)}"><span class="s2g-chip-tag">${escHtml(s.tag)}</span>${escHtml(s.de)}</div>`).join("")}
      </div>
      <div class="s2g-chip-row s2g-reveal">
        ${c.signOffs.map((s) => `<div class="s2g-chip s2g-chip-signoff" title="${escHtml(s.en)}"><span class="s2g-chip-tag">${escHtml(s.tag)}</span>${escHtml(s.de)}</div>`).join("")}
      </div>
    </section>

    <section class="s2g-section" id="s2g-strategy">
      <h2 class="s2g-reveal">Writing Strategy</h2>
      <div class="s2g-strategy-list">
        ${c.strategySteps.map((s, i) => `
          <div class="s2g-strategy-item s2g-reveal">
            <div class="s2g-strategy-num">${i + 1}</div>
            <div><div class="s2g-strategy-title">${escHtml(s.title)}</div><div class="s2g-strategy-text">${escHtml(s.text)}</div></div>
          </div>`).join("")}
      </div>
    </section>

    <section class="s2g-section" id="s2g-tips">
      <h2 class="s2g-reveal">Examiner Tips</h2>
      <div class="s2g-cards s2g-cards-2">
        ${c.examinerTips.map((t) => `<div class="s2g-check-card s2g-reveal"><span class="s2g-check-mark">✔</span>${escHtml(t)}</div>`).join("")}
      </div>
    </section>

    <section class="s2g-section" id="s2g-mistakes">
      <h2 class="s2g-reveal">Common Mistakes</h2>
      <div class="s2g-cards s2g-cards-2">
        ${c.mistakes.map((m) => `<div class="s2g-warn-card s2g-reveal"><span class="s2g-warn-mark">❌</span>${escHtml(m)}</div>`).join("")}
      </div>
    </section>

    <section class="s2g-section" id="s2g-revision">
      <h2 class="s2g-reveal">Quick Revision Sheet</h2>
      <div class="s2g-revision s2g-reveal">
        <div class="s2g-revision-col">
          <div class="s2g-revision-head">🎩 Formal</div>
          <div>Sehr geehrte Damen und Herren,</div>
          <div>mein Name ist [Full Name].</div>
          <div>… (answer the 3 points) …</div>
          <div>Vielen Dank im Voraus für Ihre Hilfe.</div>
          <div><strong>Mit freundlichen Grüßen</strong></div>
        </div>
        <div class="s2g-revision-col">
          <div class="s2g-revision-head">😊 Informal</div>
          <div>Lieber/Liebe [Name],</div>
          <div>wie geht es dir?</div>
          <div>… (answer the 3 points) …</div>
          <div>Ich freue mich auf deine Antwort.</div>
          <div><strong>Viele Grüße</strong></div>
        </div>
      </div>
    </section>

    <section class="s2g-section" id="s2g-quiz">
      <h2 class="s2g-reveal">Mini Practice</h2>
      <div class="s2g-quiz-list">
        ${c.quiz.map((q, qi) => `
          <div class="s2g-quiz-card s2g-reveal" id="s2g-quiz-${qi}">
            <div class="s2g-quiz-q">${qi + 1}. ${escHtml(q.q)}</div>
            <div class="s2g-quiz-opts">
              ${q.options.map((op, oi) => `<button class="s2g-quiz-opt" onclick="s2gAnswerQuiz(${qi},${oi})">${escHtml(op)}</button>`).join("")}
            </div>
            <div class="s2g-quiz-fb" id="s2g-quiz-fb-${qi}"></div>
          </div>`).join("")}
      </div>
    </section>

    <section class="s2g-final">
      <div class="s2g-final-card s2g-reveal">
        <h2>🎯 Ready to Practice?</h2>
        <p>You have completed the guide. Now it's time to solve all 44 Goethe A1 Schreiben Teil 2 practice letters.</p>
        <button class="s2g-cta" onclick="s2gStartPracticing()">🚀 Start Practicing</button>
      </div>
    </section>
  </div>`;

  document.getElementById("s2-guide").innerHTML = html;
}

function s2gInit() {
  if (!s2gRendered) {
    s2gRenderGuide();
    s2gRendered = true;
    s2gSetupObserver();
  }
  if (!s2gScrollBound) {
    const area = document.querySelector(".content-area");
    if (area) {
      area.addEventListener("scroll", s2gOnScroll);
      s2gScrollBound = true;
    }
  }
  s2gOnScroll();
}

function s2gSetupObserver() {
  const els = document.querySelectorAll("#s2-guide .s2g-reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("s2g-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("s2g-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

function s2gOnScroll() {
  if (currentPanel !== "schreiben2") return;
  const area = document.querySelector(".content-area");
  const fill = document.getElementById("s2g-progress-fill");
  const fab = document.getElementById("s2g-fab");
  if (!area || !fill) return;
  const max = area.scrollHeight - area.clientHeight;
  const pct = max > 0 ? Math.min(100, (area.scrollTop / max) * 100) : 0;
  fill.style.width = pct + "%";
  if (fab) fab.classList.toggle("s2g-fab-visible", area.scrollTop > 400);
}

function s2gScrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function s2gScrollTop() {
  const area = document.querySelector(".content-area");
  if (area) area.scrollTo({ top: 0, behavior: "smooth" });
}

function s2gStartPracticing() {
  const wrap = document.getElementById("s2-practice-section");
  if (wrap) wrap.classList.remove("s2g-practice-hidden");
  setTimeout(() => s2gScrollTo("s2-practice-section"), 50);
}

function s2gToggleAcc(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("s2g-open");
}

function s2gCopy(btn) {
  const text = btn.getAttribute("data-copy").replace(/&#10;/g, "\n");
  const done = () => {
    const orig = btn.textContent;
    btn.textContent = "✅ Copied";
    btn.classList.add("s2g-copied");
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove("s2g-copied");
    }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => s2gFallbackCopy(text, done));
  } else {
    s2gFallbackCopy(text, done);
  }
}

function s2gFallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch (e) {}
  document.body.removeChild(ta);
}

function s2gAnswerQuiz(qi, oi) {
  if (s2gQuizState[qi] !== undefined) return;
  s2gQuizState[qi] = oi;
  const q = s2gContent.quiz[qi];
  const card = document.getElementById("s2g-quiz-" + qi);
  const fb = document.getElementById("s2g-quiz-fb-" + qi);
  const opts = card.querySelectorAll(".s2g-quiz-opt");
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("s2g-opt-correct");
    else if (i === oi) btn.classList.add("s2g-opt-wrong");
  });
  fb.innerHTML =
    oi === q.correct
      ? `<span class="s2g-fb-good">✔ Correct!</span> ${escHtml(q.why)}`
      : `<span class="s2g-fb-bad">✘ Not quite.</span> ${escHtml(q.why)}`;
  fb.classList.add("s2g-fb-visible");
}

// ════════════════════════════════════════════════
// ════════════════════════════════════════════════
// SPRECHEN 1 – Sich vorstellen (self-introduction)
// ════════════════════════════════════════════════
const sp1ThemaColors = {
  Geburtsdatum: "#0288d1",
  Buchstabieren: "#8d6e63",
  Adresse: "#f57f17",
  Land: "#388e3c",
  Wohnort: "#00695c",
  Kontakt: "#455a64",
  Sprachen: "#6a1b9a",
  Name: "#d32f2f",
  Alter: "#c2185b",
  Studium: "#1565c0",
  Beruf: "#5d4037",
  Familie: "#7b1fa2",
  "Essen & Trinken": "#ef6c00",
  Haustier: "#6d4c41",
  Freizeit: "#2e7d32",
  Reisen: "#00838f",
  Verkehr: "#616161",
  Wetter: "#0097a7",
  "Deutsch lernen": "#ad1457",
  Sonstiges: "#37474f",
};
const sp1State = { category: "Alle", search: "", cards: {} };
const sp1ExamCardFields = ["Name?", "Alter?", "Land?", "Wohnort?", "Sprachen?", "Beruf?", "Hobby?"];
const sp1Example = {
  de: "Guten Tag! Ich heiße Anna Schmidt. Ich komme aus Deutschland und wohne in Berlin. Ich bin 22 Jahre alt. Ich spreche Deutsch, Englisch und ein bisschen Französisch. Ich bin Studentin und mein Hobby ist Fotografieren.",
  en: "Hello! My name is Anna Schmidt. I come from Germany and live in Berlin. I am 22 years old. I speak German, English and a little French. I am a student and my hobby is photography.",
};

function sp1Color(cat) {
  return sp1ThemaColors[cat] || "var(--accent)";
}
function sp1Categories() {
  return ["Alle", ...new Set(D.sprechen1.map((c) => c.category))];
}
function sp1Filtered() {
  const q = sp1State.search.trim().toLowerCase();
  return D.sprechen1.filter((c) => {
    const catMatch = sp1State.category === "Alle" || c.category === sp1State.category;
    const search =
      q === "" ||
      (c.question_de || "").toLowerCase().includes(q) ||
      (c.question_en || "").toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q);
    return catMatch && search;
  });
}
function renderSp1() {
  const total = D.sprechen1.length;
  document.getElementById("sp1-layout").innerHTML = `
  ${sectionDescHtml('sp1')}
    <div class="sp1-examcard">
      <div class="sp1-examcard-head">Start Deutsch 1</div>
      
      <div class="sp1-examcard-sub">Übungssatz · Sprechen Teil 1</div>
      <div class="sp1-examcard-body">
        <div class="sp1-examcard-label">Teil 1 &nbsp;·&nbsp; Sich vorstellen</div>
        ${sp1ExamCardFields.map((f) => `<div class="sp1-examcard-row">${f}</div>`).join("")}
      </div>
    </div>
    <div class="sp1-example">
      <div class="sp2-label">💬 Beispiel · Sich vorstellen</div>
      <p class="sp1-example-de">${escHtml(sp1Example.de)}</p>
      <p class="sp1-example-en">${escHtml(sp1Example.en)}</p>
     
      <button class="sp2-speak-btn" onclick="sp1SpeakExample()">🔊 Beispiel hören</button>
    </div>
    <div class="sp2-search">
      <input type="text" id="sp1-search-input" placeholder="🔍 Frage, Übersetzung oder Kategorie suchen…"
        autocomplete="off" oninput="sp1State.search=this.value;sp1RenderCards()" />
    </div>
    <div class="sp2-topics" id="sp1-topics"></div>
    <div class="sp2-count"><span id="sp1-count">0</span> Fragen angezeigt</div>
    <div class="sp2-grid" id="sp1-grid"></div>
    <div class="sp2-no-results" id="sp1-no-results" style="display:none">
      Keine Fragen gefunden. Probiere ein anderes Stichwort oder eine andere Kategorie.
    </div>`;
  document.getElementById("sp1-search-input").value = sp1State.search;
  sp1RenderTopics();
  sp1RenderCards();
}
function sp1RenderTopics() {
  const wrap = document.getElementById("sp1-topics");
  wrap.innerHTML = sp1Categories()
    .map((t) => {
      const active = t === sp1State.category;
      const color = sp1Color(t);
      const style = active
        ? `background:${t === "Alle" ? "var(--dark)" : color};border-color:${
            t === "Alle" ? "var(--dark)" : color
          }`
        : "";
      return `<button class="sp2-topic-btn${active ? " active" : ""}" style="${style}"
        onclick="sp1SetCategory('${t.replace(/'/g, "\\'")}')">${escHtml(t === "Alle" ? "📚 Alle" : t)}</button>`;
    })
    .join("");
}
function sp1RenderCards() {
  const total = D.sprechen1.length;
  const filtered = sp1Filtered();
  document.getElementById("sp1-count").textContent = filtered.length;
  document.getElementById("sp1-no-results").style.display = filtered.length ? "none" : "block";
  document.getElementById("sp1-grid").innerHTML = filtered
    .map((c) => {
      const flipped = !!sp1State.cards[c.id];
      const color = sp1Color(c.category);
      const themeStyle = flipped ? `background:${color}` : "";
      return `
      <article class="sp2-card${flipped ? " flipped" : ""}" onclick="sp1Flip(${c.id})">
        <div class="sp2-card-top"><span>Sprechen Teil 1</span><span>Sich vorstellen</span></div>
        <div class="sp2-card-theme" style="${themeStyle}"><span>Kategorie: ${escHtml(c.category || "")}</span></div>
        <div class="sp2-card-keyword">${escHtml(c.question_de || "")}</div>
        <div class="sp2-card-footer"><span>#${c.id} / ${total}</span><span>${flipped ? "" : "Tippen →"}</span></div>
        <div class="sp2-answer${flipped ? " visible" : ""}">
          <div class="sp2-section">
            <span class="sp2-label">🇬🇧 Übersetzung</span>
            <p class="sp2-question-text">${escHtml(c.question_en || "")}</p>
          </div>
          <div class="sp2-section">
            <span class="sp2-label">✅ Antwort</span>
            <p class="sp2-answer-text">${escHtml(c.answer_de || "")}</p>
            <button class="sp2-speak-btn" onclick="event.stopPropagation();sp1Speak(${c.id})">🔊 Antwort hören</button>
          </div>
          <div class="sp2-section">
            <span class="sp2-label">🇬🇧 Antwort auf Englisch</span>
            <p class="sp2-answer-text">${escHtml(c.answer_en || "")}</p>
          </div>
        </div>
      </article>`;
    })
    .join("");
}
function sp1Flip(id) {
  sp1State.cards[id] = !sp1State.cards[id];
  sp1RenderCards();
}
function sp1SetCategory(t) {
  sp1State.category = t;
  sp1RenderTopics();
  sp1RenderCards();
}
function sp1Speak(id) {
  const card = D.sprechen1.find((c) => c.id === id);
  if (!card) return;
  const u = new SpeechSynthesisUtterance(card.answer_de || "");
  u.lang = "de-DE";
  u.rate = 0.85;
  const deVoice = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith("de"));
  if (deVoice) u.voice = deVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
function sp1SpeakExample() {
  const u = new SpeechSynthesisUtterance(sp1Example.de);
  u.lang = "de-DE";
  u.rate = 0.85;
  const deVoice = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith("de"));
  if (deVoice) u.voice = deVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// SPRECHEN 2 – Answer questions
// ════════════════════════════════════════════════
const sp2ThemaColors = {
  "Essen & Trinken": "#e65c00",
  Familie: "#1a6bb5",
  Wohnen: "#2e7d32",
  "Freizeit & Hobby": "#7b1fa2",
  "Arbeit & Beruf": "#c62828",
  "Schule & Lernen": "#00838f",
  "Reisen & Verkehr": "#4527a0",
  Gesundheit: "#558b2f",
  Einkaufen: "#bf360c",
  "Sprachen & Länder": "#1565c0",
  Tagesablauf: "#795548",
  "Wetter & Jahreszeiten": "#0277bd",
  "Feste & Feiertage": "#ad1457",
  "Körper & Aussehen": "#6a1b9a",
  "Kleidung & Mode": "#e91e63",
  "Technik & Medien": "#37474f",
  "Natur & Umwelt": "#388e3c",
  "Stadt & Orientierung": "#f57f17",
  "Zahlen & Uhrzeit": "#0288d1",
  "Gefühle & Meinungen": "#d81b60",
};
const sp2State = { thema: "Alle", search: "", set: "all", cards: {} };
const sp2Mid = Math.ceil(D.sprechen2.length / 2);

function sp2Color(thema) {
  return sp2ThemaColors[thema] || "var(--accent)";
}
function sp2Themen() {
  return ["Alle", ...new Set(D.sprechen2.map((c) => c.thema))];
}
function sp2Filtered() {
  const q = sp2State.search.trim().toLowerCase();
  return D.sprechen2.filter((c) => {
    const setMatch =
      sp2State.set === "all" ||
      (sp2State.set === "set1" && c.id <= sp2Mid) ||
      (sp2State.set === "set2" && c.id > sp2Mid);
    const themeMatch = sp2State.thema === "Alle" || c.thema === sp2State.thema;
    const search =
      q === "" ||
      (c.keyword || "").toLowerCase().includes(q) ||
      (c.thema || "").toLowerCase().includes(q) ||
      (c.question || "").toLowerCase().includes(q);
    return setMatch && themeMatch && search;
  });
}
function renderSp2() {
  const total = D.sprechen2.length;
  document.getElementById("sp2-layout").innerHTML = `
   ${sectionDescHtml('sp2')}
    <div class="sp2-controls">
      <button class="sp2-set-btn" data-set="all" onclick="sp2SetShow('all')">📚 Alle ${total} Karten</button>
      <button class="sp2-set-btn" data-set="set1" onclick="sp2SetShow('set1')">🟡 Set 1: 1–${sp2Mid}</button>
      <button class="sp2-set-btn" data-set="set2" onclick="sp2SetShow('set2')">🟢 Set 2: ${sp2Mid + 1}–${total}</button>
    </div>
    <div class="sp2-search">
      <input type="text" id="sp2-search-input" placeholder="🔍 Stichwort, Thema oder Frage suchen…"
        autocomplete="off" oninput="sp2State.search=this.value;sp2RenderCards()" />
    </div>
    <div class="sp2-topics" id="sp2-topics"></div>
    <div class="sp2-count"><span id="sp2-count">0</span> Karten angezeigt</div>
    <div class="sp2-grid" id="sp2-grid"></div>
    <div class="sp2-no-results" id="sp2-no-results" style="display:none">
      Keine Karten gefunden. Probiere ein anderes Stichwort oder Thema.
    </div>`;
  const input = document.getElementById("sp2-search-input");
  input.value = sp2State.search;
  sp2RenderTopics();
  sp2RenderSetButtons();
  sp2RenderCards();
}
function sp2RenderTopics() {
  const wrap = document.getElementById("sp2-topics");
  wrap.innerHTML = sp2Themen()
    .map((t) => {
      const active = t === sp2State.thema;
      const color = sp2Color(t);
      const style = active
        ? `background:${t === "Alle" ? "var(--dark)" : color};border-color:${
            t === "Alle" ? "var(--dark)" : color
          }`
        : "";
      return `<button class="sp2-topic-btn${active ? " active" : ""}" style="${style}"
        onclick="sp2SetThema('${t.replace(/'/g, "\\'")}')">${escHtml(t === "Alle" ? "📚 Alle" : t)}</button>`;
    })
    .join("");
}
function sp2RenderSetButtons() {
  document.querySelectorAll("#sp2-layout .sp2-set-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.set === sp2State.set);
  });
}
function sp2RenderCards() {
  const total = D.sprechen2.length;
  const filtered = sp2Filtered();
  document.getElementById("sp2-count").textContent = filtered.length;
  document.getElementById("sp2-no-results").style.display = filtered.length ? "none" : "block";
  document.getElementById("sp2-grid").innerHTML = filtered
    .map((c) => {
      const st = sp2State.cards[c.id] || { flipped: false, hint: false };
      const color = sp2Color(c.thema);
      const themeStyle = st.flipped ? `background:${color}` : "";
      return `
      <article class="sp2-card${st.flipped ? " flipped" : ""}" onclick="sp2Flip(${c.id})">
        <div class="sp2-card-top"><span>Modellsatz</span><span>Kandidatenblätter</span></div>
        <div class="sp2-card-theme" style="${themeStyle}"><span>Thema: ${escHtml(c.thema || "")}</span></div>
        <div class="sp2-card-keyword">${escHtml(c.keyword || "")}</div>
        <div class="sp2-card-footer"><span>#${c.id} / ${total}</span><span>${st.flipped ? "" : "Tippen →"}</span></div>
        <div class="sp2-answer${st.flipped ? " visible" : ""}">
          <div class="sp2-section">
            <span class="sp2-label">❓ Frage</span>
            <p class="sp2-question-text">${escHtml(c.question || "")}</p>
            <button class="sp2-speak-btn" onclick="event.stopPropagation();sp2Speak(${c.id},'question')">🔊 Frage hören</button>
          </div>
          <div class="sp2-section">
            <span class="sp2-label">✅ Antwort</span>
            <p class="sp2-answer-text">${escHtml(c.answer || "")}</p>
            <button class="sp2-speak-btn" onclick="event.stopPropagation();sp2Speak(${c.id},'answer')">🔊 Antwort hören</button>
          </div>
          ${
            c.hint
              ? `<div class="sp2-section">
            <button class="sp2-hint-btn" onclick="event.stopPropagation();sp2Hint(${c.id})">${
              st.hint ? "▲ Grammatik ausblenden" : "▼ 💡 Grammatik-Tipp"
            }</button>
            <div class="sp2-hint-panel" style="display:${st.hint ? "block" : "none"}">${escHtml(c.hint)}</div>
          </div>`
              : ""
          }
        </div>
      </article>`;
    })
    .join("");
}
function sp2Flip(id) {
  const st = sp2State.cards[id] || { flipped: false, hint: false };
  sp2State.cards[id] = { ...st, flipped: !st.flipped };
  sp2RenderCards();
}
function sp2Hint(id) {
  const st = sp2State.cards[id] || { flipped: true, hint: false };
  sp2State.cards[id] = { ...st, hint: !st.hint };
  sp2RenderCards();
}
function sp2SetThema(t) {
  sp2State.thema = t;
  sp2RenderTopics();
  sp2RenderCards();
}
function sp2SetShow(set) {
  sp2State.set = set;
  sp2RenderSetButtons();
  sp2RenderCards();
}
function sp2Speak(id, field) {
  const card = D.sprechen2.find((c) => c.id === id);
  if (!card) return;
  const text = field === "answer" ? card.answer : card.question;
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.85;
  const deVoice = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith("de"));
  if (deVoice) u.voice = deVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ════════════════════════════════════════════════
// SPRECHEN 3 – Object cards
// ════════════════════════════════════════════════
const sp3State = { category: "Alle", search: "", cards: {} };

function sp3Categories() {
  return ["Alle", ...new Set(D.sprechen3.map((c) => c.category))];
}
function sp3Filtered() {
  const q = sp3State.search.trim().toLowerCase();
  return D.sprechen3.filter((c) => {
    const catMatch = sp3State.category === "Alle" || c.category === sp3State.category;
    const search =
      q === "" ||
      (c.german || "").toLowerCase().includes(q) ||
      (c.english || "").toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q);
    return catMatch && search;
  });
}
function renderSp3() {
  document.getElementById("sp3-layout").innerHTML = `
  ${sectionDescHtml('sp3')}
    <div class="sp3-search">
      <input type="text" id="sp3-search-input" placeholder="🔍 Wort, Übersetzung oder Kategorie suchen…"
        autocomplete="off" oninput="sp3State.search=this.value;sp3RenderCards()" />
    </div>
    <div class="sp2-topics" id="sp3-topics"></div>
    <div class="sp2-count"><span id="sp3-count">0</span> Karten angezeigt</div>
    <div class="sp3-grid" id="sp3-grid"></div>
    <div class="sp2-no-results" id="sp3-no-results" style="display:none">
      Keine Karten gefunden. Probiere ein anderes Stichwort oder eine andere Kategorie.
    </div>`;
  document.getElementById("sp3-search-input").value = sp3State.search;
  sp3RenderTopics();
  sp3RenderCards();
}
function sp3RenderTopics() {
  const wrap = document.getElementById("sp3-topics");
  wrap.innerHTML = sp3Categories()
    .map((t) => {
      const active = t === sp3State.category;
      return `<button class="sp2-topic-btn${active ? " active" : ""}"
        onclick="sp3SetCategory('${t.replace(/'/g, "\\'")}')">${escHtml(t === "Alle" ? "📚 Alle" : t)}</button>`;
    })
    .join("");
}
function sp3RenderCards() {
  const total = D.sprechen3.length;
  const filtered = sp3Filtered();
  document.getElementById("sp3-count").textContent = filtered.length;
  document.getElementById("sp3-no-results").style.display = filtered.length ? "none" : "block";
  document.getElementById("sp3-grid").innerHTML = filtered
    .map((c) => {
      const flipped = !!sp3State.cards[c.id];
      return `
      <article class="sp3-card${flipped ? " flipped" : ""}" onclick="sp3Flip(${c.id})">
        <div class="sp3-card-emoji">${escHtml(c.emoji || "❓")}</div>
        ${
          flipped
            ? `<div class="sp3-card-back">
            <div class="sp3-card-cat">${escHtml(c.category || "")} · ${escHtml(c.difficulty || "")}</div>
            <div class="sp3-card-word">${escHtml(c.german || "")}</div>
            <div class="sp3-card-en">${escHtml(c.english || "")}</div>
            <div class="sp2-section">
              <span class="sp2-label">❓ Frage</span>
              <p class="sp2-question-text">${escHtml(c.example_question || "")}</p>
              <button class="sp2-speak-btn" onclick="event.stopPropagation();sp3Speak(${c.id},'question')">🔊 Frage hören</button>
            </div>
            <div class="sp2-section">
              <span class="sp2-label">✅ Antwort</span>
              <p class="sp2-answer-text">${escHtml(c.example_answer || "")}</p>
              <button class="sp2-speak-btn" onclick="event.stopPropagation();sp3Speak(${c.id},'answer')">🔊 Antwort hören</button>
            </div>
          </div>`
            : `<div class="sp3-card-hint">Tippen →</div>`
        }
        <div class="sp3-card-footer">#${c.id} / ${total}</div>
      </article>`;
    })
    .join("");
}
function sp3Flip(id) {
  sp3State.cards[id] = !sp3State.cards[id];
  sp3RenderCards();
}
function sp3SetCategory(t) {
  sp3State.category = t;
  sp3RenderTopics();
  sp3RenderCards();
}
function sp3Speak(id, field) {
  const card = D.sprechen3.find((c) => c.id === id);
  if (!card) return;
  const text = field === "answer" ? card.example_answer : card.example_question;
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.85;
  const deVoice = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith("de"));
  if (deVoice) u.voice = deVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════
if (window.innerWidth <= 768) {
  document.getElementById("sidebar").classList.add("closed");
}
showPanel("dashboard", document.querySelector('[data-panel="dashboard"]'));
window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();
    const germanVoices = voices.filter(v => v.lang && v.lang.startsWith("de"));
    console.log("🎤 Available German voices:", germanVoices.map(v => v.name));
};
