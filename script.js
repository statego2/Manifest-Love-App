const STORAGE_KEY = "manifest-loving-girlfriend-contract-v1";
const TOTAL_DAYS = 30;

const defaultStatement =
  "I have built, live, and enjoy a beautiful, deep relationship of love with my girlfriend.";

const state = loadState();
const app = document.getElementById("app");

render();

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;

  if (action === "go-step") {
    state.setupStep = button.dataset.step;
    saveState();
    render();
    return;
  }

  if (action === "use-example") {
    state.draft.statement = defaultStatement;
    saveState();
    render();
    return;
  }

  if (action === "add-exchange") {
    state.draft.exchange.push("");
    saveState();
    render();
    return;
  }

  if (action === "remove-exchange") {
    const index = Number(button.dataset.index);

    if (state.draft.exchange.length > 1) {
      state.draft.exchange.splice(index, 1);
      saveState();
      render();
    }
    return;
  }

  if (action === "create-contract") {
    const statement = state.draft.statement.trim();
    const exchange = sanitizeExchange(state.draft.exchange);

    if (!statement) {
      alert("Write your manifestation statement before creating the contract.");
      return;
    }

    if (exchange.length === 0) {
      alert("Add at least one thing you are willing to give for this reality.");
      return;
    }

    state.draft.exchange = exchange;
    state.setupStep = "contract";
    saveState();
    render();
    return;
  }

  if (action === "sign-contract") {
    const todayKey = getLocalDateKey();

    state.contract = {
      statement: state.draft.statement.trim(),
      exchange: sanitizeExchange(state.draft.exchange),
      signedAt: new Date().toISOString(),
      startDate: todayKey,
      dailyEntries: {},
    };

    state.setupStep = "dashboard";
    saveState();
    render();
    return;
  }

  if (action === "mark-repetition") {
    markToday("repeatedAt");
    return;
  }

  if (action === "mark-resign") {
    markToday("resignedAt");
    return;
  }

  if (action === "reset-contract") {
    const shouldReset = window.confirm(
      "Start over and erase this contract? This will clear the 30-day progress."
    );

    if (!shouldReset) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    state.setupStep = "welcome";
    state.draft = { statement: "", exchange: ["", "", ""] };
    state.contract = null;
    render();
  }
});

app.addEventListener("input", (event) => {
  const target = event.target;

  if (target.matches("[data-field='statement']")) {
    state.draft.statement = target.value;
    saveState();
    return;
  }

  if (target.matches("[data-field='exchange']")) {
    const index = Number(target.dataset.index);
    state.draft.exchange[index] = target.value;
    saveState();
  }
});

function render() {
  app.innerHTML = state.contract ? renderDashboard() : renderSetup();
}

function renderSetup() {
  const step = state.setupStep || "welcome";
  const progressMap = {
    welcome: 1,
    statement: 2,
    exchange: 3,
    contract: 4,
  };

  return `
    <div class="app-card setup-card">
      <div class="setup-grid">
        <section class="panel">
          <h4>Setup ${progressMap[step]} / 4</h4>
          ${renderSetupStep(step)}
        </section>

        <aside class="setup-side">
          <section class="panel side-note">
            <div class="vision-card sacred-vision" aria-hidden="true">
              <div class="vision-glow glow-one"></div>
              <div class="vision-glow glow-two"></div>
              <div class="vision-glow glow-three"></div>
              <div class="vision-figure figure-left"></div>
              <div class="vision-figure figure-right"></div>
              <div class="vision-particle particle-one"></div>
              <div class="vision-particle particle-two"></div>
              <div class="vision-particle particle-three"></div>
              <div class="vision-particle particle-four"></div>
            </div>
            <h3>Sacred Setup</h3>
            <p>
              This is not a generic journal. It is a focused 30-day agreement:
              write what is already yours, decide what you give in return,
              then come back every day and keep your word.
            </p>
            <div class="ritual-quote">
              <p>
                “Enter the portal. Speak it as reality. Keep the contract
                glowing.”
              </p>
            </div>
            <div class="divider"></div>
            <div class="timeline-row">
              <div class="stat-pill">
                <strong>1 setup</strong>
                <span>Sacred entry into the agreement</span>
              </div>
              <div class="stat-pill">
                <strong>30 days</strong>
                <span>A visible contract path</span>
              </div>
              <div class="stat-pill">
                <strong>20 readings</strong>
                <span>Daily spoken repetition</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  `;
}

