// フロントは API の型（AppType）を得るためにワーカーのコードを読むが、
// Workers のランタイム型は DOM の型と衝突するので読み込まない。代わりに Env だけ仮に置く
// biome-ignore lint/suspicious/noExplicitAny: 型推論のための仮置き
type Env = Record<string, any>;
