// src/components/ui/CommentBox.tsx
import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentBoxProps {
  onSubmit: (comment: string) => void;
  placeholder?: string;
  authorName?: string;
  className?: string;
}

export const CommentBox: React.FC<CommentBoxProps> = ({
  onSubmit,
  placeholder = 'Add compliance log note or review comments...',
  authorName = 'Aarav Mehta',
  className = '',
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 text-xs ${className}`}>
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-full bg-brandNavy text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-1">
          {authorName.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="flex-1 relative">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2.5 bg-bgPage border border-borderColor rounded-md text-xs text-textPrimary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brandNavy focus:bg-white resize-none"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-textSecondary">
              Posting as <span className="font-semibold text-textPrimary">{authorName}</span>
            </span>
            <button
              type="submit"
              disabled={!text.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-brandNavy text-white text-xs font-semibold rounded hover:bg-blue-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Add Note</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
