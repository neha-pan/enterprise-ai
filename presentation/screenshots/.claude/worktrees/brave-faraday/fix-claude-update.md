# Fix Claude Code Auto-Update

## Step 1: Remove the old installation

```bash
rm -rf ~/.nvm/versions/node/v24.12.0/lib/node_modules/@anthropic-ai/claude-code
```

## Step 2: Remove any temporary/failed update directories

```bash
rm -rf ~/.nvm/versions/node/v24.12.0/lib/node_modules/@anthropic-ai/.claude-code-*
```

## Step 3: Reinstall Claude Code

```bash
npm i -g @anthropic-ai/claude-code
```

## Step 4: Verify installation

```bash
claude --version
```

---

**Note:** If you get permission errors, you may need to prefix commands with `sudo`.
