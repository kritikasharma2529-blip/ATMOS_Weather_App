const fs = require('fs');
const path = require('path');

function findMapFiles(dir, files = []) {
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== 'cache') {
          findMapFiles(fullPath, files);
        }
      } else if (file.endsWith('.map')) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

const mapFiles = findMapFiles('.next');
console.log('Found map files:', mapFiles.length);

for (const mapFile of mapFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
    if (data.sources) {
      const idx = data.sources.findIndex(s => s && s.includes('WeatherCalendar.tsx'));
      if (idx !== -1 && data.sourcesContent && data.sourcesContent[idx]) {
        fs.writeFileSync('components/weather/WeatherCalendar.tsx', data.sourcesContent[idx], 'utf8');
        console.log('Successfully recovered WeatherCalendar.tsx from:', mapFile);
        process.exit(0);
      }
    }
  } catch (e) {}
}
console.log('Could not find WeatherCalendar.tsx in sourcemaps.');
