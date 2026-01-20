"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Link as LinkIcon, List } from "react-feather";

interface TemplateEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TemplateEditor({ content, onChange }: TemplateEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  const setLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "8px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          style={{
            padding: "6px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: editor.isActive("bold") ? "#e5e7eb" : "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title="Bold"
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          style={{
            padding: "6px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: editor.isActive("italic") ? "#e5e7eb" : "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={setLink}
          style={{
            padding: "6px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: editor.isActive("link") ? "#e5e7eb" : "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title="Link"
        >
          <LinkIcon size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            padding: "6px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: editor.isActive("bulletList") ? "#e5e7eb" : "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{
            padding: "6px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: editor.isActive("orderedList") ? "#e5e7eb" : "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          title="Ordered List"
        >
          1.
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{
            padding: "6px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: editor.isActive("heading", { level: 2 }) ? "#e5e7eb" : "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={{
            padding: "6px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: editor.isActive("heading", { level: 3 }) ? "#e5e7eb" : "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Character count */}
      <div
        style={{
          padding: "8px",
          borderTop: "1px solid #e5e7eb",
          fontSize: "12px",
          color: "#6b7280",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{editor.storage.characterCount?.characters() || 0} caracteres</span>
        <span>{editor.storage.characterCount?.words() || 0} palabras</span>
      </div>
    </div>
  );
}
