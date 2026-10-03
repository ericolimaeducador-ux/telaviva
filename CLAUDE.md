# Tela Viva — contexto do projeto (ler antes de qualquer tarefa)

Interlocutor: Erico (enfermeiro, sócio da 7Safe). PT-BR no texto; inglês em código, variáveis, commits e nomes de arquivo.
Tom: direto e técnico, sem rodeios de cortesia. Trade-off → opções com prós/contras em uma linha, depois recomendação.
Módulo novo → apresentar plano e esperar "ok" antes de codar.

## O que é
Landing page **Tela Viva — Cuidados para Pele Tatuada**. Erico é representante oficial da **Pele Rara®** (marca da Sympol Biotecnologia LTDA) para o segmento de tatuagem. Produto: Kit Tattoo (Espuma Facial de Sensação Ultra-Leve 150 ml, BioBloc + Hidratante Concentrado 60 g, BioCic®; antes era 30 g, trocado por decisão do Erico).
Diferencial: protocolo em 3 fases, com preparo ANTES da tatuagem.
Operadora: JSETTE7 Comércio de Produtos Médicos e Hospitalares LTDA, CNPJ 54.765.439/0001-34 (a marca é Tela Viva; o nome da empresa só aparece no rodapé/JSON-LD).
Objetivo no lançamento: **captação** (B2B estúdios + interessados). Sem checkout, sem preço publicado. Checkout próprio só depois.
Política de Privacidade em `politica-de-privacidade.html` (Vite multi-page), com link no formulário e no rodapé. Minuta v1.0, pendente de revisão jurídica; atualizar a lista de operadores sempre que mudar um fornecedor.

## Estado atual (main publicada)
URL: https://ericolimaeducador-ux.github.io/telaviva/ — deploy por GitHub Actions a cada push na `main`.
Hero: tipografia (lockup em HTML + título) sobre a pele clara desfocada com véu claro — decisão do Erico, não trocar por imagem com logo. As peles com a logo "tatuada" (imagens ILUSTRATIVAS de marca, rótulo "Imagem ilustrativa") entram só nas caixas de imagem de pele, hoje a seção "problema" (`tela-pele-problema.webp`). Nunca apresentá-las como resultado ou pele de cliente.
Feito: 11 seções; alegações corrigidas; depoimento da Paula Carolina (literal) + 3 imagens autorizadas da Pele Rara em `public/img/pele-rara-*.webp`; contato oficial; rodapé com razão social/CNPJ; SEO + Open Graph + JSON-LD + robots/sitemap + favicons PNG; fontes self-hosted (@fontsource); paleta pastel.
Formulário B2B: envia o lead por e-mail e abre o WhatsApp com mensagem pré-preenchida (canais independentes). Envio: função própria `worker/` (Cloudflare Worker + Resend + Turnstile; segredos só em GitHub Secrets) quando `LEAD_API` em `src/main.js` estiver preenchido; até lá, fallback Web3Forms. Ver `worker/README.md`.

## Design (travado)
- Pastel claro, sem cores pesadas, sem starbursts, sem gradientes chamativos. Tinta `#16140F` só em texto, logo e botões.
- Tokens: sand-050 `#FBF7F1`, sand-100 `#F2EADF`, sand-200 `#E3D5C3`, blush `#F3DFD3`, sage `#DCE5D6`, oat `#EFE6D8`. `sand-400` nunca em texto.
- Tipografia: Playfair Display (display), Inter (corpo), JetBrains Mono (mono). Raios 8/12/16/24, sombra sutil, 200 ms/300 ms.
- Símbolo: onda da junção dermo-epidérmica com cápsula de anel duplo (corte histológico: a tinta fica na derme). Assets em `public/brand/`.
- WCAG AA: contraste ≥ 4,5:1, alvos ≥ 44 px, `prefers-reduced-motion` respeitado.
- Referência visual aprovada: mockup do Google Flow (hero pêssego, cards blush/sálvia, fase do meio em destaque).

