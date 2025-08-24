'use client';
import { useEffect, useState } from 'react';

type Entry = {
  id: number;
  title: string | null;
  markdown: string;
  created_at: string; // ISO文字列
};

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

export default function EntriesPage() {
  const [items, setItems] = useState<Entry[]>([]);
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/entries', { cache: 'no-store' });
    const json = await res.json();
    if (json.ok) setItems(json.items as Entry[]);
    else alert(json.error ?? '読み込みに失敗しました');
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!markdown.trim()) { alert('markdown は必須です'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, markdown }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? '保存に失敗しました');
      setTitle('');
      setMarkdown('');
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ maxWidth: 840, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Entries</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <label>
          <div style={{ fontSize: 12, opacity: 0.8 }}>タイトル（任意）</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例）初回メモ"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 6 }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, opacity: 0.8 }}>本文（markdown）</div>
          <textarea
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            placeholder="ここに本文を入力"
            rows={8}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 6 }}
          />
        </label>

        <button
          disabled={saving}
          style={{
            padding: '0.6rem 1rem',
            border: '1px solid #222',
            borderRadius: 6,
            background: saving ? '#eee' : '#fff',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? '保存中…' : '保存'}
        </button>
      </form>

      <ul style={{ display: 'grid', gap: '0.75rem' }}>
        {items.map(it => (
          <li key={it.id} style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: '0.75rem' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {new Date(it.created_at).toLocaleString()}
            </div>
            <h2 style={{ margin: '0.25rem 0 0.5rem' }}>{it.title || '無題'}</h2>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{it.markdown}</pre>
          </li>
        ))}
      </ul>
    </main>
  );
}
