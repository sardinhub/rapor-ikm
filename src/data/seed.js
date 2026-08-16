// ============================================================
// Data awal (seed) aplikasi Rapor IKM
// Struktur & istilah mengikuti:
//  - Permendikbudristek No. 12 Tahun 2024 (Kurikulum Merdeka)
//  - Permendikdasmen No. 10 Tahun 2025 (SKL / 8 dimensi Profil Lulusan)
//  - Permendikdasmen No. 13 Tahun 2025 (pembelajaran mendalam,
//    Koding & AI mapel pilihan, kokurikuler fleksibel, kepanduan wajib)
// ============================================================

const MAPEL_TEMPLATE = [
  {
    kode: 'PAI',
    nama: 'Pendidikan Agama Islam dan Budi Pekerti',
    tp: [
      'Membaca dan memahami Q.S. al-Mujadilah/58: 11 dan Q.S. ar-Rahman/55: 33 tentang menuntut ilmu',
      'Menerapkan perilaku jujur, amanah, dan istiqamah dalam kehidupan sehari-hari',
      'Memahami makna asmaul husna al-Khabir, al-Basir, dan as-Sami\'',
    ],
  },
  {
    kode: 'PPKn',
    nama: 'Pendidikan Pancasila dan Kewarganegaraan',
    tp: [
      'Menganalisis norma dan aturan dalam kehidupan bermasyarakat',
      'Menerapkan nilai-nilai Pancasila dalam kehidupan sehari-hari',
      'Menunjukkan perilaku sesuai norma hukum dan keadilan',
    ],
  },
  {
    kode: 'B.INDO',
    nama: 'Bahasa Indonesia',
    tp: [
      'Menyimak dan memahami teks deskripsi serta menyajikannya kembali',
      'Menulis teks naratif dengan struktur yang tepat',
      'Membaca dan mengapresiasi teks sastra sederhana',
    ],
  },
  {
    kode: 'MTK',
    nama: 'Matematika',
    tp: [
      'Menyelesaikan masalah bilangan bulat dan pecahan dalam kehidupan sehari-hari',
      'Menggunakan bentuk aljabar untuk menyelesaikan masalah',
      'Menerapkan konsep perbandingan dan skala',
      'Menganalisis data dalam bentuk tabel dan diagram',
    ],
  },
  {
    kode: 'IPA',
    nama: 'Ilmu Pengetahuan Alam',
    tp: [
      'Mengidentifikasi besaran dan pengukuran dalam kehidupan sehari-hari',
      'Menganalisis klasifikasi makhluk hidup',
      'Menerapkan konsep zat dan perubahannya',
    ],
  },
  {
    kode: 'IPS',
    nama: 'Ilmu Pengetahuan Sosial',
    tp: [
      'Menganalisis interaksi sosial dan lembaga sosial',
      'Memahami kegiatan ekonomi dan pelaku ekonomi',
      'Menganalisis potensi sumber daya alam Indonesia',
    ],
  },
  {
    kode: 'B.ING',
    nama: 'Bahasa Inggris',
    tp: [
      'Mengidentifikasi teks deskriptif sederhana (describing people, animals, things)',
      'Memproduksi teks interaksi transaksional sederhana (giving opinion, asking for information)',
      'Memahami teks prosedur sederhana',
    ],
  },
  {
    kode: 'PJOK',
    nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
    tp: [
      'Mempraktikkan keterampilan gerak permainan bola besar',
      'Mempraktikkan aktivitas kebugaran jasmani',
      'Menerapkan pola hidup bersih dan sehat',
    ],
  },
  {
    kode: 'INF',
    nama: 'Informatika',
    tp: [
      'Memahami konsep berpikir komputasional',
      'Menggunakan perangkat lunak pengolah kata dan presentasi',
      'Memahami dasar-dasar jaringan komputer dan internet',
    ],
  },
  {
    kode: 'SENI',
    nama: 'Seni dan Prakarya',
    tp: [
      'Mengapresiasi karya seni rupa/musik daerah',
      'Membuat karya seni sederhana dengan teknik dasar',
      'Menghasilkan produk prakarya sederhana dari bahan sekitar',
    ],
  },
  {
    kode: 'KODAI',
    nama: 'Koding dan Kecerdasan Artifisial',
    pilihan: true,
    keterangan: 'Mapel pilihan mulai kelas 5, 7, dan 10 (Permendikdasmen No. 13 Tahun 2025)',
    tp: [
      'Memahami konsep dasar algoritma dan logika pemrograman',
      'Membuat program sederhana menggunakan bahasa blok (block-based)',
      'Mengenal konsep dasar kecerdasan artifisial dan etika penggunaannya',
    ],
  },
]

