---
name: Хранение memory в папке проекта
description: Для этого проекта memory хранится в .claude/memory/ внутри репозитория, а не в глобальной папке ~/.claude/
type: feedback
---

Все memory для проекта expence-tracker хранить в `/Users/v.lobyntsev/Desktop/TS/expence-tracker/.claude/memory/`, а не в глобальной `~/.claude/projects/`.

**Why:** Пользователь явно указал хранить memory в папке проекта, чтобы они были рядом с кодом.

**How to apply:** При записи любого нового memory файла использовать путь `.claude/memory/` внутри проекта и обновлять `.claude/memory/MEMORY.md` как индекс.
