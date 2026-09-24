(function () {
  // Güne göre deterministik seçim: aynı gün içinde herkes/her sekme aynı sözü görür,
  // gün değişince rotasyon ilerler. Önceki/sonraki gezintisi yalnızca bu sayfada geçerlidir,
  // hiçbir veri saklanmaz/gönderilmez.
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var dayOfYear = Math.floor(diff / 86400000);

  var total = KADIM_SOZLER.length;
  var todayIndex = dayOfYear % total;
  var index = todayIndex;

  var quoteEl = document.getElementById("quote");
  var kaynakEl = document.getElementById("kaynak");
  var yazarEl = document.getElementById("yazar");
  var eyebrowEl = document.getElementById("today-eyebrow");
  var prevBtn = document.getElementById("quote-prev");
  var nextBtn = document.getElementById("quote-next");
  var homeBtn = document.getElementById("quote-home");
  var posEl = document.getElementById("quote-pos");
  var card = quoteEl.closest(".card");
  var swapTimer;

  function paint() {
    var item = KADIM_SOZLER[index];
    var isToday = index === todayIndex;
    window.KADIM_AKTIF = item;

    quoteEl.textContent = item.text;
    yazarEl.textContent = item.yazar ? "— " + item.yazar : "";
    yazarEl.hidden = !item.yazar;
    kaynakEl.textContent = item.yazar ? item.kaynak : "— " + item.kaynak;
    eyebrowEl.textContent = isToday ? "Günün Kadim Sözü" : "Kadim Söz";
    posEl.textContent = (index + 1) + " / " + total;
    homeBtn.hidden = isToday;

    document.dispatchEvent(new CustomEvent("kadim:degisti", { detail: item }));
  }

  function go(step) {
    index = (index + step + total) % total;
    card.dataset.dir = step < 0 ? "prev" : "next";
    card.classList.add("swapping");
    clearTimeout(swapTimer);
    swapTimer = setTimeout(function () {
      paint();
      card.classList.remove("swapping");
    }, 180);
  }

  // Arama sonuçlarından doğrudan bir söze gitmek için
  window.KadimSoz = {
    goTo: function (target) {
      var step = target - index;
      if (step) go(step);
    }
  };

  prevBtn.addEventListener("click", function () { go(-1); });
  nextBtn.addEventListener("click", function () { go(1); });
  homeBtn.addEventListener("click", function () { window.KadimSoz.goTo(todayIndex); });

  // Klavye: ← / → (yazı alanında veya sekme listesindeyken devre dışı)
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var t = e.target;
    if (t.closest && (t.closest("input, textarea, [role=tablist]") || t.isContentEditable)) return;
    if (document.getElementById("panel-today").hidden) return;
    e.preventDefault();
    go(e.key === "ArrowLeft" ? -1 : 1);
  });

  paint();
})();