export const DIMENSI = [
  {
    id: 'd1',
    nama: 'Keimanan dan Ketakwaan terhadap Tuhan Yang Maha Esa',
    default: 'Peserta didik menunjukkan keyakinan dan mengamalkan ajaran agama/kepercayaan yang dianut, berakhlak mulia, serta menjaga hubungan dengan Tuhan Yang Maha Esa, sesama manusia, dan lingkungan.',
  },
  {
    id: 'd2',
    nama: 'Kewargaan',
    default: 'Peserta didik menunjukkan rasa bangga terhadap identitas dan budayanya, menghargai keberagaman, menjaga persatuan bangsa, serta menaati aturan bernegara dan bermasyarakat.',
  },
  {
    id: 'd3',
    nama: 'Penalaran Kritis',
    default: 'Peserta didik menunjukkan rasa ingin tahu, berpikir logis dan analitis, mampu menganalisis dan menyelesaikan permasalahan, serta memanfaatkan literasi dan numerasi.',
  },
  {
    id: 'd4',
    nama: 'Kreativitas',
    default: 'Peserta didik mampu berperilaku produktif, menciptakan inovasi, dan merumuskan solusi terhadap permasalahan di sekitarnya.',
  },
  {
    id: 'd5',
    nama: 'Kolaborasi',
    default: 'Peserta didik terbiasa peduli dan berbagi, serta mampu membangun kerja sama dengan berbagai kalangan di lingkungan sekitar.',
  },
  {
    id: 'd6',
    nama: 'Kemandirian',
    default: 'Peserta didik mampu bertanggung jawab, memiliki inisiatif, dan dapat beradaptasi dalam pembelajaran dan pengembangan diri.',
  },
  {
    id: 'd7',
    nama: 'Kesehatan',
    default: 'Peserta didik mampu menerapkan pola hidup bersih dan sehat berdasarkan pemahaman tentang kebugaran, kesehatan fisik dan mental.',
  },
  {
    id: 'd8',
    nama: 'Komunikasi',
    default: 'Peserta didik memiliki kemampuan menyimak, membaca, berbicara, dan menulis dengan baik dan benar sesuai etika dalam beragam konteks.',
  },
]

function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0)
}

function nilaiDeterministik(mapelId, siswaId, tpId) {
  return 68 + (hashStr(`${mapelId}|${siswaId}|${tpId}`) % 32) // 68–99
}

