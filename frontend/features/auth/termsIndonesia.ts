import type { TermDocument } from "@/features/auth/terms";

// ---------------------------------------------------------------------------
// TODO: Ganti dengan data resmi sebelum rilis. Nilai di bawah masih placeholder.
//       Dokumen ini memiliki akibat hukum — wajib ditinjau oleh penasihat hukum
//       sebelum digunakan. Bahasa Indonesia adalah naskah resmi (UU No. 24/2009
//       jo. Perpres No. 63/2019).
// ---------------------------------------------------------------------------
const PERUSAHAAN = {
	nama: "Cmarket Co., Ltd.",
	direktur: "○○○",
	alamat: "○○○, Republik Korea",
	nomorIzin: "○○○-○○-○○○○○",
	dpo: "○○○",
	email: "support@example.com",
	telepon: "○○-○○○○-○○○○",
};

/** Region proyek Supabase. Periksa di Settings › General › Region lalu isi. */
const WILAYAH_DATA = "○○○ (mis. Seoul, Korea Selatan / Singapura)";

const LAYANAN: TermDocument = {
	id: "service",
	label: "Persetujuan Syarat dan Ketentuan Layanan",
	required: true,
	version: "1.0",
	effectiveDate: "2026-01-01",
	summary:
		"MitraPay adalah platform perantara transaksi B2B antara perusahaan Indonesia dan Korea. Perusahaan bertindak sebagai perantara, bukan pihak dalam jual beli. Tanggung jawab atas mutu barang, waktu pengiriman, dan pembayaran berada pada para pihak yang bertransaksi.",
	sections: [
		{
			heading: "Pasal 1 (Maksud dan Tujuan)",
			body: [
				`Syarat dan Ketentuan ini mengatur hak, kewajiban, dan tanggung jawab antara ${PERUSAHAAN.nama} (selanjutnya disebut "Perusahaan") dan Pengguna sehubungan dengan penggunaan layanan MitraPay (selanjutnya disebut "Layanan").`,
			],
		},
		{
			heading: "Pasal 2 (Definisi)",
			body: [
				'1. "Layanan" adalah platform perantara transaksi antarperusahaan Indonesia–Korea beserta layanan penunjangnya yang dioperasikan oleh Perusahaan.',
				'2. "Pengguna" adalah pelaku usaha berbadan hukum yang menyetujui Syarat dan Ketentuan ini dan menutup perjanjian penggunaan dengan Perusahaan. Layanan hanya diperuntukkan bagi pelaku usaha.',
				'3. "Perusahaan Pembeli" adalah Pengguna yang mengajukan permintaan penawaran dan memilih pemasok.',
				'4. "Perusahaan Pemasok" adalah Pengguna yang mengajukan penawaran dan memasok barang.',
				'5. "Permintaan Penawaran" adalah pengumuman kebutuhan barang, jumlah, dan syarat pengiriman untuk memperoleh penawaran.',
				'6. "Penawaran" adalah harga, waktu pengiriman, dan syarat lain yang diajukan Perusahaan Pemasok.',
				'7. "Kontrak" adalah transaksi yang timbul antara Perusahaan Pembeli dan Perusahaan Pemasok ketika suatu Penawaran dipilih.',
			],
		},
		{
			heading: "Pasal 3 (Pengumuman dan Perubahan)",
			body: [
				"1. Perusahaan menampilkan isi Syarat dan Ketentuan ini pada halaman Layanan agar mudah diketahui Pengguna.",
				"2. Perusahaan dapat mengubah Syarat dan Ketentuan ini sepanjang tidak bertentangan dengan peraturan perundang-undangan.",
				"3. Perubahan diumumkan sekurang-kurangnya 7 (tujuh) hari sebelum tanggal berlaku dengan mencantumkan tanggal berlaku dan alasan perubahan. Untuk perubahan yang merugikan Pengguna, pengumuman dilakukan sekurang-kurangnya 30 (tiga puluh) hari sebelumnya dan diberitahukan secara individual melalui surat elektronik.",
				"4. Pengguna yang tidak menyetujui perubahan dapat mengakhiri perjanjian penggunaan sebelum tanggal berlaku. Apabila Pengguna tetap menggunakan Layanan setelah tanggal berlaku tanpa menyatakan penolakan, Pengguna dianggap menyetujui perubahan tersebut.",
			],
		},
		{
			heading: "Pasal 4 (Pendaftaran dan Kelayakan)",
			body: [
				"1. Perjanjian penggunaan terbentuk ketika pemohon menyetujui Syarat dan Ketentuan ini dan Perusahaan menerima permohonan tersebut.",
				"2. Layanan hanya dapat digunakan oleh pelaku usaha yang memiliki NIB dan NPWP (Indonesia) atau nomor registrasi usaha (Korea).",
				"3. Perusahaan dapat menolak permohonan atau mengakhiri perjanjian dalam hal:",
				"  a. penggunaan identitas orang lain atau pencantuman informasi yang tidak benar;",
				"  b. izin usaha tidak dapat diverifikasi atau berstatus tidak aktif;",
				"  c. terdapat riwayat pengakhiran perjanjian karena pelanggaran Syarat dan Ketentuan;",
				"  d. tujuan penggunaan bertentangan dengan peraturan perundang-undangan.",
			],
		},
		{
			heading: "Pasal 5 (Ruang Lingkup Layanan)",
			body: [
				"Perusahaan menyediakan layanan sebagai berikut:",
				"1. pendaftaran dan penelusuran permintaan penawaran;",
				"2. pengajuan, perbandingan, dan pemilihan penawaran;",
				"3. percakapan (chat) dan pertukaran berkas antar-Pengguna;",
				"4. pengelolaan status kontrak, penerbitan faktur, pengunggahan bukti transfer, dan pencatatan konfirmasi pembayaran;",
				"5. penyusunan dan penayangan halaman profil perusahaan;",
				"6. layanan tambahan lain yang ditetapkan Perusahaan.",
			],
		},
		{
			heading: "Pasal 6 (Kedudukan Perusahaan)",
			body: [
				"1. Perusahaan adalah penyelenggara platform yang memperantarai transaksi antar-Pengguna dan bukan merupakan pihak dalam jual beli.",
				"2. Tanggung jawab atas mutu, spesifikasi, waktu pengiriman, cacat barang, pembayaran, kepabeanan, dan pengangkutan berada pada Perusahaan Pembeli dan Perusahaan Pemasok yang bersangkutan.",
				"3. Perusahaan tidak menjamin kebenaran dan keabsahan informasi yang diunggah Pengguna. Namun Perusahaan dapat menghapus konten yang terbukti tidak benar atau membatasi penggunaan Layanan.",
				"4. Perusahaan tidak berkewajiban turut serta dalam sengketa antar-Pengguna, tetapi dapat menyediakan catatan transaksi yang diperlukan sepanjang diizinkan peraturan perundang-undangan.",
			],
		},
		{
			heading: "Pasal 7 (Permintaan Penawaran dan Penawaran)",
			body: [
				"1. Perusahaan Pembeli mendaftarkan permintaan penawaran dengan mencantumkan jenis barang, jumlah, lokasi pengiriman, dan batas waktu.",
				"2. Perusahaan Pemasok dapat mengajukan penawaran sampai batas waktu dan dapat mengubah penawaran sebelum batas waktu berakhir.",
				"3. Pengajuan penawaran tidak dipungut biaya. Perusahaan dapat memberlakukan layanan tambahan berbayar setelah pemberitahuan terlebih dahulu.",
				"4. Perusahaan Pembeli tidak wajib memilih salah satu penawaran dan tidak bertanggung jawab atas kerugian Perusahaan Pemasok dalam hal tidak ada penawaran yang dipilih.",
			],
		},
		{
			heading: "Pasal 8 (Terbentuknya dan Pelaksanaan Kontrak)",
			body: [
				"1. Kontrak terbentuk antara Perusahaan Pembeli dan Perusahaan Pemasok pada saat suatu penawaran dipilih.",
				"2. Syarat rinci kontrak mengikuti isi penawaran dan kesepakatan para pihak.",
				"3. Cara dan waktu pembayaran ditentukan oleh para pihak. Perusahaan tidak menerima atau menyimpan dana. Fitur pengunggahan bukti transfer dan konfirmasi pembayaran hanyalah pencatatan untuk membantu para pihak dan bukan merupakan jaminan pembayaran oleh Perusahaan.",
			],
		},
		{
			heading: "Pasal 9 (Kewajiban Pengguna)",
			body: [
				"1. Pengguna wajib memberikan informasi yang benar pada saat pendaftaran dan memperbaruinya tanpa penundaan apabila terjadi perubahan.",
				"2. Pengguna dilarang mengalihkan atau meminjamkan akun kepada pihak lain dan bertanggung jawab atas kerugian yang timbul akibat kelalaian pengelolaan akun.",
				"3. Pengguna dilarang menggunakan informasi pihak lawan yang diperoleh melalui Layanan di luar tujuan transaksi atau membocorkannya kepada pihak ketiga.",
			],
		},
		{
			heading: "Pasal 10 (Larangan)",
			body: [
				"Pengguna dilarang:",
				"1. mendaftarkan permintaan penawaran atau penawaran palsu, atau tanpa niat bertransaksi;",
				"2. menggunakan identitas orang lain serta memalsukan atau mengubah data usaha;",
				"3. memperdagangkan barang yang dilarang atau dibatasi ekspor-impornya menurut peraturan perundang-undangan;",
				"4. mengganggu penyelenggaraan Layanan (pengambilan data otomatis, rekayasa balik, pembebanan lalu lintas berlebihan, dan sejenisnya);",
				"5. melanggar hak kekayaan intelektual Perusahaan atau pihak ketiga.",
			],
		},
		{
			heading: "Pasal 11 (Pembatasan dan Pengakhiran)",
			body: [
				"1. Perusahaan dapat membatasi penggunaan Layanan atau mengakhiri perjanjian setelah pemberitahuan terlebih dahulu apabila Pengguna melanggar Syarat dan Ketentuan ini. Dalam hal pelanggaran bersifat mendesak atau berat, tindakan dapat dilakukan lebih dahulu dan diberitahukan kemudian.",
				"2. Pengguna dapat mengajukan pengakhiran perjanjian sewaktu-waktu. Apabila terdapat transaksi yang sedang berjalan, pengakhiran diproses setelah transaksi tersebut selesai.",
				"3. Meskipun perjanjian berakhir, catatan transaksi yang wajib disimpan menurut peraturan perundang-undangan tetap disimpan selama jangka waktu tersebut.",
			],
		},
		{
			heading: "Pasal 12 (Konten dan Kekayaan Intelektual)",
			body: [
				"1. Hak cipta atas permintaan penawaran, profil perusahaan, gambar, dan konten lain yang diunggah Pengguna tetap berada pada Pengguna.",
				"2. Pengguna memberikan izin kepada Perusahaan untuk menampilkan, menggandakan, dan memamerkan konten tersebut di dalam Layanan untuk keperluan penyelenggaraan dan promosi Layanan.",
				"3. Hak atas tampilan, merek, dan perangkat lunak yang dibuat Perusahaan menjadi milik Perusahaan.",
			],
		},
		{
			heading: "Pasal 13 (Pembatasan Tanggung Jawab)",
			body: [
				"1. Perusahaan tidak bertanggung jawab apabila Layanan tidak dapat disediakan karena keadaan kahar seperti bencana alam, pemadaman listrik, atau gangguan jaringan.",
				"2. Perusahaan tidak bertanggung jawab atas kerugian yang timbul dari transaksi antar-Pengguna kecuali terdapat kesengajaan atau kelalaian berat Perusahaan.",
				"3. Perusahaan tidak bertanggung jawab atas tidak tercapainya keuntungan yang diharapkan Pengguna melalui Layanan.",
			],
		},
		{
			heading: "Pasal 14 (Hukum yang Berlaku dan Penyelesaian Sengketa)",
			body: [
				"1. Syarat dan Ketentuan ini tunduk pada hukum Republik Indonesia bagi Pengguna yang berkedudukan di Indonesia.",
				"2. Para pihak mengutamakan penyelesaian sengketa secara musyawarah. Apabila tidak tercapai kesepakatan, sengketa diselesaikan melalui pengadilan yang berwenang.",
				"3. Naskah Bahasa Indonesia merupakan naskah resmi dari Syarat dan Ketentuan ini.",
			],
		},
		{
			heading: "Penutup",
			body: [
				"Syarat dan Ketentuan ini berlaku sejak 1 Januari 2026.",
				`Identitas penyelenggara: ${PERUSAHAAN.nama} | Direktur ${PERUSAHAAN.direktur} | Nomor izin usaha ${PERUSAHAAN.nomorIzin} | Alamat ${PERUSAHAAN.alamat} | Kontak ${PERUSAHAAN.email} / ${PERUSAHAAN.telepon}`,
			],
		},
	],
	refusalNotice:
		"Anda berhak tidak menyetujui Syarat dan Ketentuan ini. Namun tanpa persetujuan, pendaftaran dan penggunaan Layanan tidak dapat dilakukan.",
};

