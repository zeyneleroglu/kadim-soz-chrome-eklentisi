(function () {
  // Web sitesi kısayolları. Liste yalnızca bu tarayıcıda (localStorage) tutulur; hiçbir yere gönderilmez.
  // Site simgeleri Chrome'un yerel favicon önbelleğinden gelir ("favicon" izni); dış servis kullanılmaz.
  var KEY = "kadim-soz-kisayollar";
  var MAX = 12;
  var DEFAULTS = [
    { ad: "zeyneleroglu.com", url: "https://zeyneleroglu.com/" },
    { ad: "Gmail", url: "https://mail.google.com/mail/" },
    { ad: "Çeviri", url: "https://translate.google.com/" },
    { ad: "YouTube", url: "https://www.youtube.com/" }
  ];

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw === null) return DEFAULTS.slice(); // ilk açılış
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list.filter(function (x) { return x && x.ad && x.url; }) : DEFAULTS.slice();
    } catch (e) {
      return DEFAULTS.slice();
    }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* depolama kapalıysa sessizce geç */ }
  }

  // "ornek.com" → "https://ornek.com/"; yalnızca http/https kabul edilir
  function normalize(input) {
    var v = input.trim();
    if (!v) return null;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = "https://" + v;
    try {
      var u = new URL(v);
      if ((u.protocol !== "http:" && u.protocol !== "https:") || !u.hostname.includes(".")) return null;
      return u.href;
    } catch (e) {
      return null;
    }
  }

  function faviconUrl(url) {
    if (window.chrome && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL("/_favicon/") + "?pageUrl=" + encodeURIComponent(url) + "&size=32";
    }
    return null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var listEl = document.getElementById("shortcut-list");
    var dialog = document.getElementById("shortcut-dialog");
    var form = document.getElementById("shortcut-form");
    var title = document.getElementById("sc-title");
    var nameIn = document.getElementById("sc-name");
    var urlIn = document.getElementById("sc-url");
    var errEl = document.getElementById("sc-error");
    var removeBtn = document.getElementById("sc-remove");
    var cancelBtn = document.getElementById("sc-cancel");
    var editing = -1; // -1: yeni kısayol
    var opener = null;

    function icon(item) {
      var span = document.createElement("span");
      span.className = "sc-icon";
      var letter = document.createElement("span");
      letter.className = "sc-letter";
      letter.textContent = item.ad.trim().charAt(0).toLocaleUpperCase("tr-TR");
      var src = faviconUrl(item.url);
      if (src) {
        var img = document.createElement("img");
        img.alt = "";
        img.width = 24;
        img.height = 24;
        img.src = src;
        img.addEventListener("error", function () { img.replaceWith(letter); });
        span.appendChild(img);
      } else {
        span.appendChild(letter);
      }
      return span;
    }

    function render() {
      var list = load();
      listEl.textContent = "";
      list.forEach(function (item, i) {
        var li = document.createElement("li");
        li.className = "sc-item";

        var a = document.createElement("a");
        a.className = "sc-link";
        a.href = item.url;
        a.title = item.ad + "\n" + item.url;
        a.appendChild(icon(item));
        var name = document.createElement("span");
        name.className = "sc-name";
        name.textContent = item.ad;
        a.appendChild(name);

        var edit = document.createElement("button");
        edit.type = "button";
        edit.className = "sc-edit";
        edit.dataset.i = i;
        edit.setAttribute("aria-label", item.ad + " kısayolunu düzenle");
        edit.title = "Düzenle";
        edit.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';

        li.appendChild(a);
        li.appendChild(edit);
        listEl.appendChild(li);
      });

      if (list.length < MAX) {
        var li = document.createElement("li");
        li.className = "sc-item";
        var add = document.createElement("button");
        add.type = "button";
        add.className = "sc-link sc-add";
        add.innerHTML = '<span class="sc-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span><span class="sc-name">Kısayol ekle</span>';
        li.appendChild(add);
        listEl.appendChild(li);
      }
    }

    function open(i, from) {
      var list = load();
      editing = i;
      opener = from;
      errEl.textContent = "";
      title.textContent = i === -1 ? "Kısayol ekle" : "Kısayolu düzenle";
      nameIn.value = i === -1 ? "" : list[i].ad;
      urlIn.value = i === -1 ? "" : list[i].url;
      removeBtn.hidden = i === -1;
      dialog.showModal();
      (i === -1 ? nameIn : urlIn).focus();
    }

    function close() {
      dialog.close();
    }

    dialog.addEventListener("close", function () {
      if (opener && document.contains(opener)) opener.focus();
    });

    listEl.addEventListener("click", function (e) {
      var edit = e.target.closest(".sc-edit");
      if (edit) { open(+edit.dataset.i, edit); return; }
      var add = e.target.closest(".sc-add");
      if (add) open(-1, add);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var url = normalize(urlIn.value);
      var ad = nameIn.value.trim();
      if (!url) {
        errEl.textContent = "Geçerli bir web adresi girin (ör. ornek.com).";
        urlIn.focus();
        return;
      }
      if (!ad) ad = new URL(url).hostname.replace(/^www\./, "");
      var list = load();
      if (editing === -1) {
        if (list.length >= MAX) { errEl.textContent = "En fazla " + MAX + " kısayol eklenebilir."; return; }
        list.push({ ad: ad, url: url });
      } else {
        list[editing] = { ad: ad, url: url };
      }
      save(list);
      render();
      close();
    });

    removeBtn.addEventListener("click", function () {
      var list = load();
      list.splice(editing, 1);
      save(list);
      opener = null;
      render();
      close();
      var addBtn = listEl.querySelector(".sc-add");
      if (addBtn) addBtn.focus();
    });

    cancelBtn.addEventListener("click", close);

    // Diyalog dışına (arka plana) tıklanınca kapanır
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) close();
    });

    // Başka bir açık sekmede liste değişirse bu sayfayı da güncelle
    window.addEventListener("storage", function (e) {
      if (e.key === KEY) render();
    });

    render();
  });
})();
