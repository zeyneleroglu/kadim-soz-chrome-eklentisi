(function () {
  // Söz veritabanında anlık arama. Tamamen yerel; hiçbir sorgu kaydedilmez/gönderilmez.
  // Türkçe duyarsız eşleşme: büyük/küçük harf ve ç/ğ/ı/ö/ş/ü → c/g/i/o/s/u ("gucu" → "gücü").
  var FOLD = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" };

  // Karakter karakter katlanır: çıktı uzunluğu girdiyle aynı kalır,
  // böylece katlanmış metindeki eşleşme konumu orijinal metinde de geçerlidir.
  function fold(str) {
    var out = "";
    for (var i = 0; i < str.length; i++) {
      var c = str[i].toLocaleLowerCase("tr-TR").charAt(0);
      out += FOLD[c] || c;
    }
    return out;
  }

  function tokens(query) {
    return fold(query).split(/\s+/).filter(Boolean);
  }

  // Yalnızca kelime başında eşleşir: "kader" → "kaderin" bulunur, "önsöz" → "Sonsöz" bulunmaz.
  function starts(folded, t) {
    var out = [];
    var at = folded.indexOf(t);
    while (at !== -1) {
      if (at === 0 || !/[a-z0-9]/.test(folded.charAt(at - 1))) out.push(at);
      at = folded.indexOf(t, at + 1);
    }
    return out;
  }

  // Tüm kelimeler eşleşen alanlarda vurgulanır; çakışan aralıklar birleştirilir
  function ranges(foldedText, toks) {
    var r = [];
    toks.forEach(function (t) {
      starts(foldedText, t).forEach(function (at) { r.push([at, at + t.length]); });
    });
    r.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    r.forEach(function (x) {
      var last = merged[merged.length - 1];
      if (last && x[0] <= last[1]) last[1] = Math.max(last[1], x[1]);
      else merged.push(x.slice());
    });
    return merged;
  }

  function highlight(el, text, foldedText, toks) {
    el.textContent = "";
    var pos = 0;
    ranges(foldedText, toks).forEach(function (r) {
      if (r[0] > pos) el.appendChild(document.createTextNode(text.slice(pos, r[0])));
      var m = document.createElement("mark");
      m.textContent = text.slice(r[0], r[1]);
      el.appendChild(m);
      pos = r[1];
    });
    if (pos < text.length) el.appendChild(document.createTextNode(text.slice(pos)));
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("qsearch-input");
    var listEl = document.getElementById("qsearch-list");
    var info = document.getElementById("qsearch-info");
    var tab = document.getElementById("tab-search");
    var todayTab = document.getElementById("tab-today");
    var panel = document.getElementById("panel-search");

    // Arama dizini bir kez hazırlanır. "yazar" alanı data.js'de varsa o da aranır.
    var index = KADIM_SOZLER.map(function (item, i) {
      var yazar = item.yazar || "";
      return {
        i: i,
        item: item,
        fText: fold(item.text),
        fKaynak: fold(item.kaynak),
        fYazar: fold(yazar),
        all: fold(item.text + " " + item.kaynak + " " + yazar)
      };
    });

    function run() {
      var toks = tokens(input.value);
      var hits = toks.length
        ? index.filter(function (e) { return toks.every(function (t) { return starts(e.all, t).length > 0; }); })
        : index;

      info.textContent = toks.length
        ? (hits.length ? hits.length + " söz bulundu" : "Eşleşen söz yok. Farklı bir kelime deneyin.")
        : "Toplam " + index.length + " söz";

      listEl.textContent = "";
      hits.forEach(function (e) {
        var li = document.createElement("li");
        li.className = "fav-item qsearch-item";

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "qsearch-hit";
        btn.dataset.i = e.i;
        btn.title = "Bu sözü göster";

        var q = document.createElement("span");
        q.className = "fav-quote";
        highlight(q, e.item.text, e.fText, toks);

        var meta = document.createElement("span");
        meta.className = "fav-meta";
        var src = document.createElement("span");
        highlight(src, e.item.kaynak, e.fKaynak, toks);
        src.insertBefore(document.createTextNode("— "), src.firstChild);
        if (e.item.yazar) {
          var y = document.createElement("span");
          highlight(y, e.item.yazar, e.fYazar, toks);
          src.appendChild(document.createTextNode(" · "));
          src.appendChild(y);
        }
        var no = document.createElement("span");
        no.className = "qsearch-no";
        no.textContent = "#" + (e.i + 1);
        meta.appendChild(src);
        meta.appendChild(no);

        btn.appendChild(q);
        btn.appendChild(meta);
        li.appendChild(btn);
        listEl.appendChild(li);
      });
    }

    function open(i) {
      window.KadimSoz.goTo(i);
      todayTab.click();
      todayTab.focus();
    }

    input.addEventListener("input", run);

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = listEl.querySelector(".qsearch-hit");
        if (first) open(+first.dataset.i);
      } else if (e.key === "Escape") {
        if (input.value) { input.value = ""; run(); }
        else { todayTab.click(); todayTab.focus(); }
      } else if (e.key === "ArrowDown") {
        var hit = listEl.querySelector(".qsearch-hit");
        if (hit) { e.preventDefault(); hit.focus(); }
      }
    });

    listEl.addEventListener("click", function (e) {
      var hit = e.target.closest(".qsearch-hit");
      if (hit) open(+hit.dataset.i);
    });

    // Sonuçlar arasında ↑ / ↓ ile gezinme
    listEl.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      var hits = Array.prototype.slice.call(listEl.querySelectorAll(".qsearch-hit"));
      var at = hits.indexOf(document.activeElement);
      if (at === -1) return;
      e.preventDefault();
      if (e.key === "ArrowUp" && at === 0) input.focus();
      else (hits[at + (e.key === "ArrowDown" ? 1 : -1)] || hits[at]).focus();
    });

    tab.addEventListener("click", function () {
      setTimeout(function () { input.focus(); input.select(); }, 0);
    });

    // "/" kısayolu: yazı alanında değilken arama sekmesini açar
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t.closest && t.closest("input, textarea") || t.isContentEditable) return;
      e.preventDefault();
      if (panel.hidden) tab.click();
      else input.focus();
    });

    run();
  });
})();
