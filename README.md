# Günün Kadim Sözü

Chrome/Edge/Firefox için ücretsiz, açık kaynaklı bir "yeni sekme" (new tab) eklentisi.
Her yeni sekmede, [*Türkiye'de Medyum Olmak*](https://zeyneleroglu.com/medyum-olmak/turkiyede-medyum-olmak/)
kitabından ve kadim kültürel geleneklerden derlenen kısa, bilgilendirici bir söz gösterir.

🔒 **Hiçbir kişisel veri toplamaz.** Uzak kod / sunucu bağlantısı yoktur — tüm içerik pakette yerel olarak bulunur.

## Ekran Görüntüsü

`newtab.html` dosyasını herhangi bir tarayıcıda açarak önizleyebilirsiniz.

## Kurulum (geliştirici modu)

1. `chrome://extensions/` (veya Edge için `edge://extensions/`) adresini açın.
2. "Geliştirici modu"nu etkinleştirin.
3. "Paketlenmemiş öğe yükle" ile bu klasörü seçin.

## Yapı

- `manifest.json` — Manifest V3 eklenti tanımı
- `newtab.html`, `style.css`, `script.js` — yeni sekme arayüzü (günün sözü, önceki/sonraki gezintisi: butonlar veya ← / →)
- `theme.js` — koyu/açık tema geçişi (tercih yalnızca yerel `localStorage`'da tutulur)
- `share.js` — günün sözünü 1080×1080 PNG kart olarak panoya kopyalama / indirme (tamamen yerel, canvas ile)
- `search.js` — "Ara" sekmesi; söz metni ve kaynakta anlık, Türkçe karakter duyarsız arama (`/` kısayolu)
- `favorites.js` — "Favorilerim" sekmesi; favoriler yalnızca yerel `localStorage`'da tutulur
- `data.js` — kitaptan ve kadim kültürel kaynaklardan derlenen söz listesi (her kayıt: `text`, `kaynak`, `yazar`)
- `icons/` — eklenti simgeleri

## İçerik ve Kaynak

Sözler, Zeynel Eroğlu'nun *Türkiye'de Medyum Olmak* adlı kitabından ve kültürel/tarihsel
kaynaklardan derlenmiştir. İçerikler tamamen bilgilendirme amaçlıdır; herhangi bir kesin
sonuç, garanti veya hizmet vaadi içermez.

Yazar ve kitap hakkında daha fazla bilgi: **[zeyneleroglu.com](https://zeyneleroglu.com/)**

## Lisans

Eklenti kodu MIT lisansı ile paylaşılmıştır. `data.js` içindeki metinler
*Türkiye'de Medyum Olmak* kitabına aittir, tüm hakları saklıdır.
