/* ============================================================
   TELA VIVA — comportamento da landing
   Vanilla ES modules. Cada init() é um componente isolado,
   portável 1:1 para React/Next quando o checkout próprio entrar.
   ============================================================ */

/* ─────────── Header: estado "stuck" após sair do hero ─────────── */
function initHeader() {
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  if (!header || !hero) return;

  const io = new IntersectionObserver(
    ([entry]) => header.setAttribute('data-stuck', String(!entry.isIntersecting)),
    { rootMargin: '-68px 0px 0px 0px', threshold: 0 }
  );
  io.observe(hero);
}

/* ─────────── Bifurcação B2C / B2B ───────────
   Grava a escolha em localStorage e rola para a seção correspondente.
   Quando houver backend, trocar por cookie httpOnly + render server-side. */
const PATH_KEY = 'telaviva:path';

function initPathSplit() {
  const cards = document.querySelectorAll('.path-card');
  if (!cards.length) return;

  let saved = null;
  try { saved = localStorage.getItem(PATH_KEY); } catch { /* storage bloqueado */ }

  const apply = (value) => {
    cards.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.path === value)));
    document.documentElement.setAttribute('data-audience', value);
  };

  if (saved) apply(saved);

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const value = card.dataset.path;
      apply(value);
      try { localStorage.setItem(PATH_KEY, value); } catch { /* noop */ }

      const target = document.getElementById(value === 'b2b' ? 'parceiros' : 'protocolo');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─────────── FAQ: um aberto por vez ─────────── */
function initFaq() {
  const items = document.querySelectorAll('.faq details');
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => { if (other !== item) other.open = false; });
    });
  });
}

/* ─────────── Depoimentos ───────────
   ⚠ COMPLIANCE: só renderiza com acervo REAL licenciado.
   Formato esperado de cada item:
   { image?, alt?, quote, name, studio?, city?, phase }
   image/studio/city são opcionais. Imagem: só recorte da tatuagem, sem rosto.
   Citação sempre literal, sem edição. Enquanto estiver vazio, a seção fica oculta. */
const TESTIMONIALS = [
  {
    quote: 'Usei a Pele Rara® em uma perna e um hidratante 3x mais caro na outra. O lado com Pele Rara® ficou claramente melhor e com menos dor.',
    name: 'Paula Carolina',
    phase: 'Pós-tatuagem · comparativo lado a lado',
  },
];

const escapeHtml = (v = '') => String(v).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function initTestimonials() {
  const section = document.querySelector('[data-component="TestimonialGrid"]');
  const grid = document.getElementById('testimonial-grid');
  if (!section || !grid) return;

  if (!TESTIMONIALS.length) {
    section.hidden = true;
    section.setAttribute('data-state', 'empty');
    return;
  }

  grid.innerHTML = TESTIMONIALS.map((t) => {
    const who = [t.name, t.studio, t.city].filter(Boolean).map(escapeHtml).join(' · ');
    const img = t.image
      ? `<img src="${escapeHtml(t.image)}" alt="${escapeHtml(t.alt)}" loading="lazy" />`
      : '';
    return `
    <figure class="testimonial">
      ${img}
      <figcaption class="testimonial-body">
        <blockquote class="testimonial-quote">“${escapeHtml(t.quote)}”</blockquote>
        <p class="testimonial-meta">${who}</p>
        <p class="testimonial-meta">${escapeHtml(t.phase)}</p>
      </figcaption>
    </figure>`;
  }).join('');

  section.hidden = false;
  section.setAttribute('data-state', 'ready');
}

/* ─────────── Canais de contato ───────────
   Preencher com os dados oficiais. whatsapp: só dígitos com DDI+DDD (ex.: 5511900000000).
   Enquanto vazio, o formulário NÃO simula envio e o botão de WhatsApp fica inativo. */
const CONTACT = { whatsapp: '5511914977007', email: 'settedistribuidora0777@gmail.com' };

