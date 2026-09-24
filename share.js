(function () {
  // Günün sözünü, o anki temanın renkleriyle 1080×1080 PNG karta çizer.
  // Tamamen yerel: canvas → panoya kopyala veya indir. Hiçbir sunucuya gönderilmez.
  var SIZE = 1080;
  var PAD = 110;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function fonts() {
    return {
      serif: cssVar("--font-serif") || "Georgia, serif",
      sans: cssVar("--font-sans") || "sans-serif"
    };
  }

  function wrap(ctx, text, maxWidth) {
    var words = text.split(/\s+/);
    var lines = [];
    var line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawEmblem(ctx, cx, cy, r, gold, goldLight) {
    ctx.save();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    for (var a = 0; a < 360; a += 25) {
      var rad = (a + 10) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * r * 0.5, cy + Math.sin(rad) * r * 0.5);
      ctx.lineTo(cx + Math.cos(rad) * r * 0.92, cy + Math.sin(rad) * r * 0.92);
      ctx.stroke();
    }
    ctx.fillStyle = goldLight;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function render(quote, source) {
    var c = {
      bg: cssVar("--bg"),
      glow: cssVar("--bg-glow"),
      gold: cssVar("--gold"),
      goldLight: cssVar("--gold-light"),
      text: cssVar("--text"),
      dim: cssVar("--text-dim"),
      border: cssVar("--border")
    };
    var f = fonts();

    var canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    var ctx = canvas.getContext("2d");

    // Arka plan: düz renk + üstten yayılan ışıma
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, SIZE, SIZE);
    var g = ctx.createRadialGradient(SIZE / 2, SIZE * 0.18, 0, SIZE / 2, SIZE * 0.18, SIZE * 0.85);
    g.addColorStop(0, c.glow);
    g.addColorStop(1, c.bg);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Çerçeve
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(40, 40, SIZE - 80, SIZE - 80, 36);
    ctx.stroke();

    drawEmblem(ctx, SIZE / 2, 150, 34, c.gold, c.goldLight);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // Üst başlık
    ctx.fillStyle = c.goldLight;
    ctx.font = "500 22px " + f.sans;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
    ctx.fillText("GÜNÜN KADİM SÖZÜ", SIZE / 2, 238);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

    // Söz: sığana kadar yazı boyutunu küçült
    var maxW = SIZE - PAD * 2;
    var areaTop = 360;
    var areaBottom = SIZE - 250;
    var size = 62;
    var lines, lh;
    do {
      ctx.font = "italic 400 " + size + "px " + f.serif;
      lines = wrap(ctx, quote, maxW);
      lh = size * 1.45;
      size -= 2;
    } while (lines.length * lh > areaBottom - areaTop && size > 28);

    var blockH = lines.length * lh;
    var y = areaTop + (areaBottom - areaTop - blockH) / 2 + lh * 0.75;

    // Soluk açılış tırnağı
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = c.gold;
    ctx.font = "140px " + f.serif;
    ctx.fillText("“", SIZE / 2, Math.max(y - lh * 0.75 - 10, 370)); // başlığa binmesin
    ctx.restore();

    ctx.fillStyle = c.text;
    ctx.font = "italic 400 " + (size + 2) + "px " + f.serif;
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], SIZE / 2, y + i * lh);
    }

    // Kaynak
    ctx.fillStyle = c.dim;
    ctx.font = "400 26px " + f.sans;
    ctx.fillText(source, SIZE / 2, areaBottom + 70);

    // Alt imza
    ctx.fillStyle = c.gold;
    ctx.font = "600 24px " + f.sans;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
    ctx.fillText("zeyneleroglu.com", SIZE / 2, SIZE - 90);

    return canvas;
  }

  function toBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (b) { b ? resolve(b) : reject(new Error("PNG üretilemedi")); }, "image/png");
    });
  }

  function fileName() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    return "kadim-soz-" + d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + ".png";
  }

  function download(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var copyBtn = document.getElementById("share-copy");
    var dlBtn = document.getElementById("share-download");
    var status = document.getElementById("share-status");
    if (!copyBtn || !dlBtn) return;

    var timer;
    function say(msg) {
      status.textContent = msg;
      status.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(function () { status.classList.remove("show"); }, 2200);
    }

    function card() {
      return render(
        document.getElementById("quote").textContent,
        document.getElementById("kaynak").textContent
      );
    }

    copyBtn.addEventListener("click", function () {
      var blobPromise = toBlob(card());
      if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
        blobPromise.then(download).then(function () { say("Pano desteklenmiyor, görsel indirildi"); });
        return;
      }
      // Promise doğrudan ClipboardItem'a verilir: kullanıcı etkileşimi korunur (Chrome)
      navigator.clipboard.write([new ClipboardItem({ "image/png": blobPromise })])
        .then(function () { say("Kart panoya kopyalandı"); })
        .catch(function () {
          blobPromise.then(download).then(function () { say("Kopyalanamadı, görsel indirildi"); });
        });
    });

    dlBtn.addEventListener("click", function () {
      toBlob(card()).then(download).then(function () { say("Kart indirildi"); })
        .catch(function () { say("Görsel oluşturulamadı"); });
    });
  });
})();