const DATA_PRIBADI: TermDocument = {
	id: "privacy",
	label: "Persetujuan Pengumpulan dan Penggunaan Data Pribadi",
	required: true,
	version: "1.0",
	effectiveDate: "2026-01-01",
	summary:
		"Kami mengumpulkan data penanggung jawab dan data usaha untuk pendaftaran serta perantaraan transaksi. Anda berhak menolak, namun pendaftaran akan terbatas.",
	sections: [
		{
			heading: "Pemberitahuan berdasarkan Pasal 21 UU No. 27 Tahun 2022",
			body: [
				`${PERUSAHAAN.nama} sebagai Pengendali Data Pribadi mengumpulkan dan memproses Data Pribadi sebagaimana diuraikan di bawah ini. Mohon dibaca sebelum memberikan persetujuan.`,
				"Dasar pemrosesan: persetujuan Subjek Data Pribadi dan pelaksanaan perjanjian sebagaimana dimaksud dalam Pasal 20 ayat (2) UU PDP.",
			],
		},
		{
			heading: "Jangka Waktu Penyimpanan",
			body: [
				"Pada prinsipnya Data Pribadi dimusnahkan segera setelah keanggotaan diakhiri. Namun data berikut disimpan selama jangka waktu tersebut di bawah ini:",
				"1. data identifikasi minimum untuk mencegah pendaftaran ulang yang menyalahi ketentuan: 30 hari setelah pengakhiran;",
				"2. catatan kontrak dan penyelesaian pembayaran: 5 tahun (ketentuan perpajakan);",
				"3. dokumen perusahaan: 10 tahun (UU No. 8 Tahun 1997 tentang Dokumen Perusahaan);",
				"4. catatan akses Layanan: 3 bulan.",
			],
		},
		{
			heading: "Hak Subjek Data Pribadi (Pasal 5 sampai dengan Pasal 13 UU PDP)",
			body: [
				"Anda berhak untuk: memperoleh informasi mengenai pemrosesan; mengakses dan memperoleh salinan Data Pribadi; memperbaiki dan memperbarui data; mengakhiri pemrosesan, menghapus, atau memusnahkan Data Pribadi; menarik kembali persetujuan; mengajukan keberatan atas pengambilan keputusan otomatis; menunda atau membatasi pemrosesan; memperoleh Data Pribadi dalam bentuk yang dapat dipindahkan; serta menuntut ganti rugi atas pelanggaran.",
				"Sebagian data dapat Anda ubah sendiri pada menu \"Halaman Perusahaan › Pengaturan Perusahaan\". Permohonan lain dapat disampaikan melalui kontak di bawah ini.",
				`Pejabat Pelindungan Data Pribadi: ${PERUSAHAAN.dpo} (${PERUSAHAAN.email}, ${PERUSAHAAN.telepon})`,
			],
		},
		{
			heading: "Pemberitahuan Kegagalan Pelindungan",
			body: [
				"Apabila terjadi kegagalan pelindungan Data Pribadi, Perusahaan menyampaikan pemberitahuan tertulis kepada Subjek Data Pribadi dan lembaga yang berwenang paling lambat 3 x 24 jam sesuai Pasal 46 UU PDP.",
			],
		},
	],
	tables: [
		{
			heading: "Rincian Pengumpulan dan Penggunaan",
			columns: ["Sifat", "Jenis Data", "Tujuan Pemrosesan", "Jangka Waktu"],
			rows: [
				[
					"Wajib",
					"Nama pengguna (ID), kata sandi, surel",
					"Identifikasi anggota, masuk ke akun, pemberitahuan dan layanan bantuan",
					"Sampai keanggotaan diakhiri",
				],
				[
					"Wajib",
					"Nama penanggung jawab, jabatan, divisi, nomor ponsel, nomor telepon",
					"Komunikasi dengan pihak lawan transaksi, pemberitahuan proses penawaran dan kontrak",
					"Sampai keanggotaan diakhiri",
				],
				[
					"Wajib",
					"Nama perusahaan, nama direktur, NPWP, NIB, alamat usaha, provinsi, kota, bidang usaha, jenis usaha",
					"Verifikasi status pelaku usaha, penerbitan kontrak dan faktur",
					"5 tahun setelah keanggotaan diakhiri (ketentuan peraturan)",
				],
				[
					"Opsional",
					"Logo perusahaan, profil perusahaan, gambar produk, alamat situs web",
					"Penayangan halaman profil perusahaan",
					"Sampai keanggotaan diakhiri atau permintaan penghapusan",
				],
				[
					"Opsional",
					"Informasi rekening (nama bank, nomor rekening, nama pemilik, kode SWIFT)",
					"Penerbitan faktur dan panduan penerimaan pembayaran",
					"Sampai keanggotaan diakhiri",
				],
				[
					"Terkumpul otomatis",
					"Alamat IP, waktu akses, informasi peramban",
					"Pencegahan penyalahgunaan, peningkatan mutu Layanan",
					"3 bulan",
				],
			],
		},
	],
	refusalNotice:
		"Anda berhak menolak memberikan persetujuan. Namun tanpa persetujuan atas data yang bersifat wajib, pendaftaran dan penggunaan layanan perantaraan transaksi tidak dapat dilakukan. Penolakan atas data opsional tidak membatasi pendaftaran.",
};

