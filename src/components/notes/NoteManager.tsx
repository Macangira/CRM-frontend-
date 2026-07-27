import React, { useState, useEffect } from 'react';
import { Note } from '../../types';
import { noteService } from '../../services/crmServices';
import { RichTextEditor } from './RichTextEditor';
import { Button } from '../ui/button';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/avatar';
import {
  Pin, Trash2, Edit3, Plus, Sparkles, AlertTriangle, FileText, CheckCircle2, Clock
} from 'lucide-react';

export interface NoteManagerProps {
  relatedToId: string;
  relatedType?: 'customer' | 'deal' | 'lead' | 'company';
  title?: string;
}

export const NoteManager: React.FC<NoteManagerProps> = ({
  relatedToId,
  relatedType = 'customer',
  title = 'Internal Account Notes & Activity History'
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editorContent, setEditorContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const data = await noteService.getNotes(relatedToId);
      // Sort pinned notes to top
      const sorted = [...data].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));
      setNotes(sorted);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (relatedToId) {
      loadNotes();
    }
  }, [relatedToId]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorContent.trim() || editorContent === '<br>') return;
    setIsSubmitting(true);

    try {
      if (editingNote) {
        await noteService.updateNote(editingNote.id, {
          context: editorContent,
          relatedTo: relatedToId,
          isPinned
        });
      } else {
        await noteService.createNote({
          context: editorContent,
          relatedTo: relatedToId,
          customerId: relatedToId,
          isPinned
        });
      }

      setEditorContent('');
      setEditingNote(null);
      setIsPinned(false);
      await loadNotes();
    } catch (err) {
      console.error('Note Save Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await noteService.togglePin(note.id, Boolean(note.isPinned));
      await loadNotes();
    } catch (err) {
      console.error('Toggle Pin Error:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      await noteService.deleteNote(noteToDelete.id);
      setNoteToDelete(null);
      await loadNotes();
    } catch (err) {
      console.error('Delete Note Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rich Text Editor Form */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-400" />
            {editingNote ? 'Editing Internal Note' : 'Add New Note Record'}
          </h4>
          {editingNote && (
            <button
              onClick={() => {
                setEditingNote(null);
                setEditorContent('');
                setIsPinned(false);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline"
            >
              Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={handleSaveNote} className="space-y-3">
          <RichTextEditor
            value={editorContent}
            onChange={setEditorContent}
            placeholder="Type intuitive meeting summary, call log, or strategic client updates..."
            minHeight="120px"
          />

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pin-note-checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-950 text-blue-500 focus:ring-blue-500 w-4 h-4"
              />
              <label htmlFor="pin-note-checkbox" className="text-xs font-semibold text-zinc-300 flex items-center gap-1 cursor-pointer select-none">
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                Pin Note to Top
              </label>
            </div>

            <Button type="submit" isLoading={isSubmitting} size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              {editingNote ? 'Update Note' : 'Post Note Record'}
            </Button>
          </div>
        </form>
      </div>

      {/* Notes Stream Feed */}
      <div className="space-y-3">
        {notes.length === 0 && !isLoading && (
          <div className="p-8 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
            <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No notes recorded yet for this record.</p>
          </div>
        )}

        {notes.map(note => (
          <div
            key={note.id}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              note.isPinned
                ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={note.authorName || 'User'} size="sm" />
                <div>
                  <div className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                    <span>{note.authorName || 'Team Member'}</span>
                    {note.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Pin className="w-2.5 h-2.5 fill-amber-300" /> Pinned
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleTogglePin(note)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    note.isPinned
                      ? 'text-amber-400 bg-amber-500/20 hover:bg-amber-500/30'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                  title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingNote(note);
                    setEditorContent(note.content);
                    setIsPinned(Boolean(note.isPinned));
                  }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 transition-colors"
                  title="Edit Note"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setNoteToDelete(note)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Formatted HTML Content */}
            <div
              dangerouslySetInnerHTML={{ __html: note.content }}
              className="mt-3 text-xs text-zinc-300 leading-relaxed prose prose-invert max-w-none pl-1"
            />
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {noteToDelete && (
        <Modal
          isOpen={!!noteToDelete}
          onClose={() => setNoteToDelete(null)}
          title="Confirm Delete Note Record"
          description="Are you sure you want to permanently remove this note record?"
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setNoteToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Confirm Delete
              </Button>
            </div>
          }
        >
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <span>This action is permanent and will delete this internal note from the account history.</span>
          </div>
        </Modal>
      )}
    </div>
  );
};
