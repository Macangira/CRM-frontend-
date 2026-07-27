import React, { useState } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered, Link, Quote, Code, Sparkles, AlertCircle
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write a detailed internal note...',
  minHeight = '140px'
}) => {
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  const applyFormat = (command: string, valueArg: string | undefined = undefined) => {
    document.execCommand(command, false, valueArg);
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList')
    });
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    onChange(html === '<br>' ? '' : html);
    updateActiveFormats();
  };

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-950/80 overflow-hidden focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all">
      {/* Rich Formatting Toolbar */}
      <div className="flex items-center flex-wrap gap-1 px-3 py-2 bg-zinc-900/90 border-b border-zinc-800/80 text-zinc-400">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className={`p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors ${
            activeFormats.bold ? 'bg-blue-500/20 text-blue-400 font-bold' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className={`p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors ${
            activeFormats.italic ? 'bg-blue-500/20 text-blue-400 italic' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => applyFormat('underline')}
          className={`p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors ${
            activeFormats.underline ? 'bg-blue-500/20 text-blue-400 underline' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => applyFormat('insertUnorderedList')}
          className={`p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors ${
            activeFormats.insertUnorderedList ? 'bg-blue-500/20 text-blue-400' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => applyFormat('insertOrderedList')}
          className={`p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors ${
            activeFormats.insertOrderedList ? 'bg-blue-500/20 text-blue-400' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => applyFormat('formatBlock', 'blockquote')}
          className="p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL link:');
            if (url) applyFormat('createLink', url);
          }}
          className="p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          title="Insert Link"
        >
          <Link className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable Canvas */}
      <div
        contentEditable
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onClick={updateActiveFormats}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ minHeight }}
        className="p-3 text-sm text-zinc-100 focus:outline-none leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-ul:list-disc prose-ol:list-decimal pl-4"
        data-placeholder={placeholder}
      />
    </div>
  );
};
