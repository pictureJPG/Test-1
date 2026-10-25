// --- 1. VARIABEL AWAL ---
let warnaKuas = "rgb(255, 102, 46)"; 
let modeIsi = false; 
let modePelangi = false; 
let mouseDitekan = false;
let sedangMenggambar = false; 

// --- LOGIKA UNDO / REDO ---
const historyStack = []; 
let historyIndex = -1; 

function simpanStatusKanvas() {
    if (historyIndex < historyStack.length - 1) { 
        historyStack.splice(historyIndex + 1); 
    }
    const statusSaatIni = semuaPixel.map(p => p.style.backgroundColor || "rgb(255, 255, 255)");
    historyStack.push(statusSaatIni);
    historyIndex++; 
}

function muatStatusKanvas(status) { 
    semuaPixel.forEach((p, i) => {
        p.style.backgroundColor = status[i] || "rgb(255, 255, 255)";
    }); 
}

function undo() { 
    if (historyIndex > 0) {
        historyIndex--;
        muatStatusKanvas(historyStack[historyIndex]); 
    } 
}

function redo() { 
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        muatStatusKanvas(historyStack[historyIndex]); 
    } 
}

document.addEventListener('mousedown', () => mouseDitekan = true);
document.addEventListener('mouseup', () => { 
    mouseDitekan = false;  
    if (sedangMenggambar) {
        sedangMenggambar = false;
        simpanStatusKanvas();
    }
});

// Pintasan Keyboard (Ctrl+Z & Ctrl+Y / Ctrl+Shift+Z)
document.addEventListener('keydown', (e) => { 
    if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
            if (e.shiftKey) { redo(); } else { undo(); }
        } else if (e.key.toLowerCase() === 'y') {
            redo(); 
        }
    }
});

// --- 2. PEMBUATAN KANVAS ---
const canvas = document.querySelector('.canvas');
const totalKolom = 30;
const totalBaris = 15;
const semuaPixel = [];

// Fungsi untuk mendapatkan warna acak
function acakWarna() {
    const pilihanWarna = [
        "rgb(255, 102, 46)", "rgb(26, 218, 84)", "rgb(83, 15, 255)", 
        "rgb(255, 236, 26)", "rgb(142, 229, 255)", "rgb(156, 39, 176)", 
        "rgb(255, 152, 0)", "rgb(233, 30, 99)"
    ];
    return pilihanWarna[Math.floor(Math.random() * pilihanWarna.length)];
}

for (let i = 0; i < totalKolom * totalBaris; i++) {
    let pixel = document.createElement('div');
    pixel.classList.add('pixel');
    pixel.setAttribute('data-id', i);
    
    // Logika saat pixel diklik
    pixel.addEventListener('mousedown', function() {
        if (modePelangi) { warnaKuas = acakWarna(); }

        if (modeIsi) {
            let idDipilih = parseInt(pixel.getAttribute('data-id'));
            let barisAwal = Math.floor(idDipilih / totalKolom);
            let kolomAwal = idDipilih % totalKolom;

            let animasiSelesai = 0;

            semuaPixel.forEach((targetPixel, index) => {
                let barisTarget = Math.floor(index / totalKolom);
                let kolomTarget = index % totalKolom;
                let jarak = Math.abs(barisTarget - barisAwal) + Math.abs(kolomTarget - kolomAwal);
                
                let animasi = targetPixel.animate([ 
                    { backgroundColor: warnaKuas }
                ], {
                    duration: 300,
                    easing: 'ease-in-out',
                    delay: jarak * 30,
                    fill: 'forwards'
                });

                animasi.onfinish = function() {
                    targetPixel.style.backgroundColor = warnaKuas;
                    animasi.cancel();

                    animasiSelesai++;
                    if (animasiSelesai === semuaPixel.length) {
                        simpanStatusKanvas();
                    }
                };
            });
        } else {
            sedangMenggambar = true;
            pixel.style.backgroundColor = warnaKuas;
        }
    });

    // Logika saat pixel diseret (Drag)
    pixel.addEventListener('mouseenter', function() {
        if (mouseDitekan && !modeIsi) {
            sedangMenggambar = true;
            if (modePelangi) { warnaKuas = acakWarna(); }
            pixel.style.backgroundColor = warnaKuas;
        }
    });

    canvas.appendChild(pixel);
    semuaPixel.push(pixel);
}

// Simpan status awal (kanvas kosong)
simpanStatusKanvas(); 

