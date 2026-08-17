/* ========================================
   ELEMENTS
======================================== */
const header = document.getElementById("siteHeader");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileDrawer = document.getElementById("mobileDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const drawerClose = document.getElementById("drawerClose");
const allNavLinks = document.querySelectorAll("[data-section]");

/* ========================================
   SCROLL → header state
======================================== */
function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 10);
  highlightActiveSection();
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll(); // run once on load

/* ========================================
   ACTIVE SECTION HIGHLIGHT
======================================== */
function highlightActiveSection() {
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length) return;

  let current = "";
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 120) {
      current = section.getAttribute("id");
    }
  });

  allNavLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === current);
  });
}

/* ========================================
   DRAWER — OPEN / CLOSE
======================================== */
function openDrawer() {
  mobileDrawer.classList.add("is-open");
  drawerOverlay.classList.add("is-visible");
  hamburgerBtn.classList.add("is-open");
  hamburgerBtn.setAttribute("aria-expanded", "true");
  hamburgerBtn.setAttribute("aria-label", "بستن منو");
  mobileDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  mobileDrawer.classList.remove("is-open");
  drawerOverlay.classList.remove("is-visible");
  hamburgerBtn.classList.remove("is-open");
  hamburgerBtn.setAttribute("aria-expanded", "false");
  hamburgerBtn.setAttribute("aria-label", "باز کردن منو");
  mobileDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

hamburgerBtn.addEventListener("click", () => {
  mobileDrawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
});

drawerOverlay.addEventListener("click", closeDrawer);

drawerClose.addEventListener("click", closeDrawer);

mobileDrawer
  .querySelectorAll(".drawer__link, .drawer__cta, #drawerCTA")
  .forEach((el) => {
    el.addEventListener("click", closeDrawer);
  });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileDrawer.classList.contains("is-open")) {
    closeDrawer();
    hamburgerBtn.focus();
  }
});

/* ========================================
   TOUCH SWIPE TO CLOSE (swipe right = close)
======================================== */
let touchStartX = 0;

mobileDrawer.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
  },
  { passive: true }
);

mobileDrawer.addEventListener(
  "touchend",
  (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX > 60) closeDrawer();
  },
  { passive: true }
);

/* ========================================
   HERO TERMINAL EMULATOR
======================================== */

