(function () {
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector("#site-menu");

  if (toggle && nav && links) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var chapters = document.querySelectorAll(".chapter");
  var reel = document.querySelector(".experience-reel");

  function activateChapter(target) {
    if (!target) return;
    chapters.forEach(function (chapter) {
      chapter.classList.toggle("is-active", chapter === target);
    });
  }

  function chapterFromReel() {
    if (!reel || !chapters.length) return chapters[0];
    var rect = reel.getBoundingClientRect();
    var travel = reel.offsetHeight - window.innerHeight;
    if (travel <= 0) return chapters[0];
    var scrolled = Math.min(Math.max(-rect.top, 0), travel);
    var progress = scrolled / travel;
    var index = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
    return chapters[index];
  }

  if (chapters.length) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        activateChapter(reduce ? chapters[0] : chapterFromReel());
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    activateChapter(reduce ? chapters[0] : chapterFromReel());

    if (reel && location.hash) {
      var hashed = document.querySelector(location.hash);
      var index = Array.prototype.indexOf.call(chapters, hashed);
      if (index >= 0) {
        var travel = reel.offsetHeight - window.innerHeight;
        var y = reel.offsetTop + (index / chapters.length) * travel + 8;
        window.scrollTo(0, y);
      }
    }
  }

  if (!reduce && "IntersectionObserver" in window) {
    var drawables = document.querySelectorAll(".draw-line");
    var drawObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-drawn");
            drawObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    drawables.forEach(function (el) {
      drawObserver.observe(el);
    });
  }
})();
