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

  if (chapters.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            chapters.forEach(function (chapter) {
              chapter.classList.remove("is-active");
            });
            entry.target.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0.1 }
    );

    chapters.forEach(function (chapter) {
      observer.observe(chapter);
    });
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
