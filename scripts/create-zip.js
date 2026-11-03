import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();
const rootDir = process.cwd();
const outputZip = path.join(rootDir, 'petcare-project.zip');
const publicDir = path.join(rootDir, 'public');
const publicZip = path.join(publicDir, 'petcare-project.zip');

function addDirectoryToZip(dirPath, zipFolder) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    if (
      item === 'node_modules' ||
      item === 'dist' ||
      item === '.git' ||
      item === 'petcare-project.zip' ||
      item === '.DS_Store'
    ) {
      continue;
    }

    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subFolder = zipFolder ? zipFolder.folder(item) : zip.folder(item);
      addDirectoryToZip(fullPath, subFolder);
    } else {
      const content = fs.readFileSync(fullPath);
      if (zipFolder) {
        zipFolder.file(item, content);
      } else {
        zip.file(item, content);
      }
    }
  }
}

async function run() {
  console.log('Generating petcare-project.zip...');
  addDirectoryToZip(rootDir, null);

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  fs.writeFileSync(outputZip, buffer);

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(publicZip, buffer);

  console.log(`Successfully generated:\n- ${outputZip} (${(buffer.length / 1024).toFixed(1)} KB)\n- ${publicZip}`);
}

run().catch((err) => {
  console.error('Error generating zip:', err);
  process.exit(1);
});
