"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addNote, deleteNote } from "@/actions/applications";

export default function NotesPanel({ applicationId, notes, currentUserId, isAdmin }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(event) {
    event.preventDefault();
    setError("");
    start(async () => {
      const result = await addNote(applicationId, content);
      if (result.ok) setContent("");
      else setError(result.message);
    });
  }

  function remove(id) {
    setError("");
    start(async () => {
      const result = await deleteNote(id);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div>
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="note" className="sr-only">
          Internal note
        </label>
        <textarea
          id="note"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Add an internal note (not visible to the applicant)"
          className="field-control"
        />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending || !content.trim()} className="btn btn-primary btn-sm">
          Add note
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {notes.length === 0 && <li className="text-sm text-on-surface-variant">No notes yet.</li>}
        {notes.map((note) => (
          <li key={note.id} className="rounded-2xl bg-surface-container-low p-4">
            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant">
              <span>
                {note.authorName} · {note.createdLabel}
              </span>
              {(note.authorId === currentUserId || isAdmin) && (
                <button
                  type="button"
                  onClick={() => remove(note.id)}
                  disabled={pending}
                  aria-label="Delete note"
                  className="rounded p-1 hover:bg-white hover:text-red-700"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}