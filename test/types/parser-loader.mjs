// This file loads the parser using the standalone build files
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load the standalone MySQL parser
const mysqlParser = require(join(__dirname, '../../build/mysql.js'));

// Create a simple Parser class that wraps the parse function
class Parser {
  astify(sql) {
    const result = mysqlParser.parse(sql);
    return result.ast;
  }
}

export { Parser };
