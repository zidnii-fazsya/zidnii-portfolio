
/**
 * copy-storage.mjs
 * ----------------------------------------------------
 * Post-build script for Netlify deployment.
 *
 * Fungsi:
 * 1. Menyalin file Laravel storage ke netlify-dist/storage.
 * 2. Menyalin gambar dari public/image ke netlify-dist/image.
 * 3. Mempertahankan struktur folder dan subfolder.
 * 4. Memastikan file gambar dapat diakses oleh website
 *    portofolio yang di-deploy melalui Netlify.
 * ----------------------------------------------------
 */

import {
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    statSync,
} from 'node:fs';

import {
    dirname,
    join,
    resolve,
} from 'node:path';

import { fileURLToPath } from 'node:url';

// ====================================================
// 1. MENENTUKAN LOKASI DIREKTORI PROYEK
// ====================================================

const CURRENT_FILE = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(CURRENT_FILE), '..');

const DIST = join(ROOT, 'netlify-dist');

const STORAGE_SRC = join(
    ROOT,
    'storage',
    'app',
    'public'
);

const STORAGE_DEST = join(
    DIST,
    'storage'
);

const PUBLIC_SRC = join(ROOT, 'public');

// ====================================================
// 2. DAFTAR FOLDER STORAGE YANG AKAN DISALIN
// ====================================================

const STORAGE_FOLDERS = [
    'skills',
    'projects',
    'experiences',
    'education',
    'profile',
    'cv',
];

// ====================================================
// 3. DAFTAR FOLDER PUBLIC YANG AKAN DISALIN
// ====================================================

const PUBLIC_FOLDERS = [
    'image',
];

// ====================================================
// 4. FUNGSI MENGHITUNG JUMLAH FILE
// ====================================================

function countFiles(directory) {
    if (!existsSync(directory)) {
        return 0;
    }

    let total = 0;

    const entries = readdirSync(directory);

    for (const entry of entries) {
        const fullPath = join(directory, entry);

        if (statSync(fullPath).isDirectory()) {
            total += countFiles(fullPath);
        } else {
            total++;
        }
    }

    return total;
}

// ====================================================
// 5. VALIDASI FOLDER HASIL BUILD
// ====================================================

console.log('');
console.log('====================================================');
console.log('  NETLIFY STORAGE & IMAGE COPY PROCESS');
console.log('====================================================');
console.log('');

if (!existsSync(DIST)) {
    console.error(
        'ERROR: Folder netlify-dist tidak ditemukan.'
    );

    console.error(
        'Jalankan Vite build terlebih dahulu sebelum script ini.'
    );

    process.exit(1);
}

let totalCopied = 0;
let totalSkipped = 0;

// ====================================================
// 6. MENYALIN LARAVEL STORAGE
// ====================================================

console.log('[1] COPYING LARAVEL STORAGE');
console.log('');

for (const folder of STORAGE_FOLDERS) {
    const src = join(STORAGE_SRC, folder);
    const dest = join(STORAGE_DEST, folder);

    if (!existsSync(src)) {
        console.warn(
            `  WARNING: Folder tidak ditemukan: storage/app/public/${folder}`
        );

        totalSkipped++;
        continue;
    }

    mkdirSync(dest, { recursive: true });

    // Menyalin seluruh file dan subfolder.
    // File dengan nama sama di tujuan akan diperbarui.
    cpSync(src, dest, {
        recursive: true,
        force: true,
    });

    const fileCount = countFiles(src);

    totalCopied += fileCount;

    console.log(
        `  SUCCESS: ${folder} (${fileCount} files)`
    );
}

console.log('');

// ====================================================
// 7. MENYALIN PUBLIC/IMAGE
// ====================================================

console.log('[2] COPYING PUBLIC IMAGES');
console.log('');

for (const folder of PUBLIC_FOLDERS) {
    const src = join(PUBLIC_SRC, folder);
    const dest = join(DIST, folder);

    if (!existsSync(src)) {
        console.warn(
            `  WARNING: Folder tidak ditemukan: public/${folder}`
        );

        totalSkipped++;
        continue;
    }

    mkdirSync(dest, { recursive: true });

    // File dari public/image digabungkan ke hasil build.
    // File yang sudah ada tidak ditimpa.
    cpSync(src, dest, {
        recursive: true,
        force: false,
        errorOnExist: false,
    });

    const fileCount = countFiles(src);

    totalCopied += fileCount;

    console.log(
        `  SUCCESS: public/${folder} (${fileCount} files)`
    );
}

console.log('');

// ====================================================
// 8. RINGKASAN HASIL PENYALINAN
// ====================================================

console.log('====================================================');
console.log('  COPY PROCESS COMPLETED');
console.log('====================================================');

console.log(
    `  Total files processed : ${totalCopied}`
);

console.log(
    `  Folders skipped       : ${totalSkipped}`
);

console.log(
    `  Output directory      : ${DIST}`
);

console.log('====================================================');
console.log('');

if (totalSkipped > 0) {
    console.warn(
        'WARNING: Ada folder sumber yang tidak ditemukan. Periksa kembali lokasi file.'
    );
} else {
    console.log(
        'SUCCESS: Semua folder sumber berhasil diproses.'
    );
}

console.log('');
