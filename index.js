const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

//! Załóż w katalogu Csv-parser katalog input_files i do niego wrzuć pliki do konwersji
// ścieżka do konwertowanego pliku:
const filePath = 'input_files/test2.csv';

// ustawienia kolumn:
const settings = {
  delimiter: ',', // separator wartości w pliku csv
  columnShift: 0, // przesunięcie wszystkich kolumn (V, H) o index (bez współrzędnych) (jak nie ma 3 kolumn między współrzędnymi a V1 i H1 to wpisujesz -3)
  wspX: 3,
  wspY: 4,
  pairs: [
    [8, 9], // [V1, H1]
    [10, 11], // [V2, H2]
    [12, 13], // [V3, H3]
    [14, 15], // [V4, H4]
    [16, 17], // [V5, H5]
    // Dodaj następne jak potrzeba
  ],
  newFilePrefix: '', // prefix dla plików po konwersji (opcjonalnie żeby się nie myliły)
};

if (!fs.existsSync(path.join(__dirname, 'input_files/transformed'))) {
  fs.mkdirSync(path.join(__dirname, 'input_files/transformed'), { recursive: true });
}
const file = path.join(process.cwd(), filePath);
const input = [];
const output = [];
fs.createReadStream(file)
  .pipe(csv({ headers: false }))
  .on('data', (data) => input.push(data))
  .on('end', () => {
    console.log(`Przed konwersją: ${input.length} wierszy`);
    let counter = 0;

    input.forEach((row) => {
      const data = settings.pairs
        .map((e) => e.map((column) => column + settings.columnShift))
        .reduce((acc, array) => {
          const coordinates = [row[settings.wspX], row[settings.wspY]];
          const v = row[array[0]];
          const h = row[array[1]];

          if (v && h) {
            coordinates.push(v, h);
            counter++;
            return [...acc, coordinates.map((v) => '"' + v + '"').join(settings.delimiter)];
          }

          return acc;
        }, []);

      output.push(data.join('\n'));
    });

    console.log(`Po konwersji: ${counter} wierszy`);
    fs.writeFileSync(`./input_files/transformed/${settings.newFilePrefix}${filePath.split('/').pop()}`, output.join('\n'));
  });
