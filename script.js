(function () {
  // Güne göre deterministik seçim: aynı gün içinde herkes/her sekme aynı sözü görür,
  // gün değişince rotasyon ilerler. Hiçbir veri saklanmaz/gönderilmez.
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var dayOfYear = Math.floor(diff / 86400000);

  var item = KADIM_SOZLER[dayOfYear % KADIM_SOZLER.length];
  window.KADIM_BUGUN = item;

  document.getElementById("quote").textContent = item.text;
  document.getElementById("kaynak").textContent = "— " + item.kaynak;
})();
