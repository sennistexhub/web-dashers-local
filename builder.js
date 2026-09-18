const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_HTML = 'index.html';          // Your original template or source index.html
const OUTPUT_HTML = 'dist/index.html';    // Where the final bundled offline file will be saved

function bundleHtml() {
    if (!fs.existsSync(INPUT_HTML)) {
        console.error(`Error: Could not find ${INPUT_HTML}. Make sure builder.js is in the root directory.`);
        process.exit(1);
    }

    let htmlContent = fs.readFileSync(INPUT_HTML, 'utf8');

    // 1. Inline Stylesheets (<link rel="stylesheet" href="...">)
    const cssRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    htmlContent = htmlContent.replace(cssRegex, (match, filePath) => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            console.log(`[Inlining CSS] ${filePath}`);
            const cssData = fs.readFileSync(fullPath, 'utf8');
            return `<style>\n${cssData}\n</style>`;
        } else {
            console.warn(`[Warning] CSS file not found: ${filePath}`);
            return match;
        }
    });

    // 2. Inline JavaScript Scripts (<script src="..."></script>)
    const jsRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi;
    htmlContent = htmlContent.replace(jsRegex, (match, filePath) => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            console.log(`[Inlining JS] ${filePath}`);
            const jsData = fs.readFileSync(fullPath, 'utf8');
            // Using safe script block wrapping
            return `<script>\n/* --- Source: ${filePath} --- */\n${jsData}\n</script>`;
        } else {
            console.warn(`[Warning] JavaScript file not found: ${filePath}`);
            return match;
        }
    });

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_HTML);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write final bundled file
    fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
    console.log(`\nSuccess! Bundled offline game generated at: ${OUTPUT_HTML}`);
}

bundleHtml();