function renderSetupStep(step) {
  if (step === "statement") {
    return `
      <h2>Write your manifestation statement</h2>
      <p>
        Put the reality into words as if it has already happened. The tone
        should feel present, lived, and real.
      </p>
      <label class="field-label" for="statement">
        Your statement
        <span class="field-tip">(Write it in the present tense, as if it has already happened.)</span>
      </label>
      <textarea
        id="statement"
        class="text-input"
        data-field="statement"
        placeholder="${defaultStatement}"
      >${escapeHtml(state.draft.statement)}</textarea>
      <div class="inline-actions" style="margin-top: 0.85rem;">
        <button class="ghost-button" data-action="use-example">Use the example wording</button>
      </div>
      <p class="helper-text">
        Example: ${defaultStatement}
      </p>
      <div class="form-actions" style="margin-top: 1.35rem;">
        <button class="secondary-button" data-action="go-step" data-step="welcome">Back</button>
        <button class="primary-button" data-action="go-step" data-step="exchange">Continue</button>
      </div>
    `;
  }

  if (step === "exchange") {
    return `
      <h2>What are you willing to give for this?</h2>
      <p>
        Write the actions, sacrifices, and commitments you agree to keep for
        the next 30 days. This is what gives the agreement weight.
      </p>
      <div class="exchange-list">
        ${state.draft.exchange
          .map(
            (item, index) => `
              <div class="exchange-item">
                <div class="exchange-index">${index + 1}</div>
                <input
                  type="text"
                  class="list-input"
                  data-field="exchange"
                  data-index="${index}"
                  value="${escapeAttribute(item)}"
                  placeholder="I will..."
                />
                <button
                  class="remove-button"
                  data-action="remove-exchange"
                  data-index="${index}"
                  aria-label="Remove commitment ${index + 1}"
                >
                  ×
                </button>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="action-row" style="margin-top: 1rem;">
        <button class="ghost-button" data-action="add-exchange">Add another commitment</button>
      </div>
      <div class="form-actions" style="margin-top: 1.35rem;">
        <button class="secondary-button" data-action="go-step" data-step="statement">Back</button>
        <button class="primary-button" data-action="create-contract">Create My Contract</button>
      </div>
    `;
  }

  if (step === "contract") {
    return `
      <h2>Your contract is ready</h2>
      <p>
        Read it slowly. If it feels true enough to keep for the next 30 days,
        sign it and begin.
      </p>
      <div class="contract-block">
        ${renderContractText(state.draft.statement.trim(), sanitizeExchange(state.draft.exchange))}
      </div>
      <div class="form-actions" style="margin-top: 1.35rem;">
        <button class="secondary-button" data-action="go-step" data-step="exchange">Back</button>
        <button class="primary-button" data-action="sign-contract">Sign Contract</button>
      </div>
    `;
  }

  return `
    <h2>Enter your 30-day agreement</h2>
    <p>
      This setup creates one focused manifestation ritual. You will write the
      reality in the present tense, define what you give in return, and enter a
      visible daily contract for 30 days.
    </p>
    <div class="stat-row">
      <div class="stat-pill">
        <strong>Manifest a Loving Girlfriend</strong>
        <span>Focused desire. Clear wording. Daily ritual.</span>
      </div>
      <div class="stat-pill">
        <strong>Re-sign daily</strong>
        <span>Return once a day and renew the agreement.</span>
      </div>
    </div>
    <div class="form-actions" style="margin-top: 1.5rem;">
      <button class="primary-button" data-action="go-step" data-step="statement">Begin</button>
    </div>
  `;
}

function renderDashboard() {
  const summary = getContractSummary();
  const todayEntry = summary.todayEntry;
  const todayComplete = isEntryComplete(todayEntry);
  const ritualReadyForResign = Boolean(todayEntry?.repeatedAt);
  const title = summary.hasEnded
    ? summary.completedDays === TOTAL_DAYS
      ? "Your contract is fulfilled"
      : "Your 30-day window is complete"
    : `Day ${summary.currentDay} of ${TOTAL_DAYS}`;
  const subtitle = summary.hasEnded
    ? "The ritual has reached its close. What remains is the record of how faithfully you kept it."
    : `${summary.remainingDays} days remaining`;

  return `
    <div class="app-card dashboard-card">
      <div class="dashboard-grid">
        <section class="panel">
          <h4>Active Contract</h4>
          <h2>${title}</h2>
          <p>${subtitle}</p>

          <div class="metric-grid">
            <article class="metric-card active">
              <strong class="metric-value">${summary.completedDays} / ${TOTAL_DAYS}</strong>
              <span class="metric-label">Days completed</span>
            </article>
            <article class="metric-card">
              <strong class="metric-value">${summary.remainingDays}</strong>
              <span class="metric-label">Days remaining</span>
            </article>
            <article class="metric-card">
              <strong class="metric-value">${summary.contractState}</strong>
              <span class="metric-label">Agreement status</span>
            </article>
          </div>

          <div class="manifestation-card" style="margin-top: 1.25rem;">
            <h4>Your Manifestation</h4>
            <blockquote>${escapeHtml(state.contract.statement)}</blockquote>
          </div>

          <div class="commitment-list">
            ${state.contract.exchange.length
              ? state.contract.exchange
                  .map(
                    (item) => `
                      <div class="commitment-item">${escapeHtml(item)}</div>
                    `
                  )
                  .join("")
              : `
                <div class="empty-note">No exchange commitments were saved for this contract.</div>
              `}
          </div>

          <div class="divider"></div>
          <h3>Love Path</h3>
          <p class="small-copy">
            Keep the visual trail glowing. Each heart marks whether the day was
            sealed, missed, present, or still ahead.
          </p>
          <div class="tracker">
            ${renderTracker(summary)}
          </div>
        </section>

        <aside class="setup-side">
          <section class="ritual-card">
            <div class="vision-card destiny-vision" aria-hidden="true">
              <div class="vision-glow glow-one"></div>
              <div class="vision-glow glow-two"></div>
              <div class="vision-heart"></div>
              <div class="vision-skyline skyline-left"></div>
              <div class="vision-skyline skyline-mid"></div>
              <div class="vision-skyline skyline-right"></div>
              <div class="vision-walkway"></div>
              <div class="vision-silhouette silhouette-left"></div>
              <div class="vision-silhouette silhouette-right"></div>
            </div>
            <h4>Today's Agreement</h4>
            <h3>Return to your word</h3>
            <p>
              Read your manifestation statement aloud 20 times. Then re-sign
              today as a conscious renewal of the contract.
            </p>
            <div class="check-row ${todayEntry?.repeatedAt ? "complete" : ""}">
              <div class="check-badge">${todayEntry?.repeatedAt ? "✓" : "1"}</div>
              <div class="check-copy">
                <strong>Read it aloud 20 times</strong>
                <span>
                  ${todayEntry?.repeatedAt
                    ? `Marked on ${formatDateTime(todayEntry.repeatedAt)}`
                    : "Complete the spoken repetition first."}
                </span>
              </div>
            </div>
            <div class="check-row ${todayComplete ? "complete" : ""}">
              <div class="check-badge">${todayComplete ? "✓" : "2"}</div>
              <div class="check-copy">
                <strong>Re-sign today's contract</strong>
                <span>
                  ${todayEntry?.resignedAt
                    ? `Signed again on ${formatDateTime(todayEntry.resignedAt)}`
                    : "Confirm that you agree again today."}
                </span>
              </div>
            </div>

            <div class="signature-line">
              ${summary.hasEnded
                ? "This contract has already completed its 30-day window."
                : todayComplete
                  ? `Today's signature is sealed for Day ${summary.currentDay}.`
                  : `Day ${summary.currentDay} awaits your confirmation.`}
            </div>

            <div class="action-row">
              <button
                class="primary-button"
                data-action="mark-repetition"
                ${summary.hasEnded || todayEntry?.repeatedAt ? "disabled" : ""}
              >
                I read it aloud 20 times
              </button>
              <button
                class="secondary-button"
                data-action="mark-resign"
                ${summary.hasEnded || !ritualReadyForResign || todayEntry?.resignedAt ? "disabled" : ""}
              >
                Re-sign today
              </button>
            </div>

            <p class="status-copy" style="margin-top: 1rem;">
              ${summary.hasEnded
                ? "The ritual path remains visible as a record of the agreement."
                : todayComplete
                  ? "Today's ritual is complete. Return tomorrow and continue the contract."
                  : "Stay aligned. Keep your word once today and let the path fill itself in."}
            </p>
          </section>

          <section class="panel">
            <h4>Contract Reminder</h4>
            <div class="contract-block">
              ${renderContractText(state.contract.statement, state.contract.exchange)}
            </div>
            <div class="footer-note">
              <p class="small-copy">
                Signed on ${formatDate(summary.startDate)}. The 30-day agreement
                ends on ${formatDate(summary.endDate)}.
              </p>
              <button class="danger-button" data-action="reset-contract">Start Over</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  `;
}

function renderTracker(summary) {
  return Array.from({ length: TOTAL_DAYS }, (_, index) => {
    const day = index + 1;
    const dayStatus = getDayStatus(summary, day);
    const symbolMap = {
      completed: "&#9829;",
      current: "&#10022;",
      missed: "&#8729;",
      upcoming: "&#9825;",
    };
    const labelMap = {
      completed: "Sealed",
      current: "Today",
      missed: "Missed",
      upcoming: "Ahead",
    };

    return `
      <article class="day-tile ${dayStatus}">
        <div class="day-state">${symbolMap[dayStatus]}</div>
        <strong>Day ${day}</strong>
        <span>${labelMap[dayStatus]}</span>
      </article>
    `;
  }).join("");
}

function renderContractText(statement, exchange) {
  const safeStatement = escapeHtml(statement || defaultStatement);
  const safeExchange = exchange.length
    ? `
      <p><strong>What I agree to give in return:</strong></p>
      <ul>
        ${exchange.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `
    : "";

  return `
    <h3>My 30-Day Manifestation Contract</h3>
    <p>I now accept that ${safeStatement}</p>
    <p>
      For the next 30 days, I agree to align myself fully with this reality.
    </p>
    ${safeExchange}
    <p><strong>Every day, for 30 days:</strong></p>
    <ul>
      <li>I will read my manifestation statement aloud 20 times.</li>
      <li>I will remember what I am calling into my life.</li>
      <li>I will honor what I agreed to give in exchange.</li>
      <li>I will return daily and confirm my commitment.</li>
    </ul>
    <p>I do not treat this casually.</p>
    <p>I enter this agreement with faith, consistency, and intention.</p>
    <p><strong>Day 1 of 30 begins now.</strong></p>
  `;
}

function getContractSummary() {
  const startDate = state.contract.startDate;
  const currentDay = clamp(getDaysBetween(startDate, getLocalDateKey()) + 1, 1, TOTAL_DAYS);
  const lastDayDate = addDaysToDateKey(startDate, TOTAL_DAYS - 1);
  const hasEnded = getDaysBetween(startDate, getLocalDateKey()) >= TOTAL_DAYS;
  const dailyEntries = state.contract.dailyEntries || {};
  const completedDaysSet = new Set();
  let todayEntry = null;

  Object.values(dailyEntries).forEach((entry) => {
    if (entry?.dayNumber && isEntryComplete(entry)) {
      completedDaysSet.add(entry.dayNumber);
    }
  });

  todayEntry = dailyEntries[getLocalDateKey()] || null;

  const completedDays = completedDaysSet.size;
  const remainingDays = hasEnded ? 0 : Math.max(0, TOTAL_DAYS - currentDay);

  return {
    startDate,
    endDate: lastDayDate,
    currentDay,
    completedDays,
    remainingDays,
    hasEnded,
    todayEntry,
    contractState: hasEnded ? "Completed" : "Active",
    completedDaysSet,
  };
}

function getDayStatus(summary, day) {
  if (summary.completedDaysSet.has(day)) {
    return "completed";
  }

  if (!summary.hasEnded && day === summary.currentDay) {
    return "current";
  }

  if (day < summary.currentDay || (summary.hasEnded && day <= TOTAL_DAYS)) {
    return "missed";
  }

  return "upcoming";
}

function markToday(field) {
  if (!state.contract) {
    return;
  }

  const summary = getContractSummary();

  if (summary.hasEnded) {
    return;
  }

  const todayKey = getLocalDateKey();
  const existingEntry = state.contract.dailyEntries[todayKey] || {
    dayNumber: summary.currentDay,
  };

  if (field === "resignedAt" && !existingEntry.repeatedAt) {
    alert("Read your manifestation statement aloud 20 times before re-signing today.");
    return;
  }

  existingEntry[field] = new Date().toISOString();
  existingEntry.dayNumber = summary.currentDay;
  state.contract.dailyEntries[todayKey] = existingEntry;
  saveState();
  render();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return getDefaultState();
    }

    const parsed = JSON.parse(raw);

    return {
      setupStep: parsed.setupStep || "welcome",
      draft: {
        statement: parsed.draft?.statement || "",
        exchange: Array.isArray(parsed.draft?.exchange) && parsed.draft.exchange.length
          ? parsed.draft.exchange
          : ["", "", ""],
      },
      contract: parsed.contract || null,
    };
  } catch (error) {
    return getDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDefaultState() {
  return {
    setupStep: "welcome",
    draft: {
      statement: "",
      exchange: ["", "", ""],
    },
    contract: null,
  };
}

function sanitizeExchange(list) {
  return list.map((item) => item.trim()).filter(Boolean);
}

function isEntryComplete(entry) {
  return Boolean(entry?.repeatedAt && entry?.resignedAt);
}

function getLocalDateKey() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
}

function addDaysToDateKey(dateKey, daysToAdd) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + daysToAdd);
  return toDateKey(date);
}

function getDaysBetween(startKey, endKey) {
  const start = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(dateKey) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function formatDateTime(iso) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