const PIHAK_KETIGA: TermDocument = {
	id: "thirdparty",
	label: "Persetujuan Pemberian Data Pribadi kepada Pihak Ketiga",
	required: true,
	version: "1.0",
	effectiveDate: "2026-01-01",
	summary:
		"Setelah kontrak terbentuk, data penanggung jawab dan data usaha diberikan kepada perusahaan lawan transaksi. Data juga diberikan kepada penyedia pembayaran dan logistik sebatas yang diperlukan.",
	sections: [
		{
			heading: "Dasar dan Ruang Lingkup",
			body: [
				"Perusahaan memberikan Data Pribadi kepada pihak ketiga sebagaimana diuraikan di bawah ini. Pemberian hanya dilakukan kepada pihak lawan dalam transaksi yang benar-benar terjadi dan kepada penyedia jasa yang diperlukan untuk pelaksanaan transaksi tersebut.",
			],
		},
		{
			heading: "Saat Pemberian",
			body: [
				"1. Pihak lawan transaksi: diberikan pada saat penawaran dipilih dan kontrak terbentuk. Pada tahap penawaran, hanya nama perusahaan dan informasi yang Anda tetapkan sebagai publik yang ditampilkan.",
				"2. Penyedia pembayaran dan logistik: diberikan pada saat transaksi yang menggunakan layanan tersebut berlangsung.",
			],
		},
	],
	tables: [
		{
			heading: "Rincian Pemberian kepada Pihak Ketiga",
			columns: ["Penerima", "Tujuan", "Jenis Data", "Jangka Waktu"],
			rows: [
				[
					"Pengguna lawan transaksi (Perusahaan Pembeli atau Perusahaan Pemasok)",
					"Pelaksanaan kontrak, pengiriman dan pembayaran, penerbitan faktur",
					"Nama perusahaan, nama direktur, NPWP, NIB, alamat usaha, nama dan jabatan penanggung jawab, nomor telepon, surel, informasi rekening",
					"5 tahun setelah transaksi berakhir",
				],
				[
					"Penyedia jasa pembayaran ○○○ (TODO: isi nama resmi)",
					"Pemrosesan dan penyelesaian pembayaran",
					"Nama perusahaan, NPWP, nama dan kontak penanggung jawab, informasi pembayaran",
					"5 tahun setelah transaksi berakhir",
				],
				[
					"Penyedia jasa logistik dan pengangkutan ○○○ (TODO: isi nama resmi)",
					"Pengangkutan barang, kepabeanan, pemberitahuan status pengiriman",
					"Nama perusahaan, nama dan kontak penanggung jawab, alamat tujuan pengiriman",
					"3 tahun setelah pengiriman selesai",
				],
			],
		},
	],
	refusalNotice:
		"Anda berhak menolak pemberian data kepada pihak ketiga. Namun pemberian data kepada pihak lawan transaksi bersifat esensial bagi pelaksanaan kontrak, sehingga tanpa persetujuan Anda tidak dapat menggunakan layanan perantaraan transaksi.",
};

