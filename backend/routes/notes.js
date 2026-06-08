const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const NOTES_FILE = path.join(__dirname, '../data/notes.json');

const readNotes = () => {
  try {
    const data = fs.readFileSync(NOTES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeNotes = (notes) => {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
};

// GET /api/notes/:customerId
router.get('/:customerId', authMiddleware, (req, res) => {
  const { customerId } = req.params;
  const notes = readNotes();
  const customerNotes = notes.filter((n) => n.customerId === customerId);
  res.json({ notes: customerNotes });
});

// POST /api/notes/:customerId
router.post('/:customerId', authMiddleware, (req, res) => {
  const { customerId } = req.params;
  const { text } = req.body;
  const { id: matchmakerId, name: matchmakerName } = req.matchmaker;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const notes = readNotes();
  const newNote = {
    id: `note_${Date.now()}`,
    customerId,
    matchmakerId,
    matchmakerName,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  notes.push(newNote);
  writeNotes(notes);

  res.status(201).json({ note: newNote });
});

// DELETE /api/notes/:noteId
router.delete('/:noteId', authMiddleware, (req, res) => {
  const { noteId } = req.params;
  const notes = readNotes();
  const filtered = notes.filter((n) => n.id !== noteId);
  writeNotes(filtered);
  res.json({ message: 'Note deleted' });
});

module.exports = router;