const waLink = (text = '') =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/* ─────────── Máscaras + validação do formulário B2B ─────────── */
function maskCNPJ(value) {
  const d = value.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function maskPhone(value) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

/** Validação real dos dígitos verificadores do CNPJ (módulo 11). */
function isValidCNPJ(raw) {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;

  const check = (len) => {
    let sum = 0;
    let pos = len - 7;
    for (let i = 0; i < len; i++) {
      sum += Number(d[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  return check(12) === Number(d[12]) && check(13) === Number(d[13]);
}

function setFieldError(input, message) {
  const field = input.closest('.field');
  const error = field?.querySelector('[data-error-for]');
  const invalid = Boolean(message);

  field?.setAttribute('data-invalid', String(invalid));
  input.setAttribute('aria-invalid', String(invalid));
  if (error) {
    error.hidden = !invalid;
    if (message) error.textContent = message;
  }
}

function initPartnerForm() {
  const form = document.getElementById('partner-form');
  if (!form) return;

  const cnpj = form.querySelector('#cnpj');
  const phone = form.querySelector('#whatsapp');
  const status = document.getElementById('form-status');
  const submit = form.querySelector('button[type="submit"]');

  cnpj?.addEventListener('input', (e) => {
    e.target.value = maskCNPJ(e.target.value);
    setFieldError(e.target, '');
  });
  phone?.addEventListener('input', (e) => {
    e.target.value = maskPhone(e.target.value);
    setFieldError(e.target, '');
  });

  form.querySelectorAll('input, select').forEach((el) => {
    el.addEventListener('input', () => { if (el !== cnpj && el !== phone) setFieldError(el, ''); });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    let ok = true;

    form.querySelectorAll('[required]').forEach((el) => {
      if (!el.value.trim()) { setFieldError(el, el.dataset.required || 'Campo obrigatório.'); ok = false; }
    });

    if (cnpj?.value && !isValidCNPJ(cnpj.value)) {
      setFieldError(cnpj, 'CNPJ inválido. Confira os 14 dígitos.');
      ok = false;
    }
    if (phone?.value && phone.value.replace(/\D/g, '').length < 10) {
      setFieldError(phone, 'Informe um WhatsApp com DDD.');
      ok = false;
    }

    if (!ok) {
      status.dataset.kind = 'err';
      status.textContent = 'Revise os campos destacados.';
      form.querySelector('[data-invalid="true"] input, [data-invalid="true"] select')?.focus();
      return;
    }

    /* ── Envio ────────────────────────────────────────────────────
       Sem backend: o formulário abre o WhatsApp oficial com os dados
       preenchidos; o lead só existe quando o usuário toca em enviar.
       Sem canal configurado, não simulamos sucesso. */
    if (!CONTACT.whatsapp) {
      status.dataset.kind = 'err';
      status.textContent = 'Canal de contato em implantação. Seus dados não foram enviados.';
      return;
    }

    submit.dataset.busy = 'true';
    const label = submit.dataset.label || submit.textContent;
    submit.textContent = 'Abrindo o WhatsApp…';

    try {
      const v = (id) => form.querySelector(`#${id}`)?.value.trim() ?? '';
      const text = [
        'Olá! Quero informações sobre a revenda do Kit Tattoo.',
        `Estúdio: ${v('studio')}`,
        `CNPJ: ${v('cnpj')}`,
        `Nome: ${v('name')}`,
        `WhatsApp: ${v('whatsapp')}`,
        `Sessões por mês: ${form.querySelector('#volume')?.selectedOptions[0]?.textContent ?? ''}`,
      ].join('\n');

      const win = window.open(waLink(text), '_blank', 'noopener');
      if (!win) throw new Error('popup bloqueado');

      status.dataset.kind = 'ok';
      status.textContent = 'Abrimos o WhatsApp com os seus dados. É só enviar a mensagem.';
      form.reset();
    } catch {
      status.dataset.kind = 'err';
      status.textContent = 'Não conseguimos abrir o WhatsApp. Tente novamente ou use o botão "Falar no WhatsApp" abaixo.';
    } finally {
      submit.dataset.busy = 'false';
      submit.textContent = label;
    }
  });
}

/* ─────────── Reveal progressivo ─────────── */
function initReveal() {
  const targets = document.querySelectorAll(
    '.section .eyebrow, .section .h2, .section-lede, .path-card, .phase, .stat, .rigor, .kit-media, .kit-info, .table-scroll, .partner-form'
  );
  if (!targets.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  targets.forEach((el, i) => {
    el.setAttribute('data-reveal', '');
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.setAttribute('data-reveal', 'in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach((el) => io.observe(el));
}

/* ─────────── CTAs ainda sem destino ─────────── */
function initPendingLinks() {
  document.querySelectorAll('[data-pending="true"]').forEach((el) => {
    if (CONTACT.whatsapp) {
      el.href = waLink('Olá! Tenho uma dúvida sobre o protocolo Tela Viva.');
      el.target = '_blank';
      el.rel = 'noopener';
      el.removeAttribute('data-pending');
      return;
    }
    el.setAttribute('aria-disabled', 'true');
    el.addEventListener('click', (e) => e.preventDefault());
  });
}

function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* ─────────── Bootstrap ─────────── */
function boot() {
  initHeader();
  initPathSplit();
  initFaq();
  initTestimonials();
  initPartnerForm();
  initReveal();
  initPendingLinks();
  initYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
