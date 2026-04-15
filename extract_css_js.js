const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\-Vip-23\\Desktop\\safe-herbs-portfolio';
const cssDir = path.join(dir, 'css');
const jsDir = path.join(dir, 'js');

if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir);
if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir);

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const baseName = path.basename(file, '.html');
    
    // Extract <style>
    const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch;
    let cssContent = '';
    let hasStyle = false;
    
    while ((styleMatch = styleRegex.exec(content)) !== null) {
        cssContent += styleMatch[1] + '\n';
        hasStyle = true;
    }
    
    if (hasStyle && cssContent.trim().length > 0) {
        const cssFileName = `${baseName.replace(/\s+/g, '_')}.css`;
        fs.writeFileSync(path.join(cssDir, cssFileName), cssContent.trim());
        // Replace all style tags with a single link tag
        content = content.replace(styleRegex, '');
        // Find </head> and insert link
        // since we removed it, we just insert the link before </head>
        content = content.replace('</head>', `<link rel="stylesheet" href="css/${cssFileName}">\n</head>`);
    }

    // Extract inline <script> that do not have src
    const scriptRegex = /<script\b(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    let jsContent = '';
    let hasScript = false;
    
    while ((scriptMatch = scriptRegex.exec(content)) !== null) {
        if(scriptMatch[1].trim().length > 0) {
            jsContent += scriptMatch[1] + '\n';
            hasScript = true;
        }
    }
    
    if (hasScript && jsContent.trim().length > 0) {
        const jsFileName = `${baseName.replace(/\s+/g, '_')}.js`;
        fs.writeFileSync(path.join(jsDir, jsFileName), jsContent.trim());
        content = content.replace(scriptRegex, '');
        // Find </body> and insert script
        content = content.replace('</body>', `<script src="js/${jsFileName}"></script>\n</body>`);
    }

    // Write back HTML
    fs.writeFileSync(filePath, content);
    console.log(`Processed ${file}`);
});
