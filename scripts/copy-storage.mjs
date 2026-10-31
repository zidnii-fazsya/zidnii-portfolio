/**
 * copy-storage.mjs
 * ────────────────────────────────────────────────────
 * Post-build script for Netlify deployment.
 *
 * Copies Laravel storage files (skill logos, project images,
 * experience logos/photos, education logos, profile photos)
 * into the netlify-dist/storage/ directory so that image
 * paths like /storage/skills/xxx.png resolve correctly
 * on the static Netlify host.
 * ────────────────────────────────────────────────────
 */

import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'netlify-dist');
const STORAGE_SRC = join(ROOT, 'storage', 'app', 'public');
const STORAGE_DEST = join(DIST, 'storage');
const PUBLIC_SRC = join(ROOT, 'public');

/**
 * Folders inside storage/app/public/ to copy.
 */
const STORAGE_FOLDERS = [
    'skills',
    'projects',
    'experiences',
    'education',
    'profile',
    'cv',
];

/**
 * Folders inside public/ to copy (experience & about photos
 * use public/image/experiences/* and public/image/about/*).
 */
const PUBLIC_FOLDERS = [
    'image',
];

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║  Copying storage & public assets to dist...  ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

// 1. Copy storage folders
for (const folder of STORAGE_FOLDERS) {
    const src = join(STORAGE_SRC, folder);
    const dest = join(STORAGE_DEST, folder);

    if (!existsSync(src)) {
        console.log(`  ⚠  Skipped: storage/app/public/${folder} (not found)`);
        continue;
    }

    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
    console.log(`  ✓  Copied: storage/app/public/${folder} → netlify-dist/storage/${folder}`);
}

// 2. Copy public/image (experience & about photos are here)
for (const folder of PUBLIC_FOLDERS) {
    const src = join(PUBLIC_SRC, folder);
    const dest = join(DIST, folder);

    if (!existsSync(src)) {
        console.log(`  ⚠  Skipped: public/${folder} (not found)`);
        continue;
    }

    // Use recursive copy but don't overwrite existing files from publicDir
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true, force: false });
    console.log(`  ✓  Merged: public/${folder} → netlify-dist/${folder}`);
}

console.log('');
console.log('  ✅ Storage copy completed!');
console.log('');