const TRANSFER_LUAR: TermDocument = {
	id: "overseas",
	label: "Persetujuan Transfer Data Pribadi ke Luar Wilayah Indonesia",
	required: true,
	version: "1.0",
	effectiveDate: "2026-01-01",
	summary:
		"MitraPay menghubungkan perusahaan Indonesia dan Korea, sehingga pihak lawan transaksi maupun infrastruktur Layanan dapat berada di luar wilayah hukum Indonesia.",
	sections: [
		{
			heading: "Pemberitahuan berdasarkan Pasal 56 UU No. 27 Tahun 2022",
			body: [
				"Perusahaan mentransfer Data Pribadi ke luar wilayah hukum Republik Indonesia sebagaimana diuraikan di bawah ini.",
				"Perusahaan memastikan negara tujuan memiliki tingkat pelindungan yang setara atau menerapkan pelindungan yang memadai dan mengikat melalui perjanjian dengan penerima. Apabila keduanya tidak terpenuhi, transfer dilakukan berdasarkan persetujuan Anda ini.",
			],
		},
		{
			heading: "Akibat Penolakan",
			body: [
				"Anda berhak menolak transfer ke luar wilayah Indonesia. Namun karena perantaraan transaksi dengan perusahaan Korea merupakan fungsi inti Layanan, penolakan akan membatasi penggunaan Layanan.",
			],
		},
	],
	tables: [
		{
			heading: "Rincian Transfer ke Luar Wilayah Indonesia",
			columns: ["Penerima", "Negara Tujuan", "Waktu dan Cara Transfer", "Jenis Data", "Tujuan dan Jangka Waktu"],
			rows: [
				[
					`Penyedia infrastruktur komputasi awan (Supabase Inc. / Amazon Web Services) — kontak ${PERUSAHAAN.email}`,
					WILAYAH_DATA,
					"Sewaktu-waktu melalui jaringan sejak pendaftaran dan selama penggunaan Layanan",
					"Seluruh Data Pribadi yang dikumpulkan dalam Layanan ini",
					"Penyimpanan data dan penyelenggaraan Layanan / sampai keanggotaan atau perjanjian pengelolaan berakhir",
				],
				[
					"Pengguna lawan transaksi yang berkedudukan di Republik Korea",
					"Republik Korea",
					"Pada saat kontrak terbentuk, melalui tampilan Layanan",
					"Nama perusahaan, nama direktur, NPWP, NIB, alamat, nama dan jabatan penanggung jawab, kontak, surel, informasi rekening",
					"Pelaksanaan kontrak dan penyelesaian pembayaran / 5 tahun setelah transaksi berakhir",
				],
			],
		},
	],
	refusalNotice:
		"Anda berhak menolak persetujuan transfer ke luar wilayah Indonesia. Namun tanpa persetujuan, layanan perantaraan transaksi dengan perusahaan di luar negeri tidak dapat digunakan.",
};

