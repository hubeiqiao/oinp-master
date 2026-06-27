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

        var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        function usePosterFallback() {
            root.classList.add("video-fallback");
            video.pause();
        }

        if (reducedMotion.matches) {
            usePosterFallback();
            return;
        }

        video.muted = true;
        video.playsInline = true;
        video.loop = true;

        video.addEventListener("error", usePosterFallback);

        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(usePosterFallback);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initSmoothScroll();
        initHeroVideo();
    });
})();
