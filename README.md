# Guia Cultural do Ceará

Plataforma cultural gratuita para preservar e divulgar fotografias, histórias, vídeos e eventos do Ceará. A solução separa completamente a experiência pública da área editorial:

- **Aplicativo público:** React Native/Expo para Android, iOS e web/PWA. Não possui login nem qualquer acesso administrativo.
- **Painel administrativo:** aplicação web independente, acessível somente pelo fotógrafo autenticado.
- **API:** servidor Express responsável por autenticação JWT, conteúdo público, publicações protegidas e upload de arquivos.

## Arquitetura

```text
┌──────────────────────┐       GET /api/content       ┌──────────────────────┐
│ App público          │ ────────────────────────────▶ │ API Express           │
│ Android · iOS · PWA  │       sem autenticação       │ conteúdo + uploads    │
└──────────────────────┘                               └──────────┬───────────┘
                                                                  │ JWT obrigatório
┌──────────────────────┐   login/publicação/upload                 │
│ Painel do fotógrafo  │ ─────────────────────────────────────────┘
│ /admin               │   Authorization: Bearer <token>
└──────────────────────┘
```

O app público não contém link, aba, tela ou código do painel. Ocultar um botão não seria segurança: as rotas de escrita também são protegidas no servidor, que valida assinatura, emissor, público e expiração do JWT.

## Funcionalidades do aplicativo público

### Início

Apresenta o propósito do projeto, territórios em destaque, histórias selecionadas e os próximos eventos culturais.

### Explorar

Permite pesquisar cidades, praias, regiões e manifestações culturais. Os filtros atuais incluem Litoral, Serra, Capital e Cariri. Cada território possui fotografia, descrição, tags, quantidade de registros e histórias relacionadas.

### Agenda cultural

Reúne eventos das localidades registradas e de espaços culturais de Fortaleza, com filtros por categoria, data, local, horário e indicação de gratuidade.

### Histórias

Apresenta retratos, ofícios, depoimentos e histórias de vida. Uma história pode conter:

- fotografia de capa;
- frase de destaque e texto completo;
- vídeo com áudio;
- legenda do vídeo;
- controles nativos de reprodução, volume e tela cheia.

O registro de Dona Maria inclui um MP4 público de demonstração com áudio. Ele existe somente para testar o player e deve ser substituído por material autoral antes do lançamento.

## Painel administrativo separado

O painel fica em `http://localhost:4000/admin/` e não faz parte da navegação do aplicativo público.

Ele permite ao fotógrafo:

- entrar com e-mail e senha;
- criar territórios com fotografia autoral;
- publicar histórias com fotografia e vídeo com áudio;
- cadastrar eventos culturais;
- visualizar o vídeo antes/depois da publicação;
- excluir publicações;
- encerrar a sessão administrativa.

Imagens e vídeos enviados são armazenados em `server/uploads/`. Vídeos têm limite de 150 MB e precisam usar um MIME type `video/*`; imagens precisam usar `image/*`.

### Credenciais de desenvolvimento

```text
E-mail: fotografo@guiaceara.com.br
Senha:  FotoCeara@2026
```

Essas credenciais são apenas para teste local. Em produção, configure outras credenciais no arquivo `.env` e nunca publique a senha.

## Fluxo de autenticação JWT

1. O painel envia e-mail e senha para `POST /api/auth/login`.
2. A API compara a senha com um hash bcrypt.
3. Com credenciais válidas, a API emite um JWT assinado com validade de oito horas.
4. O painel guarda o token em `sessionStorage`, portanto ele não permanece após o encerramento completo da sessão do navegador.
5. Cada leitura administrativa, publicação ou exclusão envia `Authorization: Bearer <token>`.
6. A API verifica assinatura, expiração, emissor e público antes de autorizar a operação.
7. Tokens ausentes, alterados ou expirados recebem HTTP 401 e o painel retorna ao login.

A API também bloqueia temporariamente um endereço após cinco tentativas inválidas de login. Para produção, use HTTPS, uma chave JWT longa, rate limiting persistente, logs de auditoria e um provedor de segredos.

## API

### Rotas públicas

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/api/health` | Verificação de disponibilidade |
| `GET` | `/api/content` | Conteúdo consumido pelo app, sem login |
| `POST` | `/api/auth/login` | Autenticação exclusiva do fotógrafo |
| `GET` | `/media/:arquivo` | Entrega de imagens e vídeos publicados |

### Rotas protegidas por JWT

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/api/admin/session` | Validação da sessão atual |
| `GET` | `/api/admin/content` | Conteúdo para gestão editorial |
| `POST` | `/api/admin/content/:type` | Publicação com upload multipart |
| `DELETE` | `/api/admin/content/:type/:id` | Exclusão de conteúdo e arquivo local |

