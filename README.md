# Tela Viva — Cuidados para Pele Tatuada

Landing page da Tela Viva, representante oficial Pele Rara® para o segmento de tatuagem.

## Rodar

```bash
npm install
npm run dev      # servidor local
npm run build    # gera dist/
npm run preview  # confere o build
```

## Deploy

Push na `main` dispara o workflow `.github/workflows/deploy.yml`, que builda e publica no GitHub Pages.

**Configuração única:** GitHub → Settings → Pages → Source → **GitHub Actions**.

URL de produção: `https://ericolimaeducador-ux.github.io/telaviva/`
(definida em `vite.config.js` → `base`). Ao migrar para domínio próprio, trocar `base` para `'/'`.

## Estrutura

```
index.html              11 seções da landing
src/style.css           design system (tokens) + componentes
src/main.js             comportamento, um init() por componente
src/assets/             imagens referenciadas em CSS (o Vite reescreve o caminho)
public/img/             fotos de pele e produto
public/brand/           emblema, ícone, lockup, faixa, favicon
```

### Por que duas pastas de imagem

O Vite reescreve caminhos absolutos no HTML quando `base` está definido, mas **não** dentro de
`url()` no CSS. Imagens usadas em CSS ficam em `src/assets/` e são referenciadas relativamente.
Imagens usadas em `<img>` ficam em `public/`.

## Design system

| Token | Valor | Uso |
|---|---|---|
| `--ink-900` | `#16140F` | texto, CTA primário, traço do emblema |
| `--ink-600` | `#3D362C` | texto secundário |
| `--sand-050` | `#FBF7F1` | fundo principal |
| `--sand-100` | `#F2EADF` | seções alternadas |
| `--sand-200` | `#E3D5C3` | bordas e divisores |
| `--sand-400` | `#B9A892` | **apenas** filete, ícone e borda — reprova em WCAG AA para texto |

Display: Playfair Display · Corpo: Inter · Mono: JetBrains Mono.

## Pendências antes de ir ao ar

- [ ] **Protocolo vigente por escrito** da equipe científica Pele Rara
- [ ] **Licença de uso** do acervo de depoimentos reais e das fotos oficiais de produto
- [ ] **Margem e preço** de venda — o bloco de preço está em `data-state="pending"`
- [ ] **WhatsApp e e-mail** oficiais (buscar `data-pending="true"` e os `TODO` no HTML)
- [ ] **Razão social e CNPJ** no rodapé
- [ ] **Foto real do Kit Tattoo** em `public/img/kit.jpg` (hoje é placeholder)
- [ ] Busca INPI classes 3 e 35 para a marca "Tela Viva"

## Regras de conteúdo (não negociáveis)

1. **Depoimentos**: apenas reais, com autorização escrita. Rosto, tatuagem ou antes/depois
   gerados por IA são publicidade enganosa (CDC art. 37). A seção fica oculta enquanto
   `TESTIMONIALS` em `src/main.js` estiver vazio.
2. **Alegações**: a tecnologia é coadjuvante de barreira cutânea. Nunca afirmar que previne
   queloide ou infecção, nem que reverte hematoma. A evidência BioCic® é de mecanismo em modelo
   ex vivo — não de eficácia clínica final, e o site precisa dizer isso.
3. **Protocolo**: três fases, com a fase 2 (lavagem e pele ao redor, nunca sobre crosta ou ferida) sempre visível.
4. **Ilustração de mecanismo**: qualquer peça que explique a ação do produto leva legenda
   "representação ilustrativa", e nunca mostra partícula atravessando pele lesionada.
