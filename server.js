
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

// ES Module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'fbb_database.json');
const LOCK_PATH = path.join(__dirname, 'database.lock');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.static(__dirname));

// Helper to check for lock file
const isLocked = async () => {
    try {
        await fs.access(LOCK_PATH);
        return true;
    } catch {
        return false;
    }
};

// API Routes
app.get('/api/database', async (req, res) => {
    try {
        if (await isLocked()) {
            return res.status(503).send('Database is being updated. Please try again.');
        }
        const data = await fs.readFile(DB_PATH, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading database:', error);
        res.status(500).send('Error reading database file.');
    }
});

app.post('/api/database', async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).send('No data provided.');
        }
        // Create lock file
        await fs.writeFile(LOCK_PATH, '');
        // Write to database
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        res.status(200).send('Database updated successfully.');
    } catch (error) {
        console.error('Error writing to database:', error);
        res.status(500).send('Error writing to database file.');
    } finally {
        // Always remove lock file
        try {
            await fs.unlink(LOCK_PATH);
        } catch (e) {
            // Ignore if file doesn't exist, etc.
        }
    }
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(port, () => {
  console.log(`Fifth Baptist Bank server running at http://localhost:${port}`);
  console.log('---');
  console.log('To start, run the following commands in your terminal:');
  console.log('1. npm install');
  console.log('2. npm start');
  console.log('---');
});