// --- 3. LOGIKA PALET & ALAT ---
const daftarWarna = document.querySelectorAll('.color-cell');
const penghapus = document.getElementById('tool-eraser');
const catTumpah = document.getElementById('tool-fill');
const kuasPelangi = document.getElementById('tool-rainbow');
const semuaAlat = [...daftarWarna, penghapus, catTumpah, kuasPelangi];

function hapusSeleksi() {
    semuaAlat.forEach(alat => alat.classList.remove('selected'));
}

// Klik Warna Biasa
daftarWarna.forEach(warna => {
    warna.addEventListener('click', function() {
        hapusSeleksi();
        warna.classList.add('selected');
        warnaKuas = warna.style.backgroundColor;
        modeIsi = false;
        modePelangi = false; // Matikan pelangi!
    });
});

// Klik Penghapus
penghapus.addEventListener('click', function() {
    hapusSeleksi();
    penghapus.classList.add('selected');
    warnaKuas = "rgb(255, 255, 255)"; 
    modeIsi = false;
    modePelangi = false; // Matikan pelangi!
});

// Klik Cat Tumpah
catTumpah.addEventListener('click', function() {
    hapusSeleksi();
    catTumpah.classList.add('selected');
    modeIsi = true;
    modePelangi = false; // Matikan pelangi!
});

// Klik Kuas Pelangi
kuasPelangi.addEventListener('click', function() {
    hapusSeleksi();
    kuasPelangi.classList.add('selected');
    modeIsi = false;
    modePelangi = true; 
});

// Set default awal
daftarWarna[0].classList.add('selected');

// --- 4. FITUR AKSI ---

// A. Sembunyikan Garis
document.getElementById('btn-grid').addEventListener('click', function() {
    canvas.classList.toggle('hide-grid');
});

// B. Bersihkan Kanvas
document.getElementById('btn-clear').addEventListener('click', () => {
    if(confirm("Apakah Anda yakin ingin menghapus semua gambar?")) {
        semuaPixel.forEach(p => p.style.backgroundColor = "rgb(255, 255, 255)");
        simpanStatusKanvas();
    }
});

// Kamus Kompresi
const kamusKode = {
    "1": "rgb(255, 102, 46)", "2": "rgb(26, 218, 84)", "3": "rgb(83, 15, 255)",
    "4": "rgb(255, 236, 26)", "5": "rgb(142, 229, 255)", "6": "rgb(156, 39, 176)",
    "7": "rgb(255, 152, 0)", "8": "rgb(233, 30, 99)", "0": "rgb(255, 255, 255)"
};
function hapusSpasi(str) { return str.replace(/\s/g, ''); }

// C. Simpan ke Cookie
document.getElementById('btn-save').addEventListener('click', () => {
    let dataSimpan = "";
    semuaPixel.forEach(p => {
        let warna = p.style.backgroundColor || "rgb(255, 255, 255)";
        let warnaBersih = hapusSpasi(warna);
        let kode = "0"; 
        for(let k in kamusKode) {
            if (hapusSpasi(kamusKode[k]) === warnaBersih) { kode = k; break; }
        }
        dataSimpan += kode;
    });
    document.cookie = "gambarPixel=" + dataSimpan + "; max-age=604800; path=/";
    alert("Karya berhasil disimpan di Cookie peramban!");
});

// D. Muat dari Cookie
document.getElementById('btn-load').addEventListener('click', () => {
    let barisCookie = document.cookie.split(';');
    let cookieKita = barisCookie.find(c => c.trim().startsWith('gambarPixel='));
    
    if (cookieKita) {
        let dataSimpan = cookieKita.split('=')[1];
        semuaPixel.forEach((p, index) => {
            let kode = dataSimpan[index];
            if (kode && kamusKode[kode]) { p.style.backgroundColor = kamusKode[kode]; }
        });
        simpanStatusKanvas();
        alert("Gambar berhasil dimuat!");
    } else {
        alert("Tidak ada data gambar yang tersimpan.");
    }
});

// E. Unduh Gambar
document.getElementById('btn-download').addEventListener('click', () => {
    canvas.classList.add('hide-grid'); 
    
    domtoimage.toPng(document.querySelector('.canvas-container'))
        .then(function (urlGambar) {
            let link = document.createElement('a');
            link.download = 'karya-piksel-saya.png';
            link.href = urlGambar;
            link.click();
            canvas.classList.remove('hide-grid');
        })
        .catch(function (error) {
            alert("Terjadi kesalahan saat mengunduh.");
            canvas.classList.remove('hide-grid');
        });
});