(function () {
    "use strict";

    var SHARE_URL = "https://oinp.hubeiqiao.com/";
    var SHARE_TITLE = "Canada helped Joe become a builder. Can Canada keep builders here?";
    var SHARE_TEXT =
        "Canada helped Joe become a builder.\n\n" +
        "He studied, built, registered a company, and found his community here.\n\n" +
        "Then the pathway changed. Can Canada recognize builders before it loses them?";
    var NATIVE_TEXT =
        "Canada helped Joe become a builder. He studied, built, registered a company, and found his community here. Then the pathway changed. Can Canada recognize builders before it loses them?";
    var EMAIL_SUBJECT = "Canada helped Joe become a builder. Can Canada keep builders here?";
    var EMAIL_BODY =
        "Hi,\n\n" +
        "Sharing Joe Hu\u2019s story from Ottawa. Canada helped him become a builder: he studied here, built products here, registered a company here, and found his community here. Then the pathway changed.\n\n" +
        "He is asking a broader question: can Canada recognize early-stage builders by what they are already building, not only by one permanent employer relationship?\n\n" +
        "This is not a petition. It is a public-awareness page for people in Canada\u2019s tech, startup, university, media, and policy communities who care about fair pathways for builders already contributing here.\n\n" +
        "Take a look:";

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ---------- shared smooth glide (one tween at a time) ---------- */
    var glideRAF = null;
    function animScrollTo(to, dur, onDone) {
        if (glideRAF) { cancelAnimationFrame(glideRAF); glideRAF = null; }
        var from = window.pageYOffset, dist = Math.round(to) - from;
        if (reducedMotion.matches || Math.abs(dist) < 4) { window.scrollTo(0, Math.round(to)); if (onDone) onDone(); return; }
        var d = dur || Math.min(900, Math.max(440, Math.abs(dist) * 0.5)), t0 = null;
        function ease(p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); }
        function step(ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min((ts - t0) / d, 1);
            window.scrollTo(0, Math.round(from + dist * ease(p)));
            if (p < 1) { glideRAF = requestAnimationFrame(step); } else { glideRAF = null; if (onDone) onDone(); }
        }
        glideRAF = requestAnimationFrame(step);
    }
    function videoFullY() {
        var stage = document.querySelector(".film-stage");
        if (!stage) return window.pageYOffset;
        return Math.max(0, Math.round(window.pageYOffset + stage.getBoundingClientRect().top));
    }

    /* ---------- smooth scroll ---------- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            if (a.classList.contains("btn-watch")) return; /* the Watch CTA runs the play "special move" */
            a.addEventListener("click", function (e) {
                var href = a.getAttribute("href");
                if (!href || href === "#") return;
                var target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
                if (href !== "#top") history.pushState(null, "", href);
            });
        });
    }

    /* ---------- hero hook video ---------- */
    function initHeroVideo() {
        var root = document.documentElement;
        var video = document.querySelector(".hero-video");
        if (!video) return;
        video.controls = false; video.removeAttribute("controls");
        video.muted = true; video.defaultMuted = true; video.loop = true;
        video.playsInline = true; video.setAttribute("playsinline", ""); video.setAttribute("webkit-playsinline", "");
        video.disablePictureInPicture = true; video.setAttribute("tabindex", "-1");
        video.addEventListener("contextmenu", function (e) { e.preventDefault(); });

        function fallback() { root.classList.add("video-fallback"); try { video.pause(); } catch (e) {} }
        function clear() { root.classList.remove("video-fallback"); }
        if (reducedMotion.matches) { fallback(); return; }
        video.addEventListener("error", fallback);
        var src = video.querySelector("source"); if (src) src.addEventListener("error", fallback);
        video.addEventListener("playing", clear);
        function play() { var p = video.play(); if (p && p.then) p.then(clear).catch(fallback); }
        if (video.readyState >= 2) play();
        else { video.addEventListener("loadeddata", play, { once: true }); setTimeout(play, 1200); }
        if (typeof reducedMotion.addEventListener === "function") {
            reducedMotion.addEventListener("change", function (e) { if (e.matches) fallback(); else play(); });
        }
    }

    /* ---------- scroll reveals (self-removing, rAF) ---------- */
    function initReveals() {
        var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
        if (!items.length) return;
        if (reducedMotion.matches) { items.forEach(function (el) { el.classList.add("in"); }); return; }
        items.forEach(function (el) {
            var sibs = Array.prototype.slice.call(el.parentElement.querySelectorAll(":scope > .reveal"));
            var i = sibs.indexOf(el);
            if (i > 0) el.style.setProperty("--reveal-delay", (i * 90) + "ms");
        });
        var pending = items.slice(), ticking = false;
        function check() {
            ticking = false;
            var vh = window.innerHeight || document.documentElement.clientHeight;
            pending = pending.filter(function (el) {
                if (el.getBoundingClientRect().top < vh * 0.9) { el.classList.add("in"); return false; }
                return true;
            });
            if (!pending.length) { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); }
        }
        function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        check();
    }

    function initAskDetails() {
        var items = Array.prototype.slice.call(document.querySelectorAll(".ask-detail"));
        if (!items.length) return;
        var mobile = window.matchMedia("(max-width: 760px)");
        var syncing = false;

        function sync() {
            syncing = true;
            items.forEach(function (detail) {
                if (mobile.matches) {
                    if (!detail.dataset.userToggled) detail.open = false;
                } else {
                    detail.open = true;
                    delete detail.dataset.userToggled;
                }
            });
            syncing = false;
        }

        items.forEach(function (detail) {
            detail.addEventListener("toggle", function () {
                if (!syncing && mobile.matches) detail.dataset.userToggled = "true";
            });
        });

        sync();
        if (typeof mobile.addEventListener === "function") mobile.addEventListener("change", sync);
        else if (typeof mobile.addListener === "function") mobile.addListener(sync);
    }

    /* ---------- FILM: muted preview from Joe's intro -> click plays with sound ---------- */
    function initFilm() {
        var stage = document.querySelector("[data-film]");
        if (!stage) return;
        var video = stage.querySelector("video");
        var playBtn = stage.querySelector("[data-film-play]");
        var fullscreenBtn = document.querySelector("[data-film-fullscreen]");
        if (!video) return;
        var engaged = false;
        video.muted = true; video.playsInline = true; video.setAttribute("playsinline", "");

        // The story file already starts at Joe's introduction (the hook lives in the hero),
        // so the muted preview simply plays/loops from 0, and a click plays it with sound.
        function ambientPlay() {
            if (engaged || reducedMotion.matches) return;
            video.muted = true; video.loop = true;
            var p = video.play(); if (p && p.catch) p.catch(function () {});
        }
        function engage(options) {
            var reset = !options || options.reset !== false;
            engaged = true;
            window.__videoEngaged = true;
            stage.classList.add("playing");
            video.loop = false;
            video.muted = false;
            video.controls = true;
            if (reset) {
                try { video.currentTime = 0; } catch (e) {}
            }
            var p = video.play(); if (p && p.catch) p.catch(function () {});
        }
        function lockLandscape() {
            if (!screen.orientation || !screen.orientation.lock) return;
            var p = screen.orientation.lock("landscape");
            if (p && p.catch) p.catch(function () {});
        }
        function openFullscreen(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!engaged) engage();
            else engage({ reset: false });

            if (typeof video.webkitEnterFullscreen === "function") {
                try { video.webkitEnterFullscreen(); } catch (err) {}
                return;
            }

            var target = video;
            var request = target.requestFullscreen || target.webkitRequestFullscreen || stage.requestFullscreen || stage.webkitRequestFullscreen;
            if (!request) return;
            var p = request.call(target.requestFullscreen || target.webkitRequestFullscreen ? target : stage);
            if (p && p.then) p.then(lockLandscape).catch(function () {});
            else lockLandscape();
        }
        // "special move": glide to the video, play on arrival, then nudge it flush to the top
        // (a few passes catch any late layout settle so there's no gap/black edge)
        function alignVideoTop() {
            var s = document.querySelector(".film-stage");
            if (!s) return;
            var t = Math.round(s.getBoundingClientRect().top);
            if (t !== 0) window.scrollBy(0, t);
        }
        function navigateAndEngage(e) {
            if (e) e.preventDefault();
            animScrollTo(videoFullY(), null, function () {
                engage();
                [50, 260, 620].forEach(function (d) { setTimeout(alignVideoTop, d); });
            });
        }
        if (playBtn) playBtn.addEventListener("click", navigateAndEngage);
        if (fullscreenBtn) fullscreenBtn.addEventListener("click", openFullscreen);
        var heroCta = document.querySelector(".btn-watch");
        if (heroCta) heroCta.addEventListener("click", navigateAndEngage);

        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) ambientPlay();
                    else { try { video.pause(); } catch (e) {} }
                });
            }, { threshold: 0.2 });
            io.observe(stage);
        } else { ambientPlay(); }
    }

    /* ---------- sharing ---------- */
    function openShare(u) { window.open(u, "_blank", "noopener,noreferrer,width=640,height=600"); }
    function shareTo(kind, btn) {
        var u = encodeURIComponent(SHARE_URL);
        if (kind === "linkedin") openShare("https://www.linkedin.com/sharing/share-offsite/?url=" + u);
        else if (kind === "x") openShare("https://twitter.com/intent/tweet?text=" + encodeURIComponent(SHARE_TEXT) + "&url=" + u);
        else if (kind === "email") emailShare();
        else if (kind === "copy") copyLink(btn);
        else if (kind === "native") nativeShare();
        else if (kind === "native-or-copy") { if (navigator.share) nativeShare(); else copyLink(btn); }
    }
    function copyLink(btn) {
        var done = function () {
            if (!btn) return;
            btn.classList.add("copied");
            var label = btn.querySelector("[data-copy-label]") || btn.querySelector("span");
            var orig = label ? label.textContent : null;
            if (label) label.textContent = "Link copied";
            setTimeout(function () { btn.classList.remove("copied"); if (label && orig) label.textContent = orig; }, 2200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(SHARE_URL).then(done).catch(function () { legacyCopy(); done(); });
        else { legacyCopy(); done(); }
    }
    function legacyCopy() {
        try {
            var t = document.createElement("textarea");
            t.value = SHARE_URL; t.setAttribute("readonly", "");
            t.style.position = "absolute"; t.style.left = "-9999px";
            document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t);
        } catch (e) {}
    }
    function nativeShare() { if (navigator.share) navigator.share({ title: SHARE_TITLE, text: NATIVE_TEXT, url: SHARE_URL }).catch(function () {}); }
    function emailShare() {
        var body = EMAIL_BODY + "\n\n" + SHARE_URL;
        window.location.href = "mailto:?subject=" + encodeURIComponent(EMAIL_SUBJECT) + "&body=" + encodeURIComponent(body);
    }
    function initShare() {
        document.querySelectorAll("[data-share]").forEach(function (btn) {
            btn.addEventListener("click", function () { shareTo(btn.getAttribute("data-share"), btn); });
        });
        if (navigator.share) document.querySelectorAll(".share-btn-native").forEach(function (b) { b.hidden = false; });
    }

    function initCalActions() {
        document.querySelectorAll("[data-cal-link]").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var link = btn.getAttribute("data-cal-link");
                if (!link) return;
                var cfg = { layout: "month_view", useSlotsViewOnSmallScreen: "true" };
                if (window.Cal && window.Cal.ns && window.Cal.ns.talk) {
                    try { window.Cal.ns.talk("modal", { calLink: link, config: cfg }); return; } catch (e) {}
                }
                window.open("https://cal.com/" + link, "_blank", "noopener,noreferrer");
            });
        });
    }

    /* ---------- footer avatar: 3D tilt + style popover ---------- */
    function initFooterAvatarPop() {
        var button = document.querySelector("[data-footer-avatar]");
        var pop = document.querySelector("[data-footer-avatar-pop]");
        if (!button || !pop) return;
        var shell = button.querySelector(".footer-avatar-shell");
        var close = pop.querySelector("[data-footer-avatar-close]");
        var closeTimer = null;

        function setOpen(open) {
            clearTimeout(closeTimer);
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.classList.toggle("is-pop-open", open);
            if (open) {
                pop.hidden = false;
                requestAnimationFrame(function () { pop.classList.add("is-open"); });
            } else {
                pop.classList.remove("is-open");
                closeTimer = setTimeout(function () {
                    if (!pop.classList.contains("is-open")) pop.hidden = true;
                }, 220);
            }
        }

        function resetTilt() {
            if (!shell) return;
            shell.style.removeProperty("--avatar-rx");
            shell.style.removeProperty("--avatar-ry");
        }

        button.addEventListener("click", function (e) {
            e.preventDefault();
            setOpen(button.getAttribute("aria-expanded") !== "true");
        });
        if (close) close.addEventListener("click", function () { setOpen(false); button.focus(); });

        button.addEventListener("mousemove", function (e) {
            if (!shell || reducedMotion.matches) return;
            var rect = button.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var ry = Math.max(-8, Math.min(8, (e.clientX - cx) / 4.8));
            var rx = Math.max(-8, Math.min(8, (cy - e.clientY) / 4.8));
            shell.style.setProperty("--avatar-rx", rx.toFixed(2) + "deg");
            shell.style.setProperty("--avatar-ry", ry.toFixed(2) + "deg");
        });
        button.addEventListener("mouseleave", resetTilt);
        button.addEventListener("blur", resetTilt);

        document.addEventListener("click", function (e) {
            if (button.contains(e.target) || pop.contains(e.target)) return;
            setOpen(false);
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") setOpen(false);
        });
    }

    /* ---------- premium footer motion: entrance + magnetic Build CTA ---------- */
    function initFooterPremiumMotion() {
        var footer = document.querySelector(".story-footer");
        if (!footer) return;
        if (reducedMotion.matches) {
            footer.classList.add("footer-motion-in");
            return;
        }
        footer.classList.add("footer-motion-ready");

        function revealFooter() {
            footer.classList.add("footer-motion-in");
        }

        function syncInitialFooterState() {
            var rect = footer.getBoundingClientRect();
            var vh = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top < vh * 1.18) revealFooter();
        }

        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    revealFooter();
                    io.disconnect();
                });
            }, { rootMargin: "0px 0px 18% 0px", threshold: 0.01 });
            io.observe(footer);
            requestAnimationFrame(syncInitialFooterState);
        } else {
            revealFooter();
        }
    }

    function initFooterMagneticBuild() {
        var button = document.querySelector(".footer-action-build");
        if (!button || reducedMotion.matches) return;
        var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
        if (!finePointer.matches) return;

        var footer = document.querySelector(".story-footer");
        var visible = !("IntersectionObserver" in window) || !footer;
        var active = false;
        var frame = null;
        var pending = null;

        function setMagnet(x, y) {
            button.style.setProperty("--magnet-x", x.toFixed(2) + "px");
            button.style.setProperty("--magnet-y", y.toFixed(2) + "px");
            button.classList.add("is-magnetic");
            active = true;
        }

        function resetMagnet() {
            if (frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }
            pending = null;
            button.style.setProperty("--magnet-x", "0px");
            button.style.setProperty("--magnet-y", "0px");
            button.classList.remove("is-magnetic");
            active = false;
        }

        function onPointerMove(event) {
            if (!visible) return;
            var rect = button.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = event.clientX - cx;
            var dy = event.clientY - cy;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var radius = Math.max(128, Math.min(170, rect.width * 0.78));

            if (distance > radius) {
                if (active) resetMagnet();
                return;
            }

            var strength = 1 - distance / radius;
            pending = {
                x: Math.max(-10, Math.min(10, dx * (0.045 + strength * 0.055))),
                y: Math.max(-6, Math.min(6, dy * (0.04 + strength * 0.045)))
            };
            if (frame) return;
            frame = requestAnimationFrame(function () {
                frame = null;
                if (pending) setMagnet(pending.x, pending.y);
            });
        }

        if ("IntersectionObserver" in window && footer) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    visible = entry.isIntersecting;
                    if (!visible) resetMagnet();
                });
            }, { threshold: 0.08 });
            io.observe(footer);
        }

        document.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("blur", resetMagnet);
        button.addEventListener("pointerleave", resetMagnet);
        button.addEventListener("blur", resetMagnet);
    }

    /* ---------- support + story portal ---------- */
    var STORE_KEY = "oinp_support_v1";
    function postJSON(path, payload) {
        return fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
            .then(function (res) {
                var ct = res.headers.get("content-type") || "";
                if (res.ok && ct.indexOf("application/json") !== -1) return res.json();
                return null;
            }).catch(function () { return null; });
    }
    function loadState() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { return {}; } }
    function saveState(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }
    function ensureToken(state) {
        if (!state.token) {
            state.token = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
                : ("t-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12));
            saveState(state);
        }
        return state.token;
    }
    var _nonce = null, _noncePromise = null;
    function fetchNonce() {
        _noncePromise = fetch("/api/support/init", { headers: { "Accept": "application/json" } })
            .then(function (r) { return r.json(); })
            .then(function (d) { _nonce = (d && d.nonce) || null; return _nonce; })
            .catch(function () { _nonce = null; return null; });
        return _noncePromise;
    }
    function getNonce() { return _nonce ? Promise.resolve(_nonce) : (_noncePromise || fetchNonce()); }
    function postJSONFull(path, payload) {
        return fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
            .then(function (r) { return r.json().then(function (j) { return { status: r.status, data: j }; }).catch(function () { return { status: r.status, data: null }; }); })
            .catch(function () { return { status: 0, data: null }; });
    }

    /* ---------- Cloudflare Turnstile (dormant unless /api/config returns a site key) ---------- */
    var _ts = { siteKey: null, widgetId: null, ready: false, loading: null, resolve: null };
    function initTurnstile() {
        fetch("/api/config").then(function (r) { return r.json(); }).then(function (d) {
            _ts.siteKey = (d && d.turnstileSiteKey) || null;
            if (!_ts.siteKey) return; // dormant
            if (!_ts.loading) {
                _ts.loading = new Promise(function (res, rej) {
                    var s = document.createElement("script");
                    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
                    s.async = true; s.defer = true; s.onload = res; s.onerror = rej;
                    document.head.appendChild(s);
                });
            }
            _ts.loading.then(function () {
                if (!window.turnstile) return;
                var c = document.createElement("div"); c.style.display = "none"; document.body.appendChild(c);
                _ts.widgetId = window.turnstile.render(c, {
                    sitekey: _ts.siteKey, size: "invisible",
                    callback: function (t) { if (_ts.resolve) { _ts.resolve(t || ""); _ts.resolve = null; } },
                    "error-callback": function () { if (_ts.resolve) { _ts.resolve(""); _ts.resolve = null; } }
                });
                _ts.ready = true;
            }).catch(function () {});
        }).catch(function () {});
    }
    function getTurnstileToken() {
        if (!_ts.siteKey || !_ts.ready || !window.turnstile) return Promise.resolve("");
        return new Promise(function (resolve) {
            _ts.resolve = resolve;
            try { window.turnstile.reset(_ts.widgetId); window.turnstile.execute(_ts.widgetId, { action: "submit" }); }
            catch (e) { resolve(""); _ts.resolve = null; }
            setTimeout(function () { if (_ts.resolve) { _ts.resolve(""); _ts.resolve = null; } }, 8000);
        });
    }

    function initSupport() {
        var root = document.querySelector("[data-support]");
        if (!root) return;
        var askEl = root.querySelector("[data-support-ask]");
        var thanksEl = root.querySelector("[data-support-thanks]");
        var btn = root.querySelector("[data-support-btn]");
        var errEl = root.querySelector("[data-support-error]");
        var countEl = root.querySelector("[data-support-count]");
        var receiptEl = root.querySelector("[data-support-receipt]");
        var state = loadState();
        ensureToken(state);
        fetchNonce(); // prime early so server-side dwell accrues before the click

        function refreshCount() {
            if (!countEl) return;
            fetch("/api/support/count").then(function (r) { return r.json(); }).then(function (d) {
                if (d && d.show && typeof d.total === "number") {
                    countEl.innerHTML = d.total.toLocaleString() + " people support this \u00b7 <a href=\"/transparency/\">how we count</a>";
                    countEl.hidden = false;
                } else { countEl.hidden = true; }
            }).catch(function () {});
        }
        function showReceipt() {
            if (receiptEl && state.receipt) { receiptEl.textContent = "Your supporter receipt: " + state.receipt; receiptEl.hidden = false; }
        }
        function showThanks(animate) {
            if (askEl) askEl.hidden = true;
            if (thanksEl) { thanksEl.hidden = false; if (!animate) thanksEl.style.animation = "none"; }
            showReceipt(); refreshCount();
        }
        function showError(msg) { if (errEl) { errEl.textContent = msg; errEl.hidden = false; } }
        function clearError() { if (errEl) errEl.hidden = true; }

        if (state && state.supported && state.receipt) showThanks(false);

        function submit(isRetry) {
            clearError();
            btn.classList.add("is-loading");
            Promise.all([getNonce(), getTurnstileToken()]).then(function (vals) {
                return postJSONFull("/api/support", { token: state.token, nonce: vals[0], turnstileToken: vals[1], source: "oinp-homepage", company: "" });
            }).then(function (res) {
                var d = res.data;
                if (res.status === 200 && d && d.ok) {
                    state.supported = true; state.receipt = d.receipt;
                    if (d.updateToken) state.updateToken = d.updateToken;
                    saveState(state);
                    btn.classList.remove("is-loading");
                    showThanks(true);
                    fetchNonce(); // prime a fresh single-use nonce for a possible story submission
                    return;
                }
                if (d && (d.reason === "nonce" || d.reason === "too_fast" || d.reason === "nonce_used") && !isRetry) {
                    return fetchNonce().then(function () { return new Promise(function (rs) { setTimeout(rs, 900); }); }).then(function () { submit(true); });
                }
                btn.classList.remove("is-loading");
                if (res.status === 0) showError("Couldn\u2019t reach the server \u2014 your support may not be saved. Please try again.");
                else if (d && d.reason === "rate") showError("Too many attempts right now. Please try again in a few minutes.");
                else showError("Something went wrong \u2014 your support wasn\u2019t saved. Please try again.");
            });
        }

        if (btn) {
            btn.addEventListener("click", function () {
                if (state.supported && state.receipt) { showThanks(true); return; }
                submit(false);
            });
        }
    }

    function initStoryPortal() {
        var form = document.querySelector("[data-portal-form]");
        if (!form) return;
        var startedAt = Date.now();
        var story = form.querySelector("#st-story");
        var count = form.querySelector("[data-count]");
        var storyErr = form.querySelector("[data-story-error]");
        var nameEl = form.querySelector("#st-name");
        var emailEl = form.querySelector("#st-email");
        var MAX = 1500;
        var DRAFT_KEY = "oinp_story_draft_v1";

        // keep what you're writing safe across reloads / accidental navigation
        function readDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}"); } catch (e) { return {}; } }
        function writeDraft() {
            var d = { name: nameEl ? nameEl.value : "", email: emailEl ? emailEl.value : "", comment: story ? story.value : "" };
            try {
                if (d.name || d.email || d.comment) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
                else localStorage.removeItem(DRAFT_KEY);
            } catch (e) {}
        }
        function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
        function restoreDraft() {
            var d = readDraft(); if (!d) return;
            if (nameEl && d.name && !nameEl.value) nameEl.value = d.name;
            if (emailEl && d.email && !emailEl.value) emailEl.value = d.email;
            if (story && d.comment && !story.value) story.value = d.comment;
        }
        var saveTimer = null;
        function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(writeDraft, 400); }

        // live character counter + gentle auto-grow for "Your story"
        function sync() {
            if (story && count) {
                var n = story.value.length;
                count.textContent = n + " / " + MAX;
                count.classList.toggle("near", n > MAX - 150);
                count.hidden = n === 0;
            }
            if (story && story.hasAttribute("data-autogrow")) {
                story.style.height = "auto";
                story.style.height = Math.min(story.scrollHeight, 360) + "px";
            }
        }
        restoreDraft();
        if (story) { story.addEventListener("input", sync); }
        sync();

        function mark(el, bad) { if (el) el.classList.toggle("invalid", !!bad); }
        function onField(el) {
            if (!el) return;
            el.addEventListener("input", function () {
                el.classList.remove("invalid");
                if (el === story && storyErr) storyErr.hidden = true;
                queueSave();
            });
        }
        onField(nameEl); onField(emailEl); onField(story);

        // Cmd / Ctrl + Enter sends from anywhere in the form
        form.addEventListener("keydown", function (e) {
            if ((e.metaKey || e.ctrlKey) && (e.key === "Enter" || e.keyCode === 13)) {
                e.preventDefault();
                if (typeof form.requestSubmit === "function") form.requestSubmit();
                else form.dispatchEvent(new Event("submit", { cancelable: true }));
            }
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var hp = form.querySelector(".hp"); if (hp && hp.value) return;

            var nameOk = nameEl && nameEl.value.trim().length > 0;
            var emailOk = emailEl && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
            var storyOk = story && story.value.trim().length >= 20;
            mark(nameEl, !nameOk); mark(emailEl, !emailOk); mark(story, !storyOk);
            if (storyErr) storyErr.hidden = !!storyOk;
            if (!nameOk) { nameEl.focus(); return; }
            if (!emailOk) { emailEl.focus(); return; }
            if (!storyOk) { story.focus(); return; }

            var btn = form.querySelector(".btn-portal");
            var label = form.querySelector(".portal-submit-label");
            var done = form.querySelector("[data-portal-done]");
            if (btn) btn.disabled = true;
            if (label) label.textContent = "Sending…";
            var errEl = form.querySelector("[data-portal-error]");
            var consentEl = form.querySelector("[data-public-consent]");
            if (errEl) errEl.hidden = true;
            var state = loadState();
            ensureToken(state);

            function finishOk(d) {
                if (d.token) state.token = d.token;
                if (d.receipt) { state.receipt = d.receipt; state.supported = true; }
                if (d.updateToken) state.updateToken = d.updateToken;
                saveState(state);
                clearDraft();
                var pcard = form.parentElement;
                var card = pcard.querySelector("[data-portal-thanks]");
                var rcpt = pcard.querySelector("[data-portal-receipt]");
                if (rcpt && state.receipt) { rcpt.textContent = "Your supporter receipt: " + state.receipt; rcpt.hidden = false; }
                form.hidden = true;
                form.style.display = "none";
                var head = pcard.querySelector(".portal-head"); if (head) head.hidden = true;
                var intro = pcard.querySelector(".portal-intro:not(.portal-intro-center)"); if (intro) intro.hidden = true;
                var lead = document.querySelector("[data-support]"); if (lead) lead.style.display = "none";
                var divider = document.querySelector(".portal-divider"); if (divider) divider.style.display = "none";
                var sec = document.querySelector(".support"); if (sec) sec.classList.add("is-success");
                if (card) { card.hidden = false; try { card.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {} }
            }
            function fail(msg) {
                if (label) label.textContent = "Share my story";
                if (btn) btn.disabled = false;
                if (errEl) { errEl.textContent = msg; errEl.hidden = false; }
            }
            function send(nonce, isRetry) {
                getTurnstileToken().then(function (tt) {
                    return postJSONFull("/api/support/details", {
                        token: state.token, nonce: nonce, turnstileToken: tt, company: hp ? hp.value : "",
                        name: nameEl.value.trim(), email: emailEl.value.trim(), comment: story.value.trim(),
                        public_consent: consentEl && consentEl.checked ? 1 : 0, source: "story-portal"
                    });
                }).then(function (res) {
                    var d = res.data;
                    if (res.status === 200 && d && d.ok) { finishOk(d); return; }
                    if (d && (d.reason === "nonce" || d.reason === "too_fast" || d.reason === "nonce_used") && !isRetry) {
                        fetchNonce().then(function () { setTimeout(function () { send(_nonce, true); }, 900); });
                        return;
                    }
                    if (res.status === 0) fail("Couldn\u2019t reach the server \u2014 your story wasn\u2019t saved. Please try again.");
                    else if (d && d.reason === "comment") fail("Please add a little more \u2014 even one honest sentence helps.");
                    else if (d && d.reason === "rate") fail("Too many attempts right now. Please try again in a few minutes.");
                    else fail("Something went wrong \u2014 your story wasn\u2019t saved. Please try again.");
                });
            }
            getNonce().then(function (nonce) { send(nonce, false); });
        });

        var anotherBtn = document.querySelector("[data-portal-another]");
        if (anotherBtn) {
            anotherBtn.addEventListener("click", function () {
                var pcard = form.parentElement;
                var card = pcard.querySelector("[data-portal-thanks]");
                var head = pcard.querySelector(".portal-head");
                var intro = pcard.querySelector(".portal-intro:not(.portal-intro-center)");
                var rcpt = pcard.querySelector("[data-portal-receipt]");
                var errEl = form.querySelector("[data-portal-error]");
                var consentEl = form.querySelector("[data-public-consent]");
                var label = form.querySelector(".portal-submit-label");
                var btn = form.querySelector(".btn-portal");
                var sec = document.querySelector(".support");
                if (card) card.hidden = true;
                if (sec) sec.classList.remove("is-success");
                form.hidden = false; form.style.display = "";
                if (head) head.hidden = false;
                if (intro) intro.hidden = false;
                if (rcpt) rcpt.hidden = true;
                if (errEl) errEl.hidden = true;
                if (label) label.textContent = "Share my story";
                if (btn) btn.disabled = false;
                form.querySelectorAll("input, textarea").forEach(function (el) { if (el.type !== "checkbox") el.value = ""; });
                if (consentEl) consentEl.checked = false;
                sync();
                fetchNonce();
                try { form.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
                if (nameEl) setTimeout(function () { nameEl.focus(); }, 250);
            });
        }
    }

    /* ---- byline masthead: tuck away once scrolled into the story ---- */
    function initTopmark() {
        var tm = document.querySelector(".topmark");
        if (!tm) return;
        var ticking = false;
        function check() {
            ticking = false;
            var h = window.innerHeight || document.documentElement.clientHeight;
            if (window.scrollY > h * 0.5) tm.classList.add("is-tucked");
            else tm.classList.remove("is-tucked");
        }
        function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
        window.addEventListener("scroll", onScroll, { passive: true });
        check();
    }

    /* ---- desktop hero scroll-dissolve: push-in + darken + content drift ---- */
    function initHeroScroll() {
        if (reducedMotion.matches) return;
        var hero = document.querySelector(".hero");
        var pin = document.querySelector(".hero-pin");
        var media = document.querySelector(".hero-media");
        var content = document.querySelector(".hero-content");
        var dim = document.querySelector(".hero-dim");
        if (!hero || !media) return;
        var ticking = false;
        function update() {
            ticking = false;
            if (window.innerWidth <= 760) {
                media.style.transform = ""; if (dim) dim.style.opacity = "";
                if (content) { content.style.opacity = ""; content.style.transform = ""; }
                return;
            }
            var runway = (pin ? pin.offsetHeight : hero.offsetHeight) - window.innerHeight;
            if (runway < 1) runway = 1;
            var prog = window.scrollY / runway;
            if (prog < 0) prog = 0; if (prog > 1) prog = 1;
            media.style.transform = "scale(" + (1 + 0.16 * prog).toFixed(4) + ")";
            if (dim) dim.style.opacity = (0.74 * prog).toFixed(3);
            if (content) {
                var o = 1 - prog * 1.25; if (o < 0) o = 0;
                content.style.opacity = o.toFixed(3);
                content.style.transform = "translateY(" + (-prog * 60).toFixed(1) + "px)";
            }
        }
        function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
    }

    /* ---- magnetic snap: after the dissolve, glide straight onto the video ---- */
    function initMagneticSnap() {
        if (reducedMotion.matches || window.innerWidth <= 760) return;
        var stage = document.querySelector(".film-stage");
        var head = document.querySelector(".film-head");
        if (!stage) return;
        var idle = null, lastY = window.pageYOffset, attached = false;
        function onIdle() {
            if (attached || window.__videoEngaged || window.innerWidth <= 760) return;
            var vh = window.innerHeight, sTop = stage.getBoundingClientRect().top;
            var titleShown = !head || head.getBoundingClientRect().top < vh * 0.62;
            /* title shown + video risen into the upper area -> attach it to fill the frame */
            if (titleShown && sTop > vh * 0.08 && sTop < vh * 0.7) {
                attached = true;
                animScrollTo(videoFullY());
            }
        }
        window.addEventListener("scroll", function () {
            var y = window.pageYOffset, down = y > lastY + 0.5; lastY = y;
            if (stage.getBoundingClientRect().top > window.innerHeight * 0.92) attached = false; /* re-arm above the video */
            clearTimeout(idle);
            if (down) idle = setTimeout(onIdle, 120);
        }, { passive: true });
    }

    /* ---- ask descriptions wrap normally to ~two lines (see CSS) ---- */

    document.addEventListener("DOMContentLoaded", function () {
        initSmoothScroll();
        initTopmark();
        initHeroVideo();
        initHeroScroll();
        initMagneticSnap();
        initReveals();
        initAskDetails();
        initFilm();
        initShare();
        initCalActions();
        initFooterAvatarPop();
        initFooterPremiumMotion();
        initFooterMagneticBuild();
        initTurnstile();
        initSupport();
        initStoryPortal();
    });
})();
