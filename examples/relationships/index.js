import input from './input.json';
import fs from 'fs';
import { normalize } from '../../src';
import path from 'path';
import postsSchema from './schema';

const normalizedData = normalize(input, postsSchema);
const output = JSON.stringify(normalizedData, null, 2);
fs.writeFileSync(path.resolve(__dirname, './output.json'), output);
