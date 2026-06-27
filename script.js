(function () {
    "use strict";

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener("click", function (event) {
                var href = anchor.getAttribute("href");
                if (!href || href === "#") return;
                var target = document.querySelector(href);
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                history.pushState(null, "", href);
            });
        });
    }

    function initHeroVideo() {
        var root = document.documentElement;
        var video = document.querySelector(".hero-video");
        if (!video) return;

        // Enforce a chromeless, inline, muted, looping background video.
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

        var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        function usePosterFallback() {
            root.classList.add("video-fallback");
            try { video.pause(); } catch (e) {}
        }

        function clearFallback() {
            root.classList.remove("video-fallback");
        }

        if (reducedMotion.matches) {
            usePosterFallback();
            return;
        }

        video.addEventListener("error", usePosterFallback, { once: false });
        if (video.querySelector("source")) {
            video.querySelector("source").addEventListener("error", usePosterFallback);
        }
        video.addEventListener("playing", clearFallback);
        video.addEventListener("stalled", function () {
            // do not hard-fail on a transient stall; poster remains underneath
        });

        function attemptPlay() {
            var attempt = video.play();
            if (attempt && typeof attempt.then === "function") {
                attempt.then(clearFallback).catch(usePosterFallback);
            }
        }

        if (video.readyState >= 2) {
            attemptPlay();
        } else {
            video.addEventListener("loadeddata", attemptPlay, { once: true });
            // Safety: if nothing is ready shortly, try once anyway.
            setTimeout(attemptPlay, 1200);
        }

        // React to a later change in motion preference.
        if (typeof reducedMotion.addEventListener === "function") {
            reducedMotion.addEventListener("change", function (e) {
                if (e.matches) { usePosterFallback(); } else { attemptPlay(); }
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initSmoothScroll();
        initHeroVideo();
    });
})();
