# Hub4Fun

Hub de jogos no navegador em React + Vite, com visual de arcade retrô.

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção em dist/
```

## Cadastrar um jogo

Edite `src/data/games.json`:

```json
{
  "id": "meu-jogo",
  "title": "Meu Jogo",
  "subtitle": "Opcional",
  "url": "https://exemplo.com",
  "genre": "FPS",
  "steamAppId": 70,
  "wikipedia": "Half-Life (video game)"
}
```

Depois rode `npm run covers` para baixar a capa automaticamente (Steam primeiro e, se não achar, Wikipedia).
As capas ficam em `public/covers/` e o campo `cover` é preenchido sozinho. Use `npm run covers -- --force` para baixar todas de novo.
Jogo sem capa ganha uma arte gerada a partir do nome.