## Compliance — regras inegociáveis
- Nenhuma alegação terapêutica (queloide, infecção, hematoma, "cicatriza", "desbota/não desbota", "reativa a cor").
- Proibido sem documento do fabricante: "vegano", "cruelty-free", "dermatologicamente testado", nº ANVISA, "troca 30 dias", "envio rastreado", prazos de resposta. Hoje estão removidos ou comentados no HTML (FAQ de ANVISA e vegano). Nunca inventar número de registro, métrica ou estudo.
- Evidência da BioCic® é **ex vivo** (Pereira Oliveira et al., Pharmaceutics 2023, DOI 10.3390/pharmaceutics15030999). Sempre dizer que não é eficácia clínica nem em pele tatuada.
- Protocolo = o do fabricante (decisão do Erico, 03/10/2026): 2 semanas antes (espuma a cada banho + hidratante 4x/dia na região e ao redor); 15 dias após a sessão (lavar a tatuagem com a espuma ao menos 2x/dia + hidratante 4x/dia na pele AO REDOR, nunca sobre crosta/ferida); depois manutenção 1–2x/dia. Sobre tatuagem em cicatrização valem tatuador/dermatologista. O texto oficial cita "evitar infecção e queloides", "reverter hematomas" e "regeneração": NUNCA repetir no site (alegação de tratamento em cosmético).
- O Kit Tattoo traz só a Espuma Facial de Sensação Ultra-Leve 150 ml (confirmado pelo Erico; a Espuma Suave de Amplo Espectro, com clorexidina, NÃO é do kit). O protocolo oficial menciona a Espuma/Sabonete de Amplo Espectro na 1ª semana antes e no pós: pendente confirmar com a Pele Rara que a Ultra-leve serve nessas fases.
- Nunca mostrar partículas atravessando pele lesionada.
- Depoimentos: reais, autorizados, citação literal, **sem rosto** (só recorte da tatuagem). O da Paula Carolina foi concedido à Pele Rara®: manter a marca e a linha de origem ("Depoimento concedido à Pele Rara®, com uso autorizado."); nunca editar nem atribuir à Tela Viva. Sem rosto ou antes/depois gerados por IA.
- Produtos e rótulos da Pele Rara® nunca recebem a marca Tela Viva. Tela Viva é a loja/representante; onde se fala do produto, do protocolo ou da comparação, a marca é **Pele Rara®** (ex.: coluna da tabela comparativa). Imagens do fabricante só com o crédito e sem alteração do conteúdo (exceto recorte para tirar rosto).
- Ilustrações de mecanismo levam "representação ilustrativa".
- "O único protocolo que começa antes da agulha" é afirmação absoluta do Erico: manter, mas ele deve guardar a pesquisa que a sustenta.

## Stack e armadilhas
Vite 5, HTML/CSS/JS puros (ES modules). `vite.config.js` → `base: '/telaviva/'`.
- Vite reescreve caminhos absolutos em HTML, mas NÃO em `url()` de CSS: imagens de CSS ficam em `src/assets/` (relativas); imagens de `<img>` em `public/`.
- Em ambiente de nuvem o navegador de teste bloqueia localhost; conferência visual é do Erico.
- Sem segredos no código. `.env*` fora do git. Telefone/e-mail públicos são só os do `CONTACT`.

## Fluxo de trabalho
Branch → build (`npm run build`) → PR → merge na `main` (squash) → Actions publica. Commits em inglês, convencional (`feat:`, `fix:`).
Se o clone local divergir: `git fetch && git reset --hard origin/main` (SVGs soltos na raiz são duplicatas de `public/brand/`).

## Pendências (do Erico)
Originais em alta resolução das imagens Pele Rara (hoje 600 px); protocolo vigente por escrito; documento do fabricante para vegano/cruelty-free/dermatologicamente testado e nº ANVISA; confirmar que o estudo descreve a plataforma BioCic®; preço/margem; autorização por escrito da Paula Carolina para o site; busca INPI "Tela Viva" (NCL 3 e 35); domínio próprio (então: `base: '/'`, canonical, og:image, robots); foto oficial do kit completo; e-mail no domínio próprio; CNAE varejista se houver venda ao consumidor.

## Próximos passos sugeridos (pedir "ok" antes)
1. Revisão visual: já conferida por screenshots (Chromium headless via Playwright Python + `vite preview`), que funciona mesmo quando o navegador do MCP bloqueia localhost.
2. (feito) imagens otimizadas; sobram `public/brand/emblema.*` como fonte de marca, fora das páginas.
3. Analytics sem cookie, só com decisão do Erico; hoje `data-track` não é lido por nada.
4. Quando houver acervo real: preencher `TESTIMONIALS` em `src/main.js` (campos: quote, name, phase; image/studio/city opcionais).
5. Depois: checkout próprio (Next/React, componentes já isolados em `init*`) — Tech Lead propõe antes.

## Foto do kit
`public/img/kit-tattoo-*.webp`: cena gerada (braço tatuado, sem rosto) com os rótulos aplicados a partir dos arquivos oficiais da Pele Rara (bisnaga: render oficial do Hidratante Concentrado 2X 60 g; espuma: texto da caixa oficial). Legenda "Imagem ilustrativa". Nunca gerar rótulo por IA: renders com microtexto corrompido não servem de fonte.

## Depoimento da Paula
Card com citação + 2 fotos lado a lado, legendas exatamente como na página da Pele Rara® ("Com Pele Rara®" = figura feminina; "Sem Pele Rara®" = tigre). `public/img/depo-paula-*.webp`. A foto do tigre saiu de um print (287 px): trocar pelo arquivo original `dep-tattoo-paula-pelerara.svg` quando o Erico enviar.