Os tipos aceitos são `places`, `stories` e `events`.

## Executar localmente

Requer Node.js 20 ou superior.

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar a API e o painel

Em um terminal:

```bash
npm run api
```

Endereços:

- API: `http://localhost:4000`
- Painel administrativo: `http://localhost:4000/admin/`

### 3. Iniciar o aplicativo público

Em outro terminal:

```bash
npm run web
```

Aplicativo web: `http://localhost:8081`

Para celular, execute `npm start`, leia o QR Code com o Expo Go ou use `a` para Android. Em um dispositivo físico, crie `.env` com a URL da máquina na rede local:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```

Substitua o IP pelo endereço local do computador. O emulador Android usa `http://10.0.2.2:4000` como padrão.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```env
API_PORT=4000
JWT_SECRET=uma-chave-aleatoria-longa-e-secreta
ADMIN_EMAIL=fotografo@seudominio.com.br
ADMIN_PASSWORD_HASH=hash-bcrypt-da-senha
ADMIN_ORIGIN=https://admin.seudominio.com.br
EXPO_PUBLIC_API_URL=https://api.seudominio.com.br
```

Gere o hash bcrypt sem armazenar a senha em texto puro:

```bash
node -e "console.log(require('bcryptjs').hashSync('SUA-SENHA-FORTE', 12))"
```

Sem `.env`, o servidor usa as credenciais de desenvolvimento e mostra um aviso explícito no terminal.

## Estrutura do projeto

```text
FotoClick/
├── App.js                     # aplicativo público e player de vídeo
├── src/
│   ├── contentStore.js        # consumo da API pública com fallback
│   └── data.js                # conteúdo de fallback/demonstração
├── admin/
│   ├── index.html             # login e painel administrativo
│   ├── admin.js               # sessão JWT, formulários e uploads
│   └── styles.css             # interface responsiva do painel
├── server/
│   ├── index.js               # API, autenticação e upload
│   ├── data/content.json      # persistência editorial atual
│   └── uploads/               # mídias enviadas, fora do Git
├── public/
│   ├── manifest.json          # metadados da PWA
│   ├── sw.js                  # cache offline
│   └── icon.svg               # ícone provisório
├── app.json                   # Expo, Android e iOS
├── eas.json                   # perfis de build das lojas
└── .env.example               # configuração sem segredos reais
```

## PWA

A versão web registra `public/sw.js` e `public/manifest.json`. Para gerar a versão de produção:

```bash
npx expo export --platform web
```

Hospede `dist/` em um domínio HTTPS. `localhost` é aceito durante desenvolvimento. O service worker mantém o shell do aplicativo e recursos já acessados em cache.

## Publicação nas lojas

O projeto possui perfis no `eas.json` e identificadores iniciais em `app.json`:

- Android: `br.com.guiaculturaldoceara.app`
- iOS: `br.com.guiaculturaldoceara.app`

```bash
npm install --global eas-cli
eas login
eas build --platform android --profile production
eas build --platform ios --profile production
```

O envio efetivo exige contas Google Play Console e Apple Developer, política de privacidade, ficha das lojas, classificação indicativa, ícones e screenshots definitivos.

## Evoluções necessárias para produção

A separação de responsabilidades e a proteção JWT já estão implementadas. Antes de operar publicamente:

- trocar fotografias e vídeo demonstrativos pelo acervo autorizado;
- mover `content.json` para PostgreSQL ou outro banco transacional;
- mover uploads para S3, Cloudflare R2 ou serviço equivalente;
- servir API e painel exclusivamente por HTTPS;
- configurar backup, auditoria e monitoramento;
- adicionar renovação/revogação de tokens e recuperação segura de senha;
- restringir CORS ao domínio administrativo real;
- aplicar rate limiting persistente, antivírus e transcodificação nos uploads;
- recolher autorizações de uso de imagem, voz e vídeo;
- testar acessibilidade, legendas, diferentes redes e dispositivos.

## Estado atual

O app público funciona sem login; o painel é separado e exige JWT; a API rejeita acesso administrativo sem token; imagens e vídeos podem ser publicados pelo fotógrafo; histórias reproduzem vídeo com áudio; e a versão web continua instalável como PWA.
