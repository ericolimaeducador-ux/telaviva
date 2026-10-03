# telaviva-leads — Cloudflare Worker

Recebe o formulário B2B da landing (`POST /lead`), valida (CNPJ, campos, honeypot),
confere o Cloudflare Turnstile e envia o lead por e-mail via Resend. Não grava nem
registra dados do lead (logs só com códigos de erro).

## Configuração (uma vez)

1. **Turnstile** (Cloudflare → Turnstile → Add widget): domínio `ericolimaeducador-ux.github.io`,
   modo *Managed*. Guarde a **site key** (pública) e a **secret key** (secreta).
2. **Resend**: conta criada com `settedistribuidora0777@gmail.com` (sem domínio verificado,
   o Resend só entrega a partir de `onboarding@resend.dev` para o e-mail dono da conta).
   Crie uma API key com permissão *Sending access*.
3. **Token da Cloudflare**: My Profile → API Tokens → template *Edit Cloudflare Workers*.
   Anote também o **Account ID** (painel da conta).
4. **Segredos no GitHub** (repo → Settings → Secrets and variables → Actions):
   `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `RESEND_API_KEY`, `TURNSTILE_SECRET`.
   Nunca colar essas chaves em chat, código ou issue.
5. Rodar o workflow **Deploy lead worker** (Actions → Run workflow). A URL sai no log:
   `https://telaviva-leads.<subdominio>.workers.dev`.
6. Em `src/main.js` → `LEAD_API`: `endpoint` = URL acima + `/lead`; `turnstileSiteKey` = site key.
7. Teste real no site; confirmado o recebimento, remover o bloco `WEB3FORMS` e a menção ao
   Web3Forms na Política de Privacidade.

## Desenvolvimento

`npm run test:worker` (testes com `node:test`, sem dependências).
CORS: só as origens em `ALLOWED_ORIGINS` (`wrangler.toml`). Domínio próprio: adicionar lá.
Rate limit por IP: binding opcional comentado no `wrangler.toml`; o Turnstile já barra robôs.
