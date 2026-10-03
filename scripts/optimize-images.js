
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = path.resolve(__dirname, '../public/psp-uploads');

async function optimizeImages() {
    console.log(`Scanning ${TARGET_DIR}...`);
    if (!fs.existsSync(TARGET_DIR)) {
        console.error(`Directory not found: ${TARGET_DIR}`);
        return;
    }

    const files = fs.readdirSync(TARGET_DIR);

    for (const file of files) {
        if (file.match(/\.(png|jpg|jpeg)$/i)) {
            const filePath = path.join(TARGET_DIR, file);
            const stats = fs.statSync(filePath);
            const sizeMB = stats.size / (1024 * 1024);

            // Only optimize if > 500KB or if it is the massive 2MB file
            if (sizeMB > 0.5) {
                console.log(`Optimizing: ${file} (${sizeMB.toFixed(2)} MB)`);

                try {
                    const buffer = await sharp(filePath)
                        .resize(1920, null, { // Max width 1920, maintain aspect ratio
                            withoutEnlargement: true,
                            fit: 'inside'
                        })
                        .png({ quality: 80, compressionLevel: 9, adaptiveFiltering: true })
                        .toBuffer();

                    fs.writeFileSync(filePath, buffer);

                    const newStats = fs.statSync(filePath);
                    const newSizeMB = newStats.size / (1024 * 1024);
                    console.log(`Done: ${file} -> ${newSizeMB.toFixed(2)} MB (${((1 - newSizeMB / sizeMB) * 100).toFixed(0)}% saved)`);
                } catch (err) {
                    console.error(`Failed to optimize ${file}:`, err);
                }
            }
        }
    }
}

optimizeImages();
