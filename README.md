# support-crm-frontend

Фронтенд саппорт-CRM поверх групових Telegram-чатів. Повна специфікація — див.
`tz-support-telegram-helpdesk.md` (розділи 13–14: екрани і дизайн; додається окремо, не в цьому
репозиторії). Бекенд — окремий репозиторій `crm-backendFF`, сюди не входить.

Стек: React + TypeScript + Vite + Tailwind CSS v4 + lucide-react, TanStack Query + Zustand,
Recharts, Socket.IO client, react-router-dom.

## Статус — початковий каркас

Це скелет, не готовий продукт. Зроблено:

- Глобальна навігація (Inbox / Чати / Аналітика / Нотифікації / Налаштування) + командна
  палітра Cmd/Ctrl-K (тільки навігація, без пошуку дій).
- Inbox: три панелі (список тредів / розмова / метадані) — верстка є, дані мокові
  (`src/lib/mock-data.ts`).
- Директорія чатів, аналітика (KPI-картки + один графік-заглушка), центр нотифікацій,
  налаштування — сторінки-заглушки.
- Світла/темна теми (`data-theme` на `<html>`, перемикач у навігації).
- `src/api/client.ts` / `src/api/socket.ts` — готові під `VITE_API_URL` / `VITE_WS_URL`,
  але ще нічого реально не викликає бекенд.

**Не зроблено:** жодного реального запиту до `crm-backendFF`, авторизації через Telegram Login
Widget (є тільки заглушка сторінки), react-query хуків замість мокових даних, codegen типів з
`/api/docs-json` (скрипт `npm run codegen` — заглушка з інструкцією). Це наступний крок, коли
бекенд підніметься до робочого REST/WS-стану.

## Запуск

```bash
cp .env.example .env
npm install
npm run dev
```

## Git-workflow для команди

Той самий підхід, що й у `crm-backendFF`: гілка `main` — завжди робочий стан, у неї напряму
не пушимо, кожен працює у власній гілці зі своїм іменем.

### 1. Створити свою гілку

```bash
git checkout main
git pull origin main
git checkout -b <своє_ім'я>   # своя гілка від актуального main, напр. Dima
```

### 2. Підтягнути свіжі зміни з main у свою гілку

Робити регулярно, а не тільки в кінці — так менше конфліктів:

```bash
git checkout main
git pull origin main
git checkout <своє_ім'я>
git merge main                # або: git rebase main
```

Якщо конфлікт — git покаже файли з конфліктом, треба відкрити їх, вибрати правильний варіант
(прибрати маркери `<<<<<<<`, `=======`, `>>>>>>>`), після чого:

```bash
git add <виправлені файли>
git merge --continue           # якщо merge; для rebase: git rebase --continue
```

### 3. Закинути свою роботу в main

```bash
git add <файли>
git commit -m "коротко що зробив"
git push origin <своє_ім'я>
```

Потім — Pull Request зі своєї гілки в `main` (не push напряму в `main`). Після мержу PR —
оновити свою локальну `main`:

```bash
git checkout main
git pull origin main
```

### Правила

- Не комітити `.env` (він і так у `.gitignore`).
- Один коміт — одна логічна зміна, повідомлення — що і навіщо.
- Перед PR — `npm run build` і `npm run lint` мають проходити локально.
