import React, { useState, useEffect } from "react";
import { getAll, addItem, deleteItem, NOTES_STORE } from "../utils/indexedDB";

export default function StickyNotes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    getAll(NOTES_STORE).then(setNotes);
  }, []);

  const addNote = async () => {
    if (!newNote.trim()) return;
    const note = { text: newNote };
    await addItem(NOTES_STORE, note);
    setNotes(await getAll(NOTES_STORE));
    setNewNote("");
  };

  const removeNote = async (id) => {
    await deleteItem(NOTES_STORE, id);
    setNotes(await getAll(NOTES_STORE));
  };

  return (
    <div className="section notes-section">
      <h2>📝 Notes</h2>
      <div className="input-group">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
        ></textarea>
        <button onClick={addNote}>Add</button>
      </div>
      <div className="notes">
        {notes.map((note) => (
          <div key={note.id} className="note">
            <button className="delete-btn top-right" onClick={() => removeNote(note.id)}>✖</button>
            <p>{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
