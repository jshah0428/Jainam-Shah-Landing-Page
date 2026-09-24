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

  var canvas = document.querySelector(".canvas");
  if (canvas) {
    var activeLink = document.querySelector(".nav-links .nav-link.is-active");
    var pageName = activeLink ? activeLink.textContent.trim() : "";

    var C = {
      cobalt: "#2463A9", cyan: "#16A6C9", magenta: "#D92B75", orange: "#F26A21",
      yellow: "#F4D52B", lime: "#A7C943", violet: "#9B6BD1", chalk: "#F4F3EE"
    };

    var f = function (n) { return n.toFixed(1); };
    var trace = function (fn, t0, t1, step) {
      var d = "";
      for (var t = t0; t <= t1 + 1e-9; t += step) {
        var pt = fn(t);
        d += (d ? " L" : "M") + f(pt[0]) + " " + f(pt[1]);
      }
      return d;
    };
    var line = function (d, color, width, extra) {
      return '<path d="' + d + '" stroke="' + color + '" stroke-width="' + width +
        '" stroke-linecap="round" stroke-linejoin="round" fill="none" ' + (extra || "") + "/>";
    };
    var flex = 'vector-effect="non-scaling-stroke"';

    // Tall pieces stretch to their box ("none"); shaped pieces keep proportions ("meet").
    var wavePath = function (phase) {
      return trace(function (t) { return [20 + 13 * Math.sin(t / 9 + phase), t]; }, 0, 400, 4);
    };
    var shapes = {
      wave: function (color) {
        return { vb: "0 0 40 400", fit: "none", body: line(wavePath(0), color, 3, flex) };
      },
      dots: function (color) {
        return { vb: "0 0 40 400", fit: "none", body: line(wavePath(1.5), color, 4, flex + ' stroke-dasharray="0 11"') };
      },
      helix: function (a, b) {
        var rungs = "";
        for (var y = 14; y < 400; y += 28.3) {
          var x1 = 20 + 13 * Math.sin(y / 9), x2 = 20 + 13 * Math.sin(y / 9 + Math.PI);
          rungs += line("M" + f(x1) + " " + y + " L" + f(x2) + " " + y, C.chalk, 1, flex + ' opacity="0.35"');
        }
        return { vb: "0 0 40 400", fit: "none", body: rungs + line(wavePath(0), a, 3, flex) + line(wavePath(Math.PI), b, 3, flex) };
      },
      zigzag: function (color) {
        var d = "M8 0";
        for (var y = 22, i = 0; y <= 400; y += 22, i++) d += " L" + (i % 2 ? 8 : 32) + " " + y;
        return { vb: "0 0 40 400", fit: "none", body: line(d, color, 3, flex) };
      },
      curl: function (color, loops) {
        var r = 11, c = 4.5, T = Math.PI * 2 * (loops || 5);
        var d = trace(function (t) { return [20 - r * Math.cos(t), r + c * t - r * Math.sin(t)]; }, 0, T, 0.12);
        return { vb: "0 0 40 " + Math.ceil(c * T + 2 * r + 2), fit: "meet", body: line(d, color, 3.5, 'pathLength="1"') };
      },
      spiral: function (color, accent) {
        var d = trace(function (t) { var k = 1.3 * t; return [24 + k * Math.cos(t), 24 + k * Math.sin(t)]; }, 0, Math.PI * 4.2, 0.1);
        return {
          vb: "0 0 48 48", fit: "meet",
          body: line(d, color, 3, 'pathLength="1"') + '<circle cx="24" cy="24" r="2.5" fill="' + (accent || color) + '"/>'
        };
      },
      brush: function (a, b) {
        return {
          vb: "0 0 28 140", fit: "none",
          body: line("M15 4c-6 22 7 34 -1 58s6 38 -2 58c-2 6 1 11 2 16", a, 5, 'pathLength="1"') +
            line("M9 48c4 10 -3 18 3 28", b, 3, 'pathLength="1"')
        };
      },
      sparkles: function (colors) {
        var star = function (cx, cy, s, color) {
          return '<path fill="' + color + '" d="M' + cx + " " + (cy - s) + " Q" + (cx + s * 0.15) + " " + (cy - s * 0.15) + " " + (cx + s) + " " + cy +
            " Q" + (cx + s * 0.15) + " " + (cy + s * 0.15) + " " + cx + " " + (cy + s) +
            " Q" + (cx - s * 0.15) + " " + (cy + s * 0.15) + " " + (cx - s) + " " + cy +
            " Q" + (cx - s * 0.15) + " " + (cy - s * 0.15) + " " + cx + " " + (cy - s) + 'Z"/>';
        };
        return {
          vb: "0 0 40 120", fit: "meet",
          body: star(22, 16, 13, colors[0]) + star(10, 52, 7, colors[1]) + star(28, 84, 10, colors[2] || colors[0]) +
            '<circle cx="12" cy="108" r="4" stroke="' + colors[1] + '" stroke-width="2" fill="none"/>'
        };
      },
      confetti: function (seed, colors, h) {
        var s = seed;
        var rnd = function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
        var body = "", n = Math.round(h / 16);
        for (var i = 0; i < n; i++) {
          var x = 6 + rnd() * 28, y = 6 + i * (h - 12) / n + rnd() * 6, col = colors[i % colors.length];
          var rot = Math.round(rnd() * 180), kind = i % 4;
          if (kind === 0) body += '<rect x="' + f(x - 4) + '" y="' + f(y - 1.5) + '" width="8" height="3" rx="1" fill="' + col + '" transform="rotate(' + rot + " " + f(x) + " " + f(y) + ')"/>';
          else if (kind === 1) body += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="2.4" fill="' + col + '"/>';
          else if (kind === 2) body += '<path d="M' + f(x) + " " + f(y - 4) + " L" + f(x + 4) + " " + f(y + 3) + " L" + f(x - 4) + " " + f(y + 3) + 'Z" fill="' + col + '" transform="rotate(' + rot + " " + f(x) + " " + f(y) + ')"/>';
          else body += line("M" + f(x - 6) + " " + f(y) + " q3 -5 6 0 t6 0", col, 2);
        }
        return { vb: "0 0 40 " + h, fit: "meet", body: body };
      }
    };

    // x is measured from the rail's outer (screen) edge. The rail labels sit at 2.4rem,
    // so slim pieces use 0.3rem (outside the label) or 3.1rem (between label and ruler).
    var pages = {
      "about me": {
        left: [
          { s: shapes.curl(C.orange, 5), top: "0", h: "11rem", w: "2.8rem", x: "0.8rem", drift: -40, fx: "draw sway" },
          { s: shapes.wave(C.cyan), top: "22%", h: "56%", w: "1.4rem", x: "3.1rem", drift: 30 },
          { s: shapes.sparkles([C.yellow, C.magenta]), top: "30%", h: "7rem", w: "1.5rem", x: "0.3rem", drift: -60, fx: "float" },
          { s: shapes.confetti(3, [C.magenta, C.yellow, C.lime, C.cyan], 180), bottom: "0", h: "11rem", w: "2.8rem", x: "0.6rem", drift: -30, fx: "float" }
        ],
        right: [
          { s: shapes.zigzag(C.magenta), top: "0", h: "30%", w: "1.4rem", x: "0.4rem", drift: 30 },
          { s: shapes.spiral(C.yellow, C.cobalt), top: "36%", h: "3rem", w: "3rem", x: "3.2rem", drift: -50, fx: "draw spin" },
          { s: shapes.dots(C.lime), top: "55%", h: "25%", w: "1.4rem", x: "3.3rem", drift: 20 },
          { s: shapes.curl(C.cobalt, 4), bottom: "0", h: "9rem", w: "2.6rem", x: "0.4rem", drift: -40, fx: "draw sway" }
        ]
      },
      experiences: {
        left: [
          { s: shapes.spiral(C.magenta, C.yellow), top: "0", h: "3.4rem", w: "3.4rem", x: "0.6rem", drift: -30, fx: "draw spin" },
          { s: shapes.zigzag(C.cyan), top: "14%", h: "70%", w: "1.3rem", x: "3.1rem", drift: 40 },
          { s: shapes.confetti(11, [C.yellow, C.cobalt, C.magenta], 140), top: "34%", h: "9rem", w: "1.5rem", x: "0.3rem", drift: -70, fx: "float" },
          { s: shapes.brush(C.cobalt, C.magenta), bottom: "0", h: "12rem", w: "3rem", x: "0.6rem", drift: -20, fx: "draw" }
        ],
        right: [
          { s: shapes.curl(C.cyan, 5), top: "0", h: "11rem", w: "2.8rem", x: "0.4rem", drift: -40, fx: "draw sway" },
          { s: shapes.dots(C.yellow), top: "20%", h: "28%", w: "1.4rem", x: "3.3rem", drift: 30 },
          { s: shapes.sparkles([C.orange, C.cyan, C.yellow]), top: "58%", h: "7rem", w: "1.5rem", x: "3.3rem", drift: -50, fx: "float" },
          { s: shapes.brush(C.orange, C.yellow), bottom: "0", h: "12rem", w: "3rem", x: "0.4rem", drift: -20, fx: "draw" }
        ]
      },
      projects: {
        left: [
          { s: shapes.confetti(29, [C.lime, C.orange, C.violet, C.yellow], 170), top: "0", h: "11rem", w: "2.8rem", x: "0.6rem", drift: -40, fx: "float" },
          { s: shapes.helix(C.lime, C.violet), top: "20%", h: "58%", w: "1.5rem", x: "3.05rem", drift: 30 },
          { s: shapes.spiral(C.orange, C.lime), top: "44%", h: "2.4rem", w: "1.6rem", x: "0.3rem", drift: -60, fx: "draw spin" },
          { s: shapes.curl(C.magenta, 4), bottom: "0", h: "9rem", w: "2.6rem", x: "0.8rem", drift: -30, fx: "draw sway" }
        ],
        right: [
          { s: shapes.sparkles([C.yellow, C.violet, C.lime]), top: "0", h: "8rem", w: "2.4rem", x: "0.6rem", drift: -40, fx: "float" },
          { s: shapes.zigzag(C.orange), top: "18%", h: "30%", w: "1.4rem", x: "3.3rem", drift: 30 },
          { s: shapes.wave(C.magenta), top: "56%", h: "22%", w: "1.4rem", x: "3.3rem", drift: 20 },
          { s: shapes.spiral(C.cyan, C.orange), bottom: "1rem", h: "3.4rem", w: "3.4rem", x: "0.4rem", drift: -40, fx: "draw spin" }
        ]
      },
      resume: {
        left: [
          { s: shapes.sparkles([C.chalk, C.yellow, C.cyan]), top: "0", h: "8rem", w: "2.4rem", x: "0.8rem", drift: -40, fx: "float" },
          { s: shapes.dots(C.cobalt), top: "18%", h: "64%", w: "1.4rem", x: "3.1rem", drift: 30 },
          { s: shapes.curl(C.lime, 3), top: "38%", h: "6rem", w: "1.6rem", x: "0.3rem", drift: -60, fx: "draw sway" },
          { s: shapes.brush(C.yellow, C.orange), bottom: "0", h: "12rem", w: "3rem", x: "0.6rem", drift: -20, fx: "draw" }
        ],
        right: [
          { s: shapes.curl(C.magenta, 5), top: "0", h: "11rem", w: "2.8rem", x: "0.4rem", drift: -40, fx: "draw sway" },
          { s: shapes.helix(C.cyan, C.yellow), top: "22%", h: "26%", w: "1.5rem", x: "3.2rem", drift: 30 },
          { s: shapes.confetti(47, [C.orange, C.lime, C.chalk, C.magenta], 160), top: "58%", h: "10rem", w: "1.5rem", x: "3.3rem", drift: -50, fx: "float" },
          { s: shapes.spiral(C.yellow, C.magenta), bottom: "1rem", h: "3rem", w: "3rem", x: "0.4rem", drift: -30, fx: "draw spin" }
        ]
      }
    };
    var set = pages[pageName.toLowerCase()] || pages["about me"];

    var render = function (pieces, side) {
      return pieces.map(function (p, i) {
        var style = (p.top != null ? "top:" + p.top : "bottom:" + p.bottom) + ";height:" + p.h + ";width:" + p.w +
          ";" + side + ":" + p.x + ";--drift:" + p.drift + "px;animation-delay:" + (i * 0.35).toFixed(2) + "s";
        return '<svg class="rail-piece ' + (p.fx || "") + '" style="' + style + '" viewBox="' + p.s.vb +
          '" preserveAspectRatio="' + (p.s.fit === "none" ? "none" : "xMidYMid meet") + '">' + p.s.body + "</svg>";
      }).join("");
    };

    var railLeft = document.createElement("div");
    railLeft.className = "side-rail side-rail-left";
    railLeft.setAttribute("aria-hidden", "true");
    railLeft.innerHTML =
      '<span class="rail-ticks"></span>' +
      '<span class="rail-label">Jainam Shah &mdash; Engineer&rsquo;s Sketchbook</span>' +
      render(set.left, "left");

    var railRight = document.createElement("div");
    railRight.className = "side-rail side-rail-right";
    railRight.setAttribute("aria-hidden", "true");
    railRight.innerHTML =
      '<span class="rail-track"><span class="rail-marker"></span></span>' +
      '<span class="rail-label">' + pageName + "</span>" +
      render(set.right, "right");

    // A twisting two-faced ribbon: the half-width follows a cosine, so each sign
    // change is a twist where the other face of the streamer shows.
    var ribbonSvg = function (r) {
      var TAU = Math.PI * 2, step = 8, faces = [[], []], runs = [], run = null;
      for (var x = 0; x <= 1000; x += step) {
        var u = x / 1000;
        var cy = 100 + r.amp * Math.sin(TAU * r.waves * u + r.phase) + r.tilt * (u - 0.5);
        var half = r.width * Math.cos(TAU * r.twists * u + r.phase * 0.7);
        var face = half >= 0 ? 0 : 1;
        if (!run || run.face !== face) {
          if (run) run.pts.push([x, cy, half]);
          run = { face: face, pts: run ? [run.pts[run.pts.length - 1]] : [] };
          runs.push(run);
        }
        run.pts.push([x, cy, half]);
      }
      runs.forEach(function (rn) {
        var top = rn.pts.map(function (p) { return f(p[0]) + "," + f(p[1] - p[2]); });
        var bottom = rn.pts.slice().reverse().map(function (p) { return f(p[0]) + "," + f(p[1] + p[2]); });
        faces[rn.face].push("M" + top.join(" L") + " L" + bottom.join(" L") + "Z");
      });
      var spine = trace(function (x) {
        var u = x / 1000;
        return [x, 100 + r.amp * Math.sin(TAU * r.waves * u + r.phase) + r.tilt * (u - 0.5)];
      }, 0, 1000, step);
      return '<svg class="streamer from-' + r.from + '" style="top:' + r.top + ";--drift:" + r.drift + 'px" viewBox="0 0 1000 200" preserveAspectRatio="none">' +
        '<path d="' + faces[0].join(" ") + '" fill="' + r.front + '"/>' +
        '<path d="' + faces[1].join(" ") + '" fill="' + r.back + '"/>' +
        line(spine, r.spark, 1.5, flex + ' class="streamer-flow"') +
        "</svg>";
    };

    var crossings = {
      "about me": [
        { top: "8%", front: C.orange, back: C.yellow, spark: C.chalk, amp: 55, waves: 1.3, twists: 3.5, width: 16, phase: 0.4, tilt: 30, from: "left", drift: -140 },
        { top: "58%", front: C.cyan, back: C.cobalt, spark: C.yellow, amp: 45, waves: 1.7, twists: 4.5, width: 13, phase: 2.2, tilt: -40, from: "right", drift: 90 }
      ],
      experiences: [
        { top: "12%", front: C.cyan, back: C.cobalt, spark: C.chalk, amp: 50, waves: 1.5, twists: 4, width: 15, phase: 1.1, tilt: -30, from: "left", drift: -120 },
        { top: "62%", front: C.magenta, back: C.orange, spark: C.yellow, amp: 55, waves: 1.2, twists: 3.5, width: 14, phase: 3.0, tilt: 40, from: "right", drift: 100 }
      ],
      projects: [
        { top: "10%", front: C.lime, back: C.violet, spark: C.chalk, amp: 55, waves: 1.6, twists: 5, width: 14, phase: 0.2, tilt: 40, from: "right", drift: -130 },
        { top: "60%", front: C.magenta, back: C.yellow, spark: C.cyan, amp: 45, waves: 1.25, twists: 3.5, width: 16, phase: 2.6, tilt: -30, from: "left", drift: 90 }
      ],
      resume: [
        { top: "14%", front: C.magenta, back: C.violet, spark: C.chalk, amp: 50, waves: 1.4, twists: 4, width: 15, phase: 1.7, tilt: 30, from: "left", drift: -120 },
        { top: "60%", front: C.cyan, back: C.yellow, spark: C.magenta, amp: 50, waves: 1.6, twists: 4.5, width: 13, phase: 0.6, tilt: -40, from: "right", drift: 100 }
      ]
    };

    var streamers = document.createElement("div");
    streamers.className = "page-streamers";
    streamers.setAttribute("aria-hidden", "true");
    streamers.innerHTML = (crossings[pageName.toLowerCase()] || crossings["about me"]).map(ribbonSvg).join("");

    canvas.insertBefore(streamers, canvas.firstChild);
    canvas.appendChild(railLeft);
    canvas.appendChild(railRight);

    var railTick = false;
    var updateRail = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var progress = max > 0 ? window.scrollY / max : 0;
      var value = Math.max(0, Math.min(1, progress)).toFixed(4);
      railLeft.style.setProperty("--progress", value);
      railRight.style.setProperty("--progress", value);
      streamers.style.setProperty("--progress", value);
      railTick = false;
    };
    window.addEventListener("scroll", function () {
      if (railTick) return;
      railTick = true;
      window.requestAnimationFrame(updateRail);
    }, { passive: true });
    updateRail();
  }

  var chapters = document.querySelectorAll(".chapter, .project");
  // Chapters and projects are one visible-area apart, so fully fading by 45% of
  // that distance guarantees two of them are never on screen together.
  var FULL = 0.25;
  var GONE = 0.45;

  function updateChapters() {
    var vh = window.innerHeight;
    var navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
    var visible = Math.max(vh - navBottom, 1);
    var middle = navBottom + visible / 2;
    var closest = null;
    var closestDist = Infinity;

    chapters.forEach(function (chapter) {
      var rect = chapter.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      var dist = Math.abs(center - middle) / visible;
      var reveal = 1 - (dist - FULL) / (GONE - FULL);
      reveal = Math.max(0, Math.min(1, reveal));
      chapter.style.setProperty("--reveal", reveal.toFixed(3));

      if (dist < closestDist) {
        closestDist = dist;
        closest = chapter;
      }
    });

    chapters.forEach(function (chapter) {
      chapter.classList.toggle("is-active", chapter === closest);
    });
  }

  if (chapters.length && !reduce) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateChapters();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateChapters();
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