(function () {
  const termInput = document.getElementById("terminalInput");
  const termHistory = document.getElementById("terminalHistory");
  const termBody = document.getElementById("terminalBody");
  const inputMirror = document.getElementById("inputMirror");
  const termCursor = document.getElementById("termCursor");

  if (!termInput) return;

  termBody.addEventListener("click", () => termInput.focus());

  termInput.addEventListener("input", () => {
    inputMirror.textContent = termInput.value;
  });

  const commands = {
    help: () => `
<p class="t-line"><span class="t-comment">دستورهای موجود:</span></p>
<p class="t-line t-indent"><span class="t-val">skills</span>    <span class="t-comment">— مهارت‌ها و تکنولوژی‌ها</span></p>
<p class="t-line t-indent"><span class="t-val">projects</span>  <span class="t-comment">— نمونه کارها</span></p>
<p class="t-line t-indent"><span class="t-val">contact</span>   <span class="t-comment">— اطلاعات تماس</span></p>
<p class="t-line t-indent"><span class="t-val">about</span>     <span class="t-comment">— بیوگرافی کوتاه</span></p>
<p class="t-line t-indent"><span class="t-val">stack</span>     <span class="t-comment">— ابزارهای توسعه</span></p>
<p class="t-line t-indent"><span class="t-val">clear</span>     <span class="t-comment">— پاک کردن ترمینال</span></p>`,

    skills: () => `
<p class="t-line"><span class="t-key">const</span> <span class="t-var">skills</span> <span class="t-op">=</span> {</p>
<p class="t-line t-indent"><span class="t-str">frontend</span>: [<span class="t-val">"HTML5"</span>, <span class="t-val">"CSS3"</span>, <span class="t-val">"JavaScript"</span>],</p>
<p class="t-line t-indent"><span class="t-str">mobile</span>:   [<span class="t-val">"Flutter"</span>],</p>
<p class="t-line t-indent"><span class="t-str">backend</span>:  [<span class="t-val">"Node.js"</span>],</p>
<p class="t-line t-indent"><span class="t-str">cms</span>:      [<span class="t-val">"WordPress"</span>, <span class="t-val">"WooCommerce"</span>],</p>
<p class="t-line t-indent"><span class="t-str">seo</span>:      <span class="t-bool">true</span></p>
<p class="t-line">};</p>`,

    projects: () => `
<p class="t-line"><span class="t-comment">// نمونه کارها:</span></p>
<p class="t-line t-indent"><span class="t-num">01</span> <span class="t-val">Rasta Tarabar</span>  <span class="t-comment">— حمل و نقل بین‌المللی</span></p>
<p class="t-line t-indent"><span class="t-num">02</span> <span class="t-val">Parsayan</span>       <span class="t-comment">— حمل و نقل بین‌المللی</span></p>
<p class="t-line t-indent"><span class="t-num">03</span> <span class="t-val">Arsalin</span>        <span class="t-comment">— حمل و نقل ایران-روسیه</span></p>
<p class="t-line t-indent"><span class="t-num">04</span> <span class="t-val">Hormuz Javidan</span> <span class="t-comment">— حمل و نقل بین‌المللی</span></p>
<p class="t-line t-indent"><span class="t-num">05</span> <span class="t-val">Deniz Shop</span>     <span class="t-comment">— فروشگاه آنلاین</span></p>
<p class="t-line t-indent"><span class="t-num">06</span> <span class="t-val">Deniz Home</span>     <span class="t-comment">— فروشگاه دکور</span></p>
<p class="t-line"><span class="t-output">▶ برای مشاهده: <a href="#projects" style="color:#60a5fa;">نمونه کارها</a></span></p>`,

    contact: () => `
<p class="t-line"><span class="t-key">const</span> <span class="t-var">contact</span> <span class="t-op">=</span> {</p>
<p class="t-line t-indent"><span class="t-str">email</span>:    <span class="t-val">"mohammadhossienamirabedin@gmail.com"</span>,</p>
<p class="t-line t-indent"><span class="t-str">telegram</span>: <span class="t-val">"@firstnapoleon"</span>,</p>
<p class="t-line t-indent"><span class="t-str">instagram</span>:<span class="t-val">"@MH.AMIRABEDIN"</span></p>
<p class="t-line">};</p>`,

    about: () => `
<p class="t-line"><span class="t-comment">/*</span></p>
<p class="t-line"><span class="t-comment"> * محمد حسین امیرعابدین</span></p>
<p class="t-line"><span class="t-comment"> * توسعه‌دهنده فرانت‌اند و وردپرس</span></p>
<p class="t-line"><span class="t-comment"> *</span></p>
<p class="t-line"><span class="t-comment"> * بیش از ۴ سال تجربه در ساخت سایت‌ها</span></p>
<p class="t-line"><span class="t-comment"> * و اپلیکیشن‌هایی که واقعاً کار می‌کنند.</span></p>
<p class="t-line"><span class="t-comment"> */</span></p>`,

    stack: () => `
<p class="t-line"><span class="t-comment">// ابزارهای روزانه:</span></p>
<p class="t-line t-indent"><span class="t-val">Editor</span>    → VS Code</p>
<p class="t-line t-indent"><span class="t-val">Browser</span>   → Chrome DevTools</p>
<p class="t-line t-indent"><span class="t-val">Design</span>    → Figma</p>
<p class="t-line t-indent"><span class="t-val">Version</span>   → Git + GitHub</p>
<p class="t-line t-indent"><span class="t-val">Terminal</span>  → (همین جا هستی 😄)</p>`,

    clear: () => "CLEAR",
  };

  const cmdHistory = [];
  let historyIndex = -1;

  function printOutput(html) {
    const div = document.createElement("div");
    div.className = "t-history-output";
    div.innerHTML = html;
    termHistory.appendChild(div);
    scrollBottom();
  }

  function printCommand(cmd) {
    const div = document.createElement("div");
    div.className = "t-history-cmd";
    div.innerHTML = `
      <span class="t-prompt">
        <span class="t-prompt-user">mh</span><span class="t-prompt-at">@</span><span class="t-prompt-host">portfolio</span><span class="t-prompt-sep">:</span><span class="t-prompt-dir">~</span><span class="t-prompt-sign">$</span>
      </span>
      <span style="color:#e6edf3">${escapeHtml(cmd)}</span>`;
    termHistory.appendChild(div);
  }

  function scrollBottom() {
    termBody.scrollTop = termBody.scrollHeight;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function handleCommand(raw) {
    const cmd = raw.trim().toLowerCase();

    if (!cmd) return;

    cmdHistory.unshift(cmd);
    if (cmdHistory.length > 30) cmdHistory.pop();
    historyIndex = -1;

    printCommand(raw.trim());

    if (cmd === "clear") {
      termHistory.innerHTML = "";
      document.getElementById("terminalBoot").style.display = "none";
      scrollBottom();
      return;
    }

    if (commands[cmd]) {
      const result = commands[cmd]();
      printOutput(result);
    } else {
      printOutput(
        `<p class="t-line"><span class="t-error">bash: ${escapeHtml(
          cmd
        )}: command not found</span></p><p class="t-line"><span class="t-comment">راهنما: <span style="color:#e6edf3">help</span></span></p>`
      );
    }
  }

  termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = termInput.value;
      termInput.value = "";
      inputMirror.textContent = "";
      handleCommand(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        termInput.value = cmdHistory[historyIndex];
        inputMirror.textContent = termInput.value;
        // move caret to end
        setTimeout(
          () =>
            termInput.setSelectionRange(
              termInput.value.length,
              termInput.value.length
            ),
          0
        );
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        termInput.value = cmdHistory[historyIndex];
      } else {
        historyIndex = -1;
        termInput.value = "";
      }
      inputMirror.textContent = termInput.value;
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Simple autocomplete
      const partial = termInput.value.trim().toLowerCase();
      if (!partial) return;
      const match = Object.keys(commands).find((k) => k.startsWith(partial));
      if (match) {
        termInput.value = match;
        inputMirror.textContent = match;
      }
    }
  });

  if (window.innerWidth > 640) {
    setTimeout(() => termInput.focus(), 900);
  }
})();
