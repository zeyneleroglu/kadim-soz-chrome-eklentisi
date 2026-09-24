(function () {
  // Favoriler yalnızca bu tarayıcıda (localStorage) tutulur; hiçbir yere gönderilmez.
  // Söz metni anahtar olarak kullanılır: data.js sırası değişse de favoriler bozulmaz.
  var KEY = "kadim-soz-favoriler";

  function load() {
    try {
      var list = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* depolama kapalıysa sessizce geç */ }
  }

  function indexOf(list, text) {
    for (var i = 0; i < list.length; i++) if (list[i].text === text) return i;
    return -1;
  }

  function formatDate(ts) {
    try {
      return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var favBtn = document.getElementById("fav-toggle");
    var favLabel = favBtn.querySelector("span");
    var countEl = document.getElementById("fav-count");
    var listEl = document.getElementById("fav-list");
    var emptyEl = document.getElementById("fav-empty");
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs [role=tab]"));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var favTab = document.getElementById("tab-favs");

    function renderButton(list) {
      var today = window.KADIM_AKTIF;
      var on = !!today && indexOf(list, today.text) !== -1;
      favBtn.setAttribute("aria-pressed", String(on));
      favLabel.textContent = on ? "Favorilerde" : "Favorilere ekle";
      favBtn.title = on ? "Favorilerden çıkar" : "Bu sözü favorilere ekle";
    }

    function renderList(list) {
      countEl.textContent = list.length;
      countEl.hidden = list.length === 0;
      emptyEl.hidden = list.length > 0;
      listEl.textContent = "";

      // En son eklenen en üstte
      list.slice().reverse().forEach(function (item) {
        var li = document.createElement("li");
        li.className = "fav-item";

        var q = document.createElement("blockquote");
        q.className = "fav-quote";
        q.textContent = item.text;

        var meta = document.createElement("div");
        meta.className = "fav-meta";
        var src = document.createElement("span");
        src.textContent = "— " + item.kaynak;
        var date = document.createElement("time");
        date.dateTime = new Date(item.eklenme).toISOString();
        date.textContent = formatDate(item.eklenme);
        meta.appendChild(src);
        meta.appendChild(date);

        var del = document.createElement("button");
        del.type = "button";
        del.className = "fav-remove";
        del.setAttribute("aria-label", "Favorilerden çıkar");
        del.title = "Favorilerden çıkar";
        del.dataset.text = item.text;
        del.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

        li.appendChild(q);
        li.appendChild(meta);
        li.appendChild(del);
        listEl.appendChild(li);
      });
    }

    function render() {
      var list = load();
      renderButton(list);
      renderList(list);
    }

    favBtn.addEventListener("click", function () {
      var today = window.KADIM_AKTIF;
      if (!today) return;
      var list = load();
      var i = indexOf(list, today.text);
      if (i === -1) {
        list.push({ text: today.text, kaynak: today.kaynak, eklenme: Date.now() });
        favBtn.classList.remove("pop");
        void favBtn.offsetWidth; // animasyonu yeniden tetikle
        favBtn.classList.add("pop");
      } else {
        list.splice(i, 1);
      }
      save(list);
      render();
    });

    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".fav-remove");
      if (!btn) return;
      var li = btn.closest(".fav-item");
      var text = btn.dataset.text;
      li.classList.add("leaving");
      setTimeout(function () {
        var list = load();
        var i = indexOf(list, text);
        if (i !== -1) { list.splice(i, 1); save(list); }
        render();
        favTab.focus();
      }, 250);
    });

    function select(idx, focus) {
      tabs.forEach(function (t, i) {
        var on = i === idx;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        panels[i].classList.add("switched");
      });
      if (focus) tabs[idx].focus();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i, false); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          var step = e.key === "ArrowRight" ? 1 : -1;
          select((i + step + tabs.length) % tabs.length, true);
        }
      });
    });

    // Önceki/sonraki gezintisinde kalp düğmesi gösterilen söze göre güncellenir
    document.addEventListener("kadim:degisti", function () { renderButton(load()); });

    // Başka bir açık sekmede favori değişirse bu sayfayı da güncelle
    window.addEventListener("storage", function (e) {
      if (e.key === KEY) render();
    });

    render();
  });
})();
