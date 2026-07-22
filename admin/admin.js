const API = window.location.origin;
const TOKEN_KEY = 'guia-ceara-admin-token';

const schemas = {
  places: {
    title: 'Territórios', singular: 'território',
    fields: [['name', 'Nome', 'text', true], ['city', 'Cidade', 'text'], ['region', 'Região', 'text', true], ['description', 'Resumo', 'textarea', true], ['longDescription', 'Texto completo', 'textarea'], ['tags', 'Tags separadas por vírgula', 'text'], ['image', 'Fotografia autoral', 'file']],
  },
  stories: {
    title: 'Histórias e vídeos', singular: 'história',
    fields: [['person', 'Nome da pessoa', 'text', true], ['role', 'Ofício ou identificação', 'text'], ['place', 'Localidade', 'text', true], ['excerpt', 'Frase de destaque', 'textarea'], ['text', 'História completa', 'textarea', true], ['readTime', 'Tempo de leitura', 'text'], ['videoCaption', 'Legenda do vídeo', 'text'], ['image', 'Fotografia de capa', 'file'], ['video', 'Vídeo com áudio (até 150 MB)', 'file']],
  },
  events: {
    title: 'Agenda cultural', singular: 'evento',
    fields: [['title', 'Título', 'text', true], ['day', 'Dia', 'text', true], ['month', 'Mês', 'text', true], ['time', 'Horário', 'time'], ['place', 'Espaço cultural', 'text'], ['city', 'Cidade', 'text', true], ['category', 'Categoria', 'text'], ['free', 'Evento gratuito', 'checkbox']],
  },
};

let token = sessionStorage.getItem(TOKEN_KEY);
let content = { places: [], stories: [], events: [] };
let activeType = 'places';

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const mediaUrl = value => value?.startsWith('/') ? `${API}${value}` : value;

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API}${path}`, { ...options, headers });
  if (response.status === 401 && path !== '/api/auth/login') {
    logout('Sua sessão expirou. Entre novamente.');
    throw new Error('Sessão expirada.');
  }
  const body = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || 'Não foi possível concluir a operação.');
  return body;
}

function showLogin(message = '') {
  $('#login-view').hidden = false;
  $('#dashboard-view').hidden = true;
  $('#login-error').textContent = message;
}

async function openDashboard(session) {
  $('#login-view').hidden = true;
  $('#dashboard-view').hidden = false;
  $('#user-email').textContent = session?.user?.email || '';
  content = await request('/api/admin/content');
  render();
}

function logout(message = '') {
  token = null;
  sessionStorage.removeItem(TOKEN_KEY);
  showLogin(message);
}

function flash(message, error = false) {
  const box = $('#flash');
  box.textContent = message;
  box.classList.toggle('flash-error', error);
  box.hidden = false;
  setTimeout(() => { box.hidden = true; }, 4500);
}

function render() {
  const schema = schemas[activeType];
  $('#page-title').textContent = schema.title;
  $('#form-title').textContent = `Nova ${schema.singular}`;
  $('#content-count').textContent = `${content[activeType].length} conteúdos publicados`;
  document.querySelectorAll('.nav-button').forEach(button => button.classList.toggle('active', button.dataset.type === activeType));
  $('#content-list').innerHTML = content[activeType].map(item => card(item)).join('') || '<div class="empty">Nenhum conteúdo publicado nesta seção.</div>';
  document.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => removeContent(button.dataset.delete)));
}

function card(item) {
  const title = activeType === 'places' ? item.name : activeType === 'stories' ? item.person : item.title;
  const subtitle = activeType === 'events' ? `${item.day} ${item.month} · ${item.city}` : item.place || item.region;
  const visual = activeType === 'events'
    ? `<div class="date-card"><strong>${escapeHtml(item.day)}</strong><span>${escapeHtml(item.month)}</span></div>`
    : `<img src="${escapeHtml(mediaUrl(item.image))}" alt="" />`;
  const video = item.video ? `<video controls preload="metadata" src="${escapeHtml(mediaUrl(item.video))}"></video><span class="media-badge">Vídeo com áudio</span>` : '';
  return `<article class="content-card">${visual}<div class="card-body"><p class="card-type">${escapeHtml(schemas[activeType].singular)}</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(subtitle)}</p>${video}</div><button class="delete" data-delete="${escapeHtml(item.id)}" aria-label="Remover ${escapeHtml(title)}">Excluir</button></article>`;
}

function buildForm() {
  $('#form-fields').innerHTML = schemas[activeType].fields.map(([name, label, type, required]) => {
    if (type === 'textarea') return `<label class="wide">${label}<textarea name="${name}" ${required ? 'required' : ''}></textarea></label>`;
    if (type === 'file') return `<label class="upload ${name === 'video' ? 'wide' : ''}"><span>${label}</span><input name="${name}" type="file" accept="${name === 'video' ? 'video/*' : 'image/*'}" /><small>${name === 'video' ? 'MP4, WebM ou MOV. O áudio original será preservado.' : 'JPG, PNG, WebP ou arquivo da câmera.'}</small></label>`;
    if (type === 'checkbox') return `<label class="checkbox"><input name="${name}" type="checkbox" value="true" /><span>${label}</span></label>`;
    return `<label>${label}<input name="${name}" type="${type}" ${required ? 'required' : ''} /></label>`;
  }).join('');
}

async function removeContent(id) {
  if (!confirm('Remover este conteúdo definitivamente?')) return;
  try {
    await request(`/api/admin/content/${activeType}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    content[activeType] = content[activeType].filter(item => item.id !== id);
    render();
    flash('Conteúdo removido.');
  } catch (error) { flash(error.message, true); }
}

$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  $('#login-error').textContent = '';
  try {
    const result = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: $('#email').value, password: $('#password').value }) });
    token = result.token;
    sessionStorage.setItem(TOKEN_KEY, token);
    await openDashboard(result);
  } catch (error) { $('#login-error').textContent = error.message; }
  finally { button.disabled = false; }
});

$('#content-nav').addEventListener('click', event => {
  const button = event.target.closest('[data-type]');
  if (!button) return;
  activeType = button.dataset.type;
  $('#editor').hidden = true;
  render();
});

$('#open-form').addEventListener('click', () => { buildForm(); $('#editor').hidden = false; $('#editor').scrollIntoView({ behavior: 'smooth' }); });
$('#close-form').addEventListener('click', () => { $('#editor').hidden = true; });
$('#cancel-form').addEventListener('click', () => { $('#editor').hidden = true; });
$('#logout').addEventListener('click', () => logout());

$('#content-form').addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  if (activeType === 'events' && !formData.has('free')) formData.set('free', 'false');
  const submit = event.currentTarget.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const created = await request(`/api/admin/content/${activeType}`, { method: 'POST', body: formData });
    content[activeType].unshift(created);
    event.currentTarget.reset();
    $('#editor').hidden = true;
    render();
    flash('Conteúdo publicado no aplicativo.');
  } catch (error) { flash(error.message, true); }
  finally { submit.disabled = false; }
});

(async function bootstrap() {
  if (!token) return showLogin();
  try { const session = await request('/api/admin/session'); await openDashboard(session); }
  catch { showLogin('Sua sessão expirou. Entre novamente.'); }
})();
