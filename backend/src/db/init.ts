import fs from 'fs';
import path from 'path';
import pool from './connection';

export async function initDatabase() {
  try {
    // Try multiple possible paths for schema.sql
    const possiblePaths = [
      path.join(__dirname, 'schema.sql'),
      path.join(__dirname, '../db/schema.sql'),
      path.join(process.cwd(), 'dist/db/schema.sql'),
      path.join(process.cwd(), 'src/db/schema.sql'),
    ];

    let schemaSQL = '';
    let foundPath = '';

    for (const schemaPath of possiblePaths) {
      if (fs.existsSync(schemaPath)) {
        schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
        foundPath = schemaPath;
        break;
      }
    }

    if (!schemaSQL) {
      throw new Error(`Could not find schema.sql in any of these locations: ${possiblePaths.join(', ')}`);
    }

    console.log(`Loading schema from: ${foundPath}`);
    await pool.query(schemaSQL);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
