(function () {
  // Tema tercihi yalnızca bu tarayıcıda (localStorage) tutulur; hiçbir yere gönderilmez.
  // <head> içinde senkron yüklenir ki sayfa yanlış temada parlamasın.
  var KEY = "kadim-soz-tema";
  var root = document.documentElement;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function write(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* depolama kapalıysa sessizce geç */ }
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function current() {
    return root.getAttribute("data-theme") || systemTheme();
  }

  var saved = read();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;

    function sync() {
      var isDark = current() === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "Açık temaya geç" : "Koyu temaya geç");
      btn.title = btn.getAttribute("aria-label");
    }

    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.classList.add("theme-anim");
      root.setAttribute("data-theme", next);
      write(next);
      sync();
      window.setTimeout(function () { root.classList.remove("theme-anim"); }, 500);
    });

    sync();
  });
})();
