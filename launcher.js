(function () {
  // Sağ üstteki Google uygulamaları menüsü. Simgeler yerel SVG'dir; hiçbir dış kaynak yüklenmez.
  var APPS = [
    { ad: "Arama", url: "https://www.google.com/", renk: "#4285f4",
      svg: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>' },
    { ad: "Haritalar", url: "https://maps.google.com/", renk: "#34a853",
      svg: '<path d="M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>' },
    { ad: "YouTube", url: "https://www.youtube.com/", renk: "#ea4335",
      svg: '<rect x="3" y="5.5" width="18" height="13" rx="3.5"/><path d="M10.5 9.5l4 2.5-4 2.5z"/>' },
    { ad: "Gmail", url: "https://mail.google.com/mail/", renk: "#ea4335",
      svg: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>' },
    { ad: "Drive", url: "https://drive.google.com/", renk: "#fbbc05",
      svg: '<path d="M9 4h6l6 10.5-3 5H6l-3-5z"/><path d="M3 14.5h18M9 4l6 10.5M15 4L9 14.5"/>' },
    { ad: "Takvim", url: "https://calendar.google.com/", renk: "#4285f4",
      svg: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>' },
    { ad: "Çeviri", url: "https://translate.google.com/", renk: "#4285f4",
      svg: '<path d="M3.5 6h9M8 4v2M5.5 6c.8 3 2.7 5 5.5 6.2M10.5 6c-.8 3.2-2.8 5.8-6 7.5M12.5 20l4-9 4 9M13.8 17h5.4"/>' },
    { ad: "Fotoğraflar", url: "https://photos.google.com/", renk: "#fbbc05",
      svg: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 16l5-5 4 4 3-3 5 5"/><circle cx="15.5" cy="9" r="1.5"/>' },
    { ad: "Haberler", url: "https://news.google.com/", renk: "#34a853",
      svg: '<path d="M4 5h12v14H6a2 2 0 0 1-2-2z"/><path d="M16 8h4v9a2 2 0 0 1-4 0M7 9h6M7 12h6M7 15h4"/>' }
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("apps-toggle");
    var panel = document.getElementById("apps-panel");
    var list = document.getElementById("apps-list");

    APPS.forEach(function (app) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "app";
      a.href = app.url;
      a.innerHTML = '<span class="app-icon" style="color:' + app.renk + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + app.svg + "</svg></span>";
      var label = document.createElement("span");
      label.className = "app-name";
      label.textContent = app.ad;
      a.appendChild(label);
      li.appendChild(a);
      list.appendChild(li);
    });

    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (open) panel.querySelector(".app").focus();
      else if (returnFocus) btn.focus();
    }

    btn.addEventListener("click", function () { setOpen(panel.hidden, false); });

    // Menü dışına tıklanınca veya Esc ile kapanır
    document.addEventListener("click", function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) setOpen(false, false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { e.preventDefault(); setOpen(false, true); }
    });
  });
})();
