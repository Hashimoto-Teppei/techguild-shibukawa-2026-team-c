# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root.
- **`docs/*.md`**: decision memos, one topic per file. Read the ones that touch the area you're about to work in.

Where decisions are recorded is defined in 「ドキュメント構成」 in `AGENTS.md`. Skills that default to ADRs (e.g. `/domain-modeling`) must write to `docs/<topic>.md` or `GLOSSARY.md` instead.

## File structure

Single-context repo:

```
/
├── GLOSSARY.md
├── docs/
│   ├── tech-stack.md
│   ├── public-url.md
│   └── ...
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts a memo in `docs/`, surface it explicitly rather than silently overriding:

> _Contradicts `docs/public-url.md` (public URL never changes), but worth reopening because…_
