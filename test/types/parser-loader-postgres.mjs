// This file loads the PostgreSQL parser using the standalone build files
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load the standalone PostgreSQL parser
const postgresParser = require(join(__dirname, '../../build/postgresql.js'));

// Create a simple Parser class that wraps the parse function
class ParserPostgres {
  astify(sql) {
    const result = postgresParser.parse(sql);
    return result.ast;
  }
}

export { ParserPostgres };
