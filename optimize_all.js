const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\-Vip-23\\Desktop\\safe-herbs-portfolio';
const jsDir = path.join(dir, 'js');

// 1. Optimize JS Files (GPU Cursor + Cleanup)
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
jsFiles.forEach(file => {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace various iterations of cursor animation
    let didChange = false;

    // Pattern 1: $cur.style.left = mx + 'px';
    const pat1 = /\$cur\.style\.left\s*=\s*mx\s*\+\s*'px';\s*\$cur\.style\.top\s*=\s*my\s*\+\s*'px';/g;
    if (pat1.test(content)) {
        content = content.replace(pat1, `$cur.style.transform = \`translate3d(\${mx}px, \${my}px, 0)\`;`);
        didChange = true;
    }

    // Pattern 2: $ring.style.left = rx + 'px';
    const pat2 = /\$ring\.style\.left\s*=\s*rx\s*\+\s*'px';\s*\$ring\.style\.top\s*=\s*ry\s*\+\s*'px';/g;
    if (pat2.test(content)) {
        content = content.replace(pat2, `$ring.style.transform = \`translate3d(\${rx}px, \${ry}px, 0)\`;`);
        didChange = true;
    }
    
    // Pattern 3: Template literals
    const pat3 = /\$cur\.style\.left\s*=\s*`\$\{mx\}px`;\s*\$cur\.style\.top\s*=\s*`\$\{my\}px`;/g;
    if (pat3.test(content)) {
        content = content.replace(pat3, `$cur.style.transform = \`translate3d(\${mx}px, \${my}px, 0)\`;`);
        didChange = true;
    }
    
    const pat4 = /\$ring\.style\.left\s*=\s*`\$\{rx\}px`;\s*\$ring\.style\.top\s*=\s*`\$\{ry\}px`;/g;
    if (pat4.test(content)) {
        content = content.replace(pat4, `$ring.style.transform = \`translate3d(\${rx}px, \${ry}px, 0)\`;`);
        didChange = true;
    }

    // Pattern 5: Minified inline
    const pat5 = /\$cur\.style\.left=mx\+'px';\$cur\.style\.top=my\+'px';\$ring\.style\.left=rx\+'px';\$ring\.style\.top=ry\+'px';/g;
    if (pat5.test(content)) {
        content = content.replace(pat5, `$cur.style.transform=\`translate3d(\${mx}px, \${my}px, 0)\`;$ring.style.transform=\`translate3d(\${rx}px, \${ry}px, 0)\`;`);
        didChange = true;
    }

    if (didChange) {
        fs.writeFileSync(filePath, content);
        console.log(`Optimized JS: ${file}`);
    }
});

// 2. Optimize HTML Files (Images, lazy load)
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
htmlFiles.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let didChange = false;

    // Convert Unsplash to WebP
    if (content.includes('fm=jpg') || content.includes('fm=jpeg')) {
        content = content.replace(/fm=jpg/g, 'fm=webp').replace(/fm=jpeg/g, 'fm=webp');
        didChange = true;
    }

    // Add lazy loading to <img> if missing
    // We parse <img> tags and add loading="lazy" if neither eager nor lazy is present, unless it has hero-img class
    const imgRegex = /<img\b([^>]*)>/g;
    content = content.replace(imgRegex, (match, attrs) => {
        if (!attrs.includes('loading=') && !attrs.includes('hero-img')) {
            attrs += ' loading="lazy"';
        }
        if (!attrs.includes('decoding=')) {
            attrs += ' decoding="async"';
        }
        return `<img ${attrs.trim()}>`;
    });
    didChange = true; // For safety, we just write it if we ran the replace

    if (didChange) {
        fs.writeFileSync(filePath, content);
        console.log(`Optimized HTML images: ${file}`);
    }
});