export function buildSeed() {
  const kelas = [
    { id: 'k1', nama: '7A', fase: 'D', waliKelas: 'Sri Rahayu, S.Pd.', nipWali: '198504122010012001' },
    { id: 'k2', nama: '7B', fase: 'D', waliKelas: 'Budi Santoso, S.Pd.', nipWali: '198203102009031002' },
  ]

  const siswaBase = [
    { nisn: '0123456789', nis: '25001', nama: 'Aisyah Putri Ramadhani', tempatLahir: 'Bandung', tglLahir: '2013-05-14', jenisKelamin: 'P', agama: 'Islam', alamat: 'Jl. Melati No. 2, Nusantara', namaAyah: 'Rudi Hartono', namaIbu: 'Siti Aminah', pekerjaanAyah: 'Wiraswasta', pekerjaanIbu: 'Ibu Rumah Tangga' },
    { nisn: '0123456790', nis: '25002', nama: 'Bagas Prasetyo', tempatLahir: 'Bandung', tglLahir: '2012-11-02', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Anggrek No. 5, Nusantara', namaAyah: 'Slamet Riyadi', namaIbu: 'Tuti Wulandari', pekerjaanAyah: 'Karyawan Swasta', pekerjaanIbu: 'Guru' },
    { nisn: '0123456791', nis: '25003', nama: 'Citra Lestari', tempatLahir: 'Cimahi', tglLahir: '2013-01-20', jenisKelamin: 'P', agama: 'Kristen', alamat: 'Jl. Kenanga No. 8, Nusantara', namaAyah: 'Yohanes Simanjuntak', namaIbu: 'Maria Sitorus', pekerjaanAyah: 'Pedagang', pekerjaanIbu: 'Ibu Rumah Tangga' },
    { nisn: '0123456792', nis: '25004', nama: 'Dimas Aditya Nugraha', tempatLahir: 'Bandung', tglLahir: '2013-03-08', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Mawar No. 12, Nusantara', namaAyah: 'Agus Salim', namaIbu: 'Dewi Sartika', pekerjaanAyah: 'PNS', pekerjaanIbu: 'Bidan' },
    { nisn: '0123456793', nis: '25005', nama: 'Eka Nurhaliza', tempatLahir: 'Bandung', tglLahir: '2012-12-25', jenisKelamin: 'P', agama: 'Islam', alamat: 'Jl. Dahlia No. 3, Nusantara', namaAyah: 'Hendra Gunawan', namaIbu: 'Lilis Suryani', pekerjaanAyah: 'Wiraswasta', pekerjaanIbu: 'Ibu Rumah Tangga' },
    { nisn: '0123456794', nis: '25006', nama: 'Fajar Ramadhan', tempatLahir: 'Garut', tglLahir: '2013-07-17', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Cempaka No. 21, Nusantara', namaAyah: 'Ujang Sopian', namaIbu: 'Euis Komariah', pekerjaanAyah: 'Petani', pekerjaanIbu: 'Pedagang' },
    { nisn: '0123456795', nis: '25007', nama: 'Gita Permata Sari', tempatLahir: 'Bandung', tglLahir: '2013-09-30', jenisKelamin: 'P', agama: 'Hindu', alamat: 'Jl. Flamboyan No. 7, Nusantara', namaAyah: 'I Made Wirawan', namaIbu: 'Ni Luh Putri', pekerjaanAyah: 'Wiraswasta', pekerjaanIbu: 'Ibu Rumah Tangga' },
    { nisn: '0123456796', nis: '25008', nama: 'Hafiz Al Ghifari', tempatLahir: 'Bandung', tglLahir: '2012-10-11', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Kamboja No. 15, Nusantara', namaAyah: 'Asep Saepudin', namaIbu: 'Nunung Nurjanah', pekerjaanAyah: 'Karyawan Swasta', pekerjaanIbu: 'Guru' },
    { nisn: '0123456797', nis: '25009', nama: 'Intan Permatasari', tempatLahir: 'Sumedang', tglLahir: '2013-04-19', jenisKelamin: 'P', agama: 'Buddha', alamat: 'Jl. Teratai No. 9, Nusantara', namaAyah: 'Budi Wijaya', namaIbu: 'Mei Ling', pekerjaanAyah: 'Pengusaha', pekerjaanIbu: 'Ibu Rumah Tangga' },
    { nisn: '0123456798', nis: '25010', nama: 'Joko Susilo', tempatLahir: 'Bandung', tglLahir: '2012-08-05', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Bougenville No. 4, Nusantara', namaAyah: 'Sukarno', namaIbu: 'Sumarni', pekerjaanAyah: 'Buruh', pekerjaanIbu: 'Ibu Rumah Tangga' },
  ]
  const siswaB = [
    { nisn: '0123456799', nis: '25011', nama: 'Kartika Sari Dewi', tempatLahir: 'Bandung', tglLahir: '2013-02-12', jenisKelamin: 'P', agama: 'Islam', alamat: 'Jl. Manggis No. 6, Nusantara', namaAyah: 'Dedi Kurniawan', namaIbu: 'Ratna Sari', pekerjaanAyah: 'PNS', pekerjaanIbu: 'Ibu Rumah Tangga' },
    { nisn: '0123456800', nis: '25012', nama: 'Lukman Hakim', tempatLahir: 'Cimahi', tglLahir: '2013-06-23', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Nangka No. 11, Nusantara', namaAyah: 'Mahmud', namaIbu: 'Farida', pekerjaanAyah: 'Wiraswasta', pekerjaanIbu: 'Guru' },
    { nisn: '0123456801', nis: '25013', nama: 'Maya Anggraini', tempatLahir: 'Bandung', tglLahir: '2012-09-14', jenisKelamin: 'P', agama: 'Katolik', alamat: 'Jl. Rambutan No. 18, Nusantara', namaAyah: 'Petrus Nababan', namaIbu: 'Veronika Hutapea', pekerjaanAyah: 'Karyawan Swasta', pekerjaanIbu: 'Ibu Rumah Tangga' },
    { nisn: '0123456802', nis: '25014', nama: 'Nanda Pratama', tempatLahir: 'Bandung', tglLahir: '2013-08-27', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Sawo No. 2, Nusantara', namaAyah: 'Rahmat Hidayat', namaIbu: 'Sri Wahyuni', pekerjaanAyah: 'Pedagang', pekerjaanIbu: 'Ibu Rumah Tangga' },
  ]

  const siswa = [
    ...siswaBase.map((s, i) => ({ id: `s${i + 1}`, kelasId: 'k1', ...s })),
    ...siswaB.map((s, i) => ({ id: `s${i + 11}`, kelasId: 'k2', ...s })),
  ]

  // Mapel per kelas (klon template dengan id unik per kelas)
  const mapel = []
  let mIdx = 0
  for (const k of kelas) {
    for (const tpl of MAPEL_TEMPLATE) {
      mIdx++
      const id = `m${mIdx}`
      mapel.push({
        id,
        kelasId: k.id,
        kode: tpl.kode,
        nama: tpl.nama,
        kkm: 70,
        pilihan: !!tpl.pilihan,
        keterangan: tpl.keterangan || '',
        guru: k.id === 'k1' ? 'Drs. H. Ahmad Fauzi, M.Pd.' : 'Rina Marlina, S.Pd.',
        tp: tpl.tp.map((d, i) => ({ id: `${id}-t${i + 1}`, kode: `${tpl.kode} ${i + 1}`, deskripsi: d })),
      })
    }
  }

  // Nilai deterministik (agar data contoh stabil antar-reload)
  const nilai = {}
  for (const mp of mapel) {
    nilai[mp.id] = {}
    for (const s of siswa.filter((x) => x.kelasId === mp.kelasId)) {
      nilai[mp.id][s.id] = {}
      for (const tp of mp.tp) {
        nilai[mp.id][s.id][tp.id] = nilaiDeterministik(mp.id, s.id, tp.id)
      }
    }
  }


  const profilLulusan = {}
  for (const s of siswa) {
    profilLulusan[s.id] = {}
    for (const d of DIMENSI) profilLulusan[s.id][d.id] = d.default
  }

  const kokurikuler = [
    {
      id: 'ko1',
      nama: 'Gerakan 7 Kebiasaan Anak Indonesia Hebat',
      jenis: 'Integrasi Karakter',
      deskripsi: 'Kegiatan pembiasaan: bangun pagi, beribadah, berolahraga, makan sehat dan bergizi, gemar belajar, bermasyarakat, dan tidur cepat.',
      hasil: {},
    },
    {
      id: 'ko2',
      nama: 'Projek Kolaborasi Lintas Mata Pelajaran: "Kemandirian dan Gotong Royong"',
      jenis: 'Projek Kokurikuler',
      deskripsi: 'Pembelajaran kolaboratif lintas disiplin ilmu yang menghubungkan teori dengan praktik nyata (bentuk kokurikuler fleksibel sesuai Permendikdasmen No. 13 Tahun 2025).',
      hasil: {},
    },
  ]
  const hasilKoDefault = [
    'Mengikuti seluruh rangkaian kegiatan dengan antusias, menunjukkan kebiasaan positif secara konsisten, dan menjadi teladan bagi teman.',
    'Berperan aktif sebagai ketua kelompok, mampu mengoordinasikan anggota, dan menghasilkan produk projek yang bermanfaat.',
  ]
  for (let i = 0; i < kokurikuler.length; i++) {
    for (const s of siswa) {
      kokurikuler[i].hasil[s.id] = hasilKoDefault[i % hasilKoDefault.length]
    }
  }

  const ekskul = [
    { id: 'e1', nama: 'Pramuka (Kepanduan)', pembina: 'Budi Santoso, S.Pd.', wajib: true, keterangan: 'Ekstrakurikuler berbasis kepanduan wajib disediakan (Permendikdasmen No. 13 Tahun 2025)', nilai: {} },
    { id: 'e2', nama: 'Futsal', pembina: 'Dede Firmansyah, S.Pd.', wajib: false, keterangan: '', nilai: {} },
    { id: 'e3', nama: 'Paduan Suara', pembina: 'Rina Marlina, S.Pd.', wajib: false, keterangan: '', nilai: {} },
  ]
  const ekskulDeskripsi = [
    'Mengikuti latihan dengan disiplin, aktif dalam kegiatan, dan menunjukkan jiwa kepemimpinan serta kerja sama.',
    'Memiliki kemampuan teknik yang baik, aktif berlatih, dan mampu bekerja sama dalam tim.',
    'Memiliki kualitas vokal yang baik, aktif berlatih, dan tampil percaya diri pada berbagai kegiatan sekolah.',
  ]
  for (let i = 0; i < ekskul.length; i++) {
    for (const s of siswa) {
      ekskul[i].nilai[s.id] = {
        nilai: 82 + (hashStr(`${ekskul[i].id}|${s.id}`) % 16),
        deskripsi: ekskulDeskripsi[i % ekskulDeskripsi.length],
      }
    }
  }

  const kehadiran = {}
  for (const s of siswa) {
    kehadiran[s.id] = {
      sakit: hashStr(`${s.id}|sakit`) % 3,
      izin: hashStr(`${s.id}|izin`) % 4,
      alpha: hashStr(`${s.id}|alpha`) % 2,
    }
  }

  const catatanWali = {
    s1: 'Peserta didik menunjukkan perkembangan yang sangat baik dalam akademik dan karakter. Pertahankan prestasi dan terus kembangkan minat di bidang seni.',
    s5: 'Peserta didik perlu meningkatkan kedisiplinan dan kemandirian dalam belajar. Disarankan untuk lebih aktif bertanya di kelas.',
  }

  return {
    sekolah: {
      npsn: '20328901',
      nama: 'SMP Negeri 1 Nusantara',
      nss: '201026101001',
      alamat: 'Jl. Pendidikan No. 1',
      desa: 'Kel. Nusantara',
      kecamatan: 'Kec. Nusantara',
      kabupaten: 'Kota Nusantara',
      provinsi: 'Jawa Barat',
      kodePos: '40111',
      telp: '(022) 1234567',
      email: 'info@smpn1nusantara.sch.id',
      website: 'www.smpn1nusantara.sch.id',
      akreditasi: 'A',
      jenjang: 'SMP',
      kurikulum: 'Kurikulum Merdeka',
      tahunPelajaran: '2025/2026',
      semester: 1,
      hariEfektif: 120,
      kepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
      nipKepsek: '197001011995121001',
      batasA: 90,
      batasB: 80,
      batasC: 70,
    },
    kelas,
    siswa,
    mapel,
    nilai,
    dimensi: DIMENSI,
    profilLulusan,
    kokurikuler,
    ekskul,
    kehadiran,
    catatanWali,
    deskripsi: {},
  }
}

export const seed = buildSeed()
