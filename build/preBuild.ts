import * as fs from 'fs';

let generatedTS = `// Auto-Generated file. Do not touch
// To add a parser add a file to the parsers directory
// Built by using a pre-build script

`;

const paths = fs.readdirSync('./src/parsers');
for (const file of paths) {
  const [ name ] = file.split('.');
  generatedTS += `export { default as ${name} } from './parsers/${name}';\n`;
}

fs.writeFileSync('./src/parsers.ts', generatedTS);