const PEMASARAN: TermDocument = {
	id: "marketing",
	label: "Persetujuan Menerima Informasi Pemasaran",
	required: false,
	version: "1.0",
	effectiveDate: "2026-01-01",
	summary:
		"Anda dapat menerima pemberitahuan permintaan penawaran baru, acara, dan kabar Layanan. Penolakan tidak membatasi penggunaan Layanan.",
	sections: [
		{
			heading: "Isi dan Cara Pengiriman",
			body: [
				"1. Isi: pemberitahuan permintaan penawaran baru pada kategori yang Anda tangani, kabar fitur dan acara baru, survei, dan penawaran manfaat.",
				"2. Cara: surel, pesan singkat (SMS), dan pemberitahuan di dalam Layanan.",
				"3. Data yang digunakan: surel, nomor ponsel, nama penanggung jawab, kategori usaha yang ditangani.",
				"4. Jangka waktu: sampai persetujuan ditarik kembali atau keanggotaan diakhiri.",
			],
		},
		{
			heading: "Penarikan Persetujuan",
			body: [
				`Anda dapat menolak penerimaan atau menarik persetujuan sewaktu-waktu melalui pengaturan di dalam Layanan atau dengan menghubungi ${PERUSAHAAN.email}. Setelah penarikan, pengiriman informasi pemasaran dihentikan segera. Pemberitahuan yang diperlukan untuk pelaksanaan transaksi (penawaran masuk, kontrak terbentuk, konfirmasi pembayaran) tetap dikirimkan.`,
			],
		},
	],
	refusalNotice: "Penolakan tidak menimbulkan pembatasan apa pun atas pendaftaran dan penggunaan Layanan.",
};

export const INDONESIA_TERMS: TermDocument[] = [
	LAYANAN,
	DATA_PRIBADI,
	PIHAK_KETIGA,
	TRANSFER_LUAR,
	PEMASARAN,
];
