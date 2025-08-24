// エイリアスがある場合（tsconfig の "@/ *"）
import EntriesWidget from '@/components/EntriesWidget';

// エイリアスが無ければ相対パスを使用（上とどちらか片方だけ）
// import EntriesWidget from '../../components/EntriesWidget';

export default function EntriesPage() {
  return (
    <main style={{ maxWidth: 840, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Entries（エピソード銀行）</h1>

      {/* 旧UIをいったん退避したいなら下をコメントアウト */}
      {/*
        ...ここに元のフォーム＆一覧のJSX...
      */}

      {/* 新UI（共有部品）を呼ぶだけ */}
      <EntriesWidget />
    </main>
  );
}
