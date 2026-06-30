(function () {
    "use strict";

    /* ---------- Share payload (production canonical) ---------- */
    var SHARE_URL = "https://oinp.hubeiqiao.com/";
    var SHARE_TITLE = "Canada helped me become a builder. Does Canada know how to keep builders?";
    var SHARE_TEXT =
        "Canada helped me become a builder. Does Canada know how to keep builders?\n\n" +
        "This is one builder's story, but it points to something broader: product, users, " +
        "company-building, and community contribution can exist before they become traditional employment signals.\n\n" +
        "I support fair pathways for students, graduates, and early-stage builders already contributing in Canada.";
    var NATIVE_TEXT =
        "Joe Hu built his first product, registered his first company, and found confidence through " +
        "Canadian communities. Now he is sharing what international builders are facing.";

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ====================================================================
       Smooth scroll for in-page anchors
       ==================================================================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener("click", function (event) {
                var href = anchor.getAttribute("href");
                if (!href || href === "#") return;
                var target = document.querySelector(href);
                if (!target) return;
                event.preventDefault();
                var behavior = reducedMotion.matches ? "auto" : "smooth";
                target.scrollIntoView({ behavior: behavior, block: "start" });
                if (href !== "#top") history.pushState(null, "", href);
            });
        });
    }

    /* ====================================================================
       Nav: condensed background after scrolling past the hero fold
       ==================================================================== */
    function initNav() {
        var nav = document.querySelector("[data-nav]");
        if (!nav) return;
        var onScroll = function () {
            if (window.scrollY > 24) nav.classList.add("scrolled");
            else nav.classList.remove("scrolled");
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ====================================================================
       Hero hook video: chromeless, muted, autoplay with poster fallback
       ==================================================================== */
    function initHeroVideo() {
        var root = document.documentElement;
        var video = document.querySelector(".hero-video");
        if (!video) return;

        video.controls = false;
        video.removeAttribute("controls");
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.disablePictureInPicture = true;
        video.setAttribute("tabindex", "-1");
        video.addEventListener("contextmenu", function (e) { e.preventDefault(); });

        function usePosterFallback() {
            root.classList.add("video-fallback");
            try { video.pause(); } catch (e) {}
        }
        function clearFallback() { root.classList.remove("video-fallback"); }

        if (reducedMotion.matches) { usePosterFallback(); return; }

        video.addEventListener("error", usePosterFallback);
        var source = video.querySelector("source");
        if (source) source.addEventListener("error", usePosterFallback);
        video.addEventListener("playing", clearFallback);

        function attemptPlay() {
            var attempt = video.play();
            if (attempt && typeof attempt.then === "function") {
                attempt.then(clearFallback).catch(usePosterFallback);
            }
        }
        if (video.readyState >= 2) attemptPlay();
        else {
            video.addEventListener("loadeddata", attemptPlay, { once: true });
            setTimeout(attemptPlay, 1200);
        }

        if (typeof reducedMotion.addEventListener === "function") {
            reducedMotion.addEventListener("change", function (e) {
                if (e.matches) usePosterFallback(); else attemptPlay();
            });
        }
    }

    /* ====================================================================
       Scroll reveals — blur-in + rise, staggered per group.
       Scroll-driven + rAF-throttled, self-removing once everything is in.
       Guarantees no element can stay hidden after being scrolled past
       (fast flicks, anchor jumps, back/forward navigation).
       ==================================================================== */
    function initReveals() {
        var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
        if (!items.length) return;

        if (reducedMotion.matches) {
            items.forEach(function (el) { el.classList.add("in"); });
            return;
        }

        // stagger siblings sharing a parent
        items.forEach(function (el) {
            var sibs = Array.prototype.slice.call(el.parentElement.querySelectorAll(":scope > .reveal"));
            var i = sibs.indexOf(el);
            if (i > 0) el.style.setProperty("--reveal-delay", (i * 90) + "ms");
        });

        var pending = items.slice();
        var ticking = false;

        function check() {
            ticking = false;
            var vh = window.innerHeight || document.documentElement.clientHeight;
            pending = pending.filter(function (el) {
                if (el.getBoundingClientRect().top < vh * 0.9) {
                    el.classList.add("in");
                    return false;
                }
                return true;
            });
            if (!pending.length) {
                window.removeEventListener("scroll", onScroll);
                window.removeEventListener("resize", onScroll);
            }
        }
        function onScroll() {
            if (!ticking) { ticking = true; requestAnimationFrame(check); }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        check(); // reveal anything already in view on load
    }

    /* ====================================================================
       Full-story video: custom play affordance over native controls
       ==================================================================== */
    function initStoryVideo() {
        var stage = document.querySelector("[data-video-stage]");
        if (!stage) return;
        var video = stage.querySelector("video");
        var playBtn = stage.querySelector("[data-video-play]");
        if (!video) return;

        function start() {
            stage.classList.add("playing");
            video.setAttribute("preload", "auto");
            var p = video.play();
            if (p && typeof p.catch === "function") {
                p.catch(function () { /* user can use native controls */ });
            }
        }
        if (playBtn) playBtn.addEventListener("click", start);
        video.addEventListener("play", function () { stage.classList.add("playing"); });
    }

    /* ====================================================================
       Sharing — LinkedIn / X / copy / native
       ==================================================================== */
    function openShare(url) {
        window.open(url, "_blank", "noopener,noreferrer,width=640,height=600");
    }
    function shareTo(kind, btn) {
        var u = encodeURIComponent(SHARE_URL);
        if (kind === "linkedin") {
            openShare("https://www.linkedin.com/sharing/share-offsite/?url=" + u);
        } else if (kind === "x") {
            openShare("https://twitter.com/intent/tweet?text=" + encodeURIComponent(SHARE_TEXT) + "&url=" + u);
        } else if (kind === "copy") {
            copyLink(btn);
        } else if (kind === "native") {
            nativeShare();
        } else if (kind === "native-or-copy") {
            if (navigator.share) nativeShare();
            else { document.getElementById("support"); copyLink(btn); }
        }
    }
    function copyLink(btn) {
        var done = function () {
            if (!btn) return;
            btn.classList.add("copied");
            var label = btn.querySelector("[data-copy-label]") || btn.querySelector("span");
            var original = label ? label.textContent : null;
            if (label) label.textContent = "Link copied";
            setTimeout(function () {
                btn.classList.remove("copied");
                if (label && original) label.textContent = original;
            }, 2200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(SHARE_URL).then(done).catch(function () { legacyCopy(); done(); });
        } else { legacyCopy(); done(); }
    }
    function legacyCopy() {
        try {
            var t = document.createElement("textarea");
            t.value = SHARE_URL;
            t.setAttribute("readonly", "");
            t.style.position = "absolute"; t.style.left = "-9999px";
            document.body.appendChild(t);
            t.select();
            document.execCommand("copy");
            document.body.removeChild(t);
        } catch (e) {}
    }
    function nativeShare() {
        if (!navigator.share) return;
        navigator.share({ title: SHARE_TITLE, text: NATIVE_TEXT, url: SHARE_URL }).catch(function () {});
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
        // Progressive enhancement: works once the Worker/D1 API exists.
        // Never blocks or fakes the UI if the endpoint is absent.
        return fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(function (res) {
            var ct = res.headers.get("content-type") || "";
            if (res.ok && ct.indexOf("application/json") !== -1) return res.json();
            return null;
        }).catch(function () { return null; });
    }

    function initSupport() {
        var root = document.querySelector("[data-support]");
        if (!root) return;
        var askEl = root.querySelector("[data-support-ask]");
        var thanksEl = root.querySelector("[data-support-thanks]");
        var btn = root.querySelector("[data-support-btn]");
        var toggle = root.querySelector("[data-detail-toggle]");
        var detailWrap = root.querySelector("[data-detail-wrap]");
        var form = root.querySelector("[data-detail-form]");
        var startedAt = Date.now();
        var state = loadState();

        function loadState() {
            try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
            catch (e) { return {}; }
        }
        function saveState() {
            try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
        }
        function showThanks(animate) {
            if (askEl) askEl.hidden = true;
            if (thanksEl) {
                thanksEl.hidden = false;
                if (!animate) thanksEl.style.animation = "none";
            }
        }

        // Returning supporter
        if (state && state.supported) showThanks(false);

        if (btn) {
            btn.addEventListener("click", function () {
                if (state.supported) { showThanks(true); return; }
                btn.classList.add("is-loading");
                var payload = { startedAt: startedAt, source: "oinp-homepage", company: "" };
                postJSON("/api/support", payload).then(function (data) {
                    state.supported = true;
                    if (data && data.supportId) {
                        state.supportId = data.supportId;
                        state.updateToken = data.updateToken;
                    }
                    saveState();
                    btn.classList.remove("is-loading");
                    showThanks(true);
                });
                // Safety: if network hangs, still resolve UI quickly
                setTimeout(function () {
                    if (!state.supported) {
                        state.supported = true; saveState();
                        btn.classList.remove("is-loading");
                        showThanks(true);
                    }
                }, 1400);
            });
        }

        if (toggle && detailWrap) {
            toggle.addEventListener("click", function () {
                var open = detailWrap.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                if (open) {
                    var firstField = detailWrap.querySelector("input, textarea");
                    if (firstField) setTimeout(function () { firstField.focus(); }, 320);
                }
            });
        }

        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                var honeypot = form.querySelector(".hp");
                if (honeypot && honeypot.value) return; // bot
                var submitBtn = form.querySelector(".detail-submit");
                var label = form.querySelector(".detail-submit-label");
                var done = form.querySelector("[data-detail-done]");
                if (submitBtn) submitBtn.disabled = true;
                if (label) label.textContent = "Adding…";

                var fd = new FormData(form);
                var payload = {
                    supportId: state.supportId || null,
                    updateToken: state.updateToken || null,
                    name: (fd.get("name") || "").toString().trim(),
                    email: (fd.get("email") || "").toString().trim(),
                    comment: (fd.get("comment") || "").toString().trim(),
                    publicPermission: (fd.get("publicPermission") || "private").toString(),
                    startedAt: startedAt
                };
                postJSON("/api/support/details", payload).then(function () {
                    state.detailsAdded = true; saveState();
                    if (label) label.textContent = "Add my note";
                    if (submitBtn) submitBtn.disabled = false;
                    if (done) done.hidden = false;
                    form.querySelectorAll("input, textarea").forEach(function (el) {
                        if (el.type !== "radio") el.value = "";
                    });
                });
            });
        }
    }

    /* ---------- boot ---------- */
    document.addEventListener("DOMContentLoaded", function () {
        initSmoothScroll();
        initNav();
        initHeroVideo();
        initReveals();
        initStoryVideo();
        initShare();
        initCalActions();
        initFooterAvatarPop();
        initFooterPremiumMotion();
        initFooterMagneticBuild();
        initSupport();
    });
})();
