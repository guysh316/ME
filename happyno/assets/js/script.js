(function () {
  var $ = function (s) {
      return document.querySelector(s);
    },
    $$ = function (s) {
      return document.querySelectorAll(s);
    };

  /* header: icons collapse after a small scroll, come back only at the very top (hysteresis = no flicker).
   Header is position:fixed + spacer, so collapsing never changes page height. */
  var hd = $("#hd"),
    tabsEl = $(".tabs"),
    cmp = false,
    tick = false;
  function updTabs() {
    tick = false;
    var y = window.pageYOffset || 0;
    if (!cmp && y > 16) {
      cmp = true;
      tabsEl.classList.add("is-compact");
    } else if (cmp && y <= 2) {
      cmp = false;
      tabsEl.classList.remove("is-compact");
    }
    hd.classList.toggle("stuck", y > 2);
  }
  addEventListener(
    "scroll",
    function () {
      if (!tick) {
        tick = true;
        requestAnimationFrame(updTabs);
      }
    },
    { passive: true }
  );
  updTabs();
  /* spacer = real expanded header height (measured, so fonts/zoom never leave a gap or overlap) */
  function setH() {
    if (innerWidth >= 768) return;
    var was = tabsEl.classList.contains("is-compact");
    hd.classList.add("no-tr");
    tabsEl.classList.remove("is-compact");
    var H =
      hd.offsetHeight; /* always the EXPANDED height, never a mid-animation value */
    if (was) tabsEl.classList.add("is-compact");
    void hd.offsetHeight;
    hd.classList.remove("no-tr");
    document.documentElement.style.setProperty("--hd-h", H + "px");
  }
  var lw = innerWidth;
  setH();
  addEventListener("resize", function () {
    if (innerWidth !== lw) {
      lw = innerWidth;
      setH();
    }
  }); /* height-only resizes (mobile URL bar) are ignored */
  addEventListener("load", setH);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setH);
  /* ===== hero slider: native scroll-snap + 3 sets (clones) for a seamless loop ===== */
  (function () {
    var root = $("#hero");
    if (!root) return;
    var track = root.querySelector(".hero-track"),
      orig = [].slice.call(track.children),
      n = orig.length;
    var DELAY = 5000,
      reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    root.style.setProperty("--delay", DELAY + "ms");
    var fa = function (x) {
      return Number(x).toLocaleString("fa-IR");
    };
    orig.forEach(function (s, i) {
      s.setAttribute("role", "group");
      s.setAttribute("aria-roledescription", "slide");
      s.setAttribute("aria-label", fa(i + 1) + " از " + fa(n));
    });
    if (n < 2) {
      root.classList.add("single");
      return;
    }
    if (reduce) root.classList.add("no-auto");

    function mk() {
      return orig.map(function (s) {
        var c = s.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.removeAttribute("role");
        c.removeAttribute("aria-label");
        c.tabIndex = -1;
        return c;
      });
    }
    mk().forEach(function (c) {
      track.insertBefore(c, orig[0]);
    });
    mk().forEach(function (c) {
      track.appendChild(c);
    });
    var all = [].slice.call(track.children);

    var dotsEl = root.querySelector(".dots"),
      dots = [];
    orig.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dot";
      b.setAttribute("aria-label", "رفتن به اسلاید " + fa(i + 1));
      b.innerHTML = "<i></i>";
      b.addEventListener("click", function () {
        goTo(near(i), true);
        schedule();
      });
      dotsEl.appendChild(b);
      dots.push(b);
    });

    var snapT = 0;
    function cx(el) {
      var r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    }
    function mid() {
      var r = track.getBoundingClientRect();
      return r.left + r.width / 2;
    }
    function nearest() {
      var m = mid(),
        b = 0,
        d = 1e9;
      for (var i = 0; i < all.length; i++) {
        var x = Math.abs(cx(all[i]) - m);
        if (x < d) {
          d = x;
          b = i;
        }
      }
      return b;
    }
    function goTo(i, smooth) {
      var d = cx(all[i]) - mid();
      if (smooth && !reduce) {
        if (Math.abs(i - nearest()) > 1) {
          /* multi-slide jump (dots): snap-stop would halt after one slide, so free the snap until we arrive */
          track.style.scrollSnapType = "none";
          clearTimeout(snapT);
          snapT = setTimeout(function () {
            track.style.scrollSnapType = "";
          }, 900);
        }
        track.scrollBy({ left: d, behavior: "smooth" });
      } else track.scrollLeft += d;
    }
    function near(k) {
      /* the copy of real slide k that is closest to where we are */
      var c = cur < 0 ? n : cur,
        best = k + n,
        bd = 1e9;
      [k, k + n, k + 2 * n].forEach(function (i) {
        var d = Math.abs(i - c);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    }

    var cur = -1,
      timer = 0,
      settleT = 0,
      raf = 0,
      h = {},
      dragging = false;
    function isHeld() {
      return h.hover || h.focus || h.touch || h.hidden || h.off || dragging;
    }
    function setActive(i) {
      var k = ((i % n) + n) % n;
      dots.forEach(function (d, j) {
        d.classList.toggle("on", j === k);
        j === k
          ? d.setAttribute("aria-current", "true")
          : d.removeAttribute("aria-current");
      });
    }
    function restartBar() {
      var d = dots[((cur % n) + n) % n];
      if (!d) return;
      d.classList.remove("on");
      void d.offsetWidth;
      d.classList.add("on");
    }
    function schedule() {
      clearTimeout(timer);
      if (cur >= 0) restartBar();
      if (reduce || isHeld()) return;
      timer = setTimeout(function () {
        goTo(nearest() + 1, true);
      }, DELAY);
    }
    function hold(k, v) {
      h[k] = v;
      root.classList.toggle("is-held", !!isHeld());
      if (isHeld()) clearTimeout(timer);
      else schedule();
    }

    function jump(i) {
      /* silent teleport between identical sets */
      track.style.scrollSnapType = "none";
      goTo(i, false);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          track.style.scrollSnapType = "";
        });
      });
    }
    function settle() {
      if (h.touch || dragging) return;
      var i = nearest();
      if (i < n || i >= 2 * n) {
        jump(i < n ? i + n : i - n);
      }
      cur = nearest();
      setActive(cur);
      schedule();
    }
    track.addEventListener(
      "scroll",
      function () {
        if (!raf)
          raf = requestAnimationFrame(function () {
            raf = 0;
            var i = nearest();
            if (i !== cur) {
              cur = i;
              setActive(i);
            }
          });
        clearTimeout(settleT);
        settleT = setTimeout(settle, 140);
      },
      { passive: true }
    );

    /* buttons + keyboard (RTL: left = next) */
    function step(d) {
      goTo(nearest() + d, true);
      schedule();
    }
    var bp = root.querySelector(".hero-btn.prev"),
      bn = root.querySelector(".hero-btn.next");
    bp.addEventListener("click", function () {
      step(-1);
    });
    bn.addEventListener("click", function () {
      step(1);
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(-1);
      }
    });

    /* pause rules */
    root.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") hold("hover", true);
    });
    root.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") hold("hover", false);
    });
    root.addEventListener("focusin", function (e) {
      var v = true;
      try {
        v = e.target.matches(":focus-visible");
      } catch (_) {}
      hold("focus", v);
    });
    root.addEventListener("focusout", function () {
      hold("focus", false);
    });
    track.addEventListener(
      "touchstart",
      function () {
        hold("touch", true);
      },
      { passive: true }
    );
    function tEnd() {
      h.touch = false;
      root.classList.toggle("is-held", !!isHeld());
      clearTimeout(settleT);
      settleT = setTimeout(settle, 160);
    }
    track.addEventListener("touchend", tEnd, { passive: true });
    track.addEventListener("touchcancel", tEnd, { passive: true });
    document.addEventListener("visibilitychange", function () {
      hold("hidden", document.hidden);
    });
    if ("IntersectionObserver" in window)
      new IntersectionObserver(
        function (e) {
          hold("off", !e[0].isIntersecting);
        },
        { threshold: 0.2 }
      ).observe(root);

    /* mouse drag (desktop) */
    var sx = 0,
      ss = 0,
      si = 0,
      dx = 0,
      moved = false,
      suppress = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = false;
      dx = 0;
      sx = e.clientX;
      ss = track.scrollLeft;
      si = nearest();
      clearTimeout(timer);
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        track.classList.add("drag");
      }
      if (moved) track.scrollLeft = ss - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        var i = nearest();
        if (i === si && Math.abs(dx) > 50) i += dx > 0 ? 1 : -1;
        goTo(i, true);
        suppress = true;
        setTimeout(function () {
          suppress = false;
        }, 0);
        setTimeout(function () {
          track.classList.remove("drag");
        }, 500);
      } else schedule();
    });
    track.addEventListener(
      "click",
      function (e) {
        if (suppress) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
    track.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    /* start on the first real slide; keep it centred on resize */
    function init() {
      cur = n;
      jump(n);
      setActive(n);
      schedule();
    }
    requestAnimationFrame(init);
    var rt = 0;
    addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        jump(nearest());
      }, 120);
    });
  })();

  /* cart badge: call window.setCartCount(n) from your store code */
  window.setCartCount = function (n) {
    $$(".js-cart").forEach(function (b) {
      b.dataset.n = n;
      b.textContent = n ? Number(n).toLocaleString("fa-IR") : "";
      b.classList.add("bump");
      setTimeout(function () {
        b.classList.remove("bump");
      }, 260);
    });
  };
  /* city modal (30 cities: search + popular chips + list) */
  var CITIES = [
    "تهران",
    "کرج",
    "مشهد",
    "اصفهان",
    "شیراز",
    "تبریز",
    "قم",
    "اهواز",
    "کرمانشاه",
    "ارومیه",
    "رشت",
    "زاهدان",
    "کرمان",
    "همدان",
    "یزد",
    "اردبیل",
    "بندرعباس",
    "اراک",
    "زنجان",
    "سنندج",
    "قزوین",
    "خرم‌آباد",
    "گرگان",
    "ساری",
    "بوشهر",
    "بجنورد",
    "بیرجند",
    "ایلام",
    "شهرکرد",
    "یاسوج",
  ];
  var POP = ["تهران", "کرج", "اصفهان", "شیراز", "مشهد", "تبریز"];
  var modal = $("#amodal"),
    panel = modal.querySelector(".am-panel"),
    q = $("#amQ"),
    list = $("#amList"),
    pops = $("#amPop"),
    empty = $("#amEmpty"),
    opener = null,
    city = "";
  var sorted = CITIES.slice().sort(function (a, b) {
    return a.localeCompare(b, "fa");
  });
  function norm(t) {
    return t
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[\u200c\s]/g, "");
  }
  POP.forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "am-chip";
    b.setAttribute("role", "radio");
    b.dataset.c = c;
    b.textContent = c;
    pops.appendChild(b);
  });
  function render() {
    var k = norm(q.value),
      n = 0;
    list.innerHTML = "";
    sorted.forEach(function (c) {
      if (k && norm(c).indexOf(k) < 0) return;
      n++;
      var li = document.createElement("li"),
        b = document.createElement("button");
      b.type = "button";
      b.className = "am-city";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", c === city);
      b.dataset.c = c;
      b.innerHTML =
        '<span></span><svg class="ic ck" aria-hidden="true"><use href="#i-check"/></svg>';
      b.firstChild.textContent = c;
      li.appendChild(b);
      list.appendChild(li);
    });
    empty.hidden = n > 0;
    list.hidden = n === 0;
    pops.hidden = !!k;
  }
  function setCity(c) {
    city = c;
    $$(".js-city").forEach(function (x) {
      x.textContent = c ? "ارسال به " + c : "انتخاب آدرس";
    });
    pops.querySelectorAll(".am-chip").forEach(function (b) {
      b.setAttribute("aria-checked", b.dataset.c === c);
    });
    render();
  }
  function openModal(btn) {
    opener = btn;
    btn.setAttribute("aria-expanded", "true");
    q.value = "";
    render();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("amodal-open");
    panel.focus({ preventScroll: true });
    var sel = list.querySelector("[aria-checked=true]");
    if (sel) {
      var a = sel.getBoundingClientRect(),
        l = list.getBoundingClientRect();
      list.scrollTop += a.top - l.top - l.height / 2 + a.height / 2;
    }
  }
  function closePop() {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("amodal-open");
    if (opener) {
      opener.setAttribute("aria-expanded", "false");
      opener.focus({ preventScroll: true });
    }
  }
  $$(".js-addr").forEach(function (b) {
    b.setAttribute("aria-haspopup", "dialog");
    b.addEventListener("click", function () {
      openModal(b);
    });
  });
  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) {
      closePop();
      return;
    }
    var b = e.target.closest("[data-c]");
    if (!b) return;
    setCity(b.dataset.c);
    try {
      localStorage.setItem("maya_city", b.dataset.c);
    } catch (_) {}
    closePop();
  });
  q.addEventListener("input", render);
  modal.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = [].filter.call(
      panel.querySelectorAll("button,input"),
      function (x) {
        return x.offsetParent !== null;
      }
    );
    if (!f.length) return;
    var first = f[0],
      last = f[f.length - 1];
    if (
      e.shiftKey &&
      (document.activeElement === first || document.activeElement === panel)
    ) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  try {
    setCity(localStorage.getItem("maya_city") || "");
  } catch (_) {
    setCity("");
  }

  /* one address button: lives under the bar on mobile, moves into the header row on tablet/desktop */
  var ab = $(".js-addr"),
    slotM = $(".addr-row"),
    slotD = $(".row"),
    mqD = matchMedia("(min-width:768px)");
  function place() {
    (mqD.matches ? slotD : slotM).appendChild(ab);
  }
  place();
  mqD.addEventListener
    ? mqD.addEventListener("change", place)
    : mqD.addListener(place);

  /* bottom nav: highlight the current page (falls back to the hard-coded item) */
  (function () {
    var ls = $$(".bnav a"),
      p = location.pathname.replace(/\/$/, "") || "/",
      hit = null;
    [].forEach.call(ls, function (a) {
      var u = a.getAttribute("href");
      if (u && u !== "/" && p.indexOf(u) === 0) hit = a;
      else if (u === "/" && p === "/" && !hit) hit = a;
    });
    if (!hit) return;
    [].forEach.call(ls, function (a) {
      a.classList.remove("on");
      a.removeAttribute("aria-current");
    });
    hit.classList.add("on");
    hit.setAttribute("aria-current", "page");
  })();

  /* ===== featured products slider: scroll-snap + arrows (768px+) + mouse drag + progress rail ===== */
  [].forEach.call($$(".feat"), function (sec) {
    var tr = sec.querySelector(".feat-track");
    if (!tr) return;
    var bs = sec.querySelectorAll(".feat-btn"),
      bp = bs[0],
      bn = bs[1],
      th = sec.querySelector(".feat-bar i"),
      bar = th.parentNode,
      raf = 0;
    window.mayaAdd =
      window.mayaAdd ||
      function () {
        window.__cartN = (window.__cartN || 0) + 1;
        window.setCartCount(window.__cartN);
      };
    function upd() {
      raf = 0;
      var x = Math.abs(tr.scrollLeft),
        m = tr.scrollWidth - tr.clientWidth,
        w = (tr.clientWidth / tr.scrollWidth) * 100;
      bp.disabled = x <= 2;
      bn.disabled = x >= m - 2;
      bar.style.visibility = m > 2 ? "visible" : "hidden";
      th.style.width = w + "%";
      th.style.insetInlineStart = (m > 0 ? (x / m) * (100 - w) : 0) + "%";
    }
    function page(d) {
      /* d = 1 next, -1 prev (RTL: next = negative scroll) */
      var cs = getComputedStyle(tr),
        c = tr.children[1] || tr.firstElementChild,
        w = c.offsetWidth + (parseFloat(cs.columnGap) || 0),
        cw =
          tr.clientWidth -
          parseFloat(cs.paddingLeft) -
          parseFloat(cs.paddingRight),
        k = Math.max(1, Math.floor(cw / w + 0.2));
      tr.scrollBy({ left: -d * k * w, behavior: "smooth" });
    }
    bp.addEventListener("click", function () {
      page(-1);
    });
    bn.addEventListener("click", function () {
      page(1);
    });
    tr.addEventListener(
      "scroll",
      function () {
        if (!raf) raf = requestAnimationFrame(upd);
      },
      { passive: true }
    );
    addEventListener("resize", upd);
    addEventListener("load", upd);
    upd();

    /* keyboard: arrows move one page (RTL: left = next) */
    tr.addEventListener("keydown", function (e) {
      if (e.target !== tr) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        page(1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        page(-1);
      }
    });

    /* mouse drag (desktop) */
    var dr = false,
      mv = false,
      sx = 0,
      ss = 0,
      sup = false;
    tr.addEventListener("pointerdown", function (e) {
      if (
        e.pointerType !== "mouse" ||
        e.button !== 0 ||
        e.target.closest("button")
      )
        return;
      dr = true;
      mv = false;
      sx = e.clientX;
      ss = tr.scrollLeft;
    });
    addEventListener("pointermove", function (e) {
      if (!dr) return;
      var d = e.clientX - sx;
      if (!mv && Math.abs(d) > 4) {
        mv = true;
        tr.classList.add("drag");
      }
      if (mv) tr.scrollLeft = ss - d;
    });
    addEventListener("pointerup", function () {
      if (!dr) return;
      dr = false;
      if (mv) {
        sup = true;
        setTimeout(function () {
          sup = false;
        }, 0);
        setTimeout(function () {
          tr.classList.remove("drag");
        }, 60);
      }
    });
    tr.addEventListener(
      "click",
      function (e) {
        if (sup) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
    tr.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    /* heart + add-to-cart */
    tr.addEventListener("click", function (e) {
      var hb = e.target.closest(".pc-h"),
        ad = e.target.closest(".pc-add");
      if (hb) {
        var on = hb.classList.toggle("on");
        hb.setAttribute("aria-pressed", on);
      } /* TODO: save to wishlist */
      if (ad) {
        window.mayaAdd(); /* TODO: real add-to-cart */
        ad.classList.add("ok");
        setTimeout(function () {
          ad.classList.remove("ok");
        }, 1400);
      }
    });

    /* missing product photo: hide the broken icon, the tone tile stays */
    tr.addEventListener(
      "error",
      function (e) {
        if (e.target.tagName === "IMG") e.target.style.display = "none";
      },
      true
    );
  });

  /* ===== new arrivals grid: heart + add to cart (same behaviour as the featured slider) ===== */
  (function () {
    var g = $(".new-grid");
    if (!g) return;
    g.addEventListener("click", function (e) {
      var hb = e.target.closest(".pc-h"),
        ad = e.target.closest(".pc-add");
      if (hb) {
        var on = hb.classList.toggle("on");
        hb.setAttribute("aria-pressed", on);
      } /* TODO: save to wishlist */
      if (ad) {
        window.mayaAdd(); /* TODO: real add-to-cart */
        ad.classList.add("ok");
        setTimeout(function () {
          ad.classList.remove("ok");
        }, 1400);
      }
    });
    /* missing product photo: hide the broken icon, the tone tile stays */
    g.addEventListener(
      "error",
      function (e) {
        if (e.target.tagName === "IMG") e.target.style.display = "none";
      },
      true
    );
  })();

  /* bottom sheet */
  var body = document.body,
    catsBtn = $("#catsBtn");
  function sheet(o) {
    body.classList.toggle("sheet-open", o);
    if (!o) catsBtn.focus({ preventScroll: true });
  }
  catsBtn.addEventListener("click", function () {
    sheet(true);
  });
  $("#scrim").addEventListener("click", function () {
    sheet(false);
  });

  /* mega menu (desktop) */
  var mb = $("#megaBtn"),
    mega = $("#mega"),
    nav = $("#bar"),
    t;
  var desk = matchMedia("(min-width:1024px)");
  function megaOpen(o) {
    clearTimeout(t);
    mega.classList.toggle("open", o);
    mb.setAttribute("aria-expanded", o);
  }
  mb.addEventListener("mouseenter", function () {
    if (desk.matches) megaOpen(true);
  });
  mb.addEventListener("click", function (e) {
    if (desk.matches) {
      e.preventDefault();
      megaOpen(!mega.classList.contains("open"));
    }
  });
  nav.addEventListener("mouseleave", function () {
    t = setTimeout(function () {
      megaOpen(false);
    }, 180);
  });
  mega.addEventListener("mouseenter", function () {
    clearTimeout(t);
  });
  desk.addEventListener &&
    desk.addEventListener("change", function () {
      megaOpen(false);
    });
  document.addEventListener("pointerdown", function (e) {
    if (
      mega.classList.contains("open") &&
      !mega.contains(e.target) &&
      !mb.contains(e.target)
    )
      megaOpen(false);
  });
  var rowEl = $(".row");
  rowEl.addEventListener("mouseenter", function () {
    megaOpen(false);
  });
  rowEl.addEventListener("focusin", function () {
    megaOpen(false);
  });
  addEventListener(
    "scroll",
    function () {
      if (mega.classList.contains("open")) megaOpen(false);
    },
    { passive: true }
  );

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      megaOpen(false);
      closePop();
      if (body.classList.contains("sheet-open")) sheet(false);
    }
  });
})();
