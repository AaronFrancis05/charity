import { createWriteStream, mkdirSync, copyFileSync } from 'fs';
import { pipeline } from 'stream/promises';
import { get } from 'https';

const images = [
  { url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/grace.jpg' },
  { url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/joseph.jpg' },
  { url: 'https://images.unsplash.com/photo-1543878729-9cef9f864fd9?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/amara.jpg' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/david.jpg' },
  { url: 'https://images.unsplash.com/photo-1520810627419-35e592f9a012?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/fatuma.jpg' },
  { url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/moses.jpg' },
  { url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=70', dest: 'public/images/children/placeholder.jpg' },
  { url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80', dest: 'public/images/sections/mission-right.jpg' },
  { url: 'https://images.unsplash.com/photo-1473649085228-583485e6e4d7?auto=format&fit=crop&w=1200&q=80', dest: 'public/images/sections/hero-bg.jpg' },
  { url: 'https://images.unsplash.com/photo-1473649085228-583485e6e4d7?auto=format&fit=crop&w=1200&h=630&q=85', dest: 'public/og-image.jpg' },
  // Missing child images
  { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/ruth.jpg' },
  { url: 'https://images.unsplash.com/photo-1546938576-620c05f4d157?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/john.jpg' },
  { url: 'https://images.unsplash.com/photo-1545478092-40e1e37e77be?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/maria.jpg' },
  { url: 'https://images.unsplash.com/photo-1551554772-1be7f3d3fc3d?auto=format&fit=crop&w=600&q=80', dest: 'public/images/children/samuel.jpg' },
];

function fetchFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    function doGet(targetUrl) {
      get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doGet(res.headers.location);
        } else {
          pipeline(res, file).then(resolve).catch(reject);
        }
      }).on('error', reject);
    }
    doGet(url);
  });
}

mkdirSync('public/images/children', { recursive: true });
mkdirSync('public/images/sections', { recursive: true });
mkdirSync('public/images/logo', { recursive: true });

// Copy provided logo file into the right location
try {
  copyFileSync('openhearts_logo.png', 'public/images/logo/openhearts_logo.png');
  console.log('✓ public/images/logo/openhearts_logo.png (copied from project root)');
} catch {
  console.warn('⚠ Logo copy failed — manually place openhearts_logo.png at public/images/logo/openhearts_logo.png');
}

for (const { url, dest } of images) {
  try {
    await fetchFile(url, dest);
    console.log(`✓ ${dest}`);
  } catch (err) {
    console.error(`✗ ${dest}: ${err.message}`);
  }
}

console.log('\nDone. All images saved.');
