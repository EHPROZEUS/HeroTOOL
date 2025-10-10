const fs = require('fs');
const postcss = require('postcss');
const tailwindcss = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

async function build() {
  const inputPath = 'src/index.css';
  const outputPath = 'src/tailwind.generated.css';

  const css = fs.readFileSync(inputPath, 'utf8');

  const result = await postcss([tailwindcss('./tailwind.config.cjs'), autoprefixer]).process(css, { from: inputPath });

  // ensure src exists (it already does) and write into src
  fs.mkdirSync('src', { recursive: true });
  fs.writeFileSync(outputPath, result.css, 'utf8');
  console.log('Wrote', outputPath);
}

build().catch(err => { console.error(err); process.exit(1); });
