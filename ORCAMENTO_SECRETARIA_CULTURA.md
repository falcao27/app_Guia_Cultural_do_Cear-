# Orçamento técnico — Guia Cultural do Ceará

**Proponente:** a preencher  
**Contratante:** Secretaria de Cultura — a preencher  
**Prazo estimado de implantação:** 5 meses  
**Período de operação incluído:** 12 meses após o lançamento  
**Validade deste orçamento:** 30 dias  
**Data-base:** julho de 2026

## 1. Objeto

Desenvolvimento, implantação e sustentação inicial de uma plataforma cultural gratuita composta por:

- aplicativo público para Android, iOS e web/PWA, sem necessidade de cadastro do visitante;
- acervo fotográfico de cidades e praias do Ceará;
- publicação de histórias com texto, fotografia, vídeo e áudio;
- agenda cultural;
- painel web restrito ao fotógrafo/editor;
- autenticação administrativa segura;
- API, banco de dados, armazenamento de mídias, backups e monitoramento;
- publicação e acompanhamento nas lojas Google Play e Apple App Store.

## 2. Premissas utilizadas

Este orçamento considera:

- até 10 localidades na primeira fase;
- acervo inicial de até 2.000 fotografias otimizadas;
- até 100 vídeos, com média de 500 MB por arquivo;
- aproximadamente 100 GB de mídia no primeiro ano, com capacidade orçada para crescimento até 250 GB;
- até 20.000 usuários mensais;
- um fotógrafo/editor com acesso ao painel;
- aplicativo gratuito, sem venda ou assinatura;
- câmbio de segurança de **R$ 6,00 por US$ 1,00**, incluindo margem para oscilação cambial e cobrança internacional;
- uma hora técnica no valor competitivo de **R$ 100,00**.

Mudanças relevantes no volume de vídeos, usuários simultâneos, equipe editorial ou funcionalidades exigem revisão do orçamento.

## 3. Desenvolvimento do aplicativo e da plataforma

| Etapa | Entregas principais | Horas | Valor |
|---|---|---:|---:|
| Descoberta e especificação | Requisitos, arquitetura, fluxos, critérios de aceite e cronograma | 32 h | R$ 3.200,00 |
| UX/UI e acessibilidade | Design mobile-first, painel web, componentes e testes de legibilidade | 56 h | R$ 5.600,00 |
| Aplicativo público | Início, exploração, busca, filtros, agenda, histórias e navegação | 120 h | R$ 12.000,00 |
| Painel administrativo | Login, gestão de territórios, histórias, eventos, imagens e vídeos | 72 h | R$ 7.200,00 |
| Backend e segurança | API, JWT, permissões, validação, banco, logs e proteção de rotas | 96 h | R$ 9.600,00 |
| Pipeline de mídia | Upload, imagens responsivas, vídeo com áudio, CDN e limites | 48 h | R$ 4.800,00 |
| PWA e funcionamento offline | Manifesto, service worker, instalação e cache | 24 h | R$ 2.400,00 |
| Qualidade | Testes funcionais, dispositivos, desempenho, correções e homologação | 48 h | R$ 4.800,00 |
| DevOps e publicação | Produção, domínio, HTTPS, backups e preparação das lojas | 40 h | R$ 4.000,00 |
| **Total de implantação** | **536 horas técnicas** | **536 h** | **R$ 53.600,00** |

O valor remunera a construção de um produto publicável e sustentável, não somente a montagem de telas. Inclui arquitetura, segurança, testes, implantação e documentação técnica essencial. Não há cobrança por treinamento do fotógrafo.

## 4. Hospedagem, banco de dados e servidor

Valores abaixo representam a configuração recomendada para o primeiro ano.

| Item | Serviço de referência | Custo estimado mensal | Custo estimado anual |
|---|---|---:|---:|
| Hospedagem web/PWA | Cloudflare Pages | R$ 0,00 | R$ 0,00 |
| Servidor da API | DigitalOcean, 2 GB RAM/1 vCPU, US$ 12/mês | R$ 72,00 | R$ 864,00 |
| Backup do servidor | 20% do valor do servidor | R$ 14,40 | R$ 172,80 |
| Banco PostgreSQL gerenciado | Supabase Pro, US$ 25/mês | R$ 150,00 | R$ 1.800,00 |
| Armazenamento de fotos e vídeos | Cloudflare R2, reserva para até 250 GB | R$ 30,00 | R$ 360,00 |
| Build e atualização dos aplicativos | Expo EAS Starter, US$ 19/mês | R$ 114,00 | R$ 1.368,00 |
| Domínio `.br` | Reserva de registro e renovação | — | R$ 50,00 |
| Google Play Console | Taxa única de US$ 25 | — | R$ 150,00 |
| Apple Developer Program | US$ 99 por ano | — | R$ 594,00 |
| **Total estimado no primeiro ano** |  |  | **R$ 5.358,80** |

Para apresentação orçamentária, recomenda-se arredondar essa rubrica para **R$ 6.000,00 no primeiro ano**, mantendo R$ 641,20 como reserva para câmbio, operações extras de armazenamento e pequenas variações de consumo.

### O que cada item paga

**Hospedagem web/PWA:** entrega a versão acessada pelo navegador. O plano gratuito é suficiente no cenário inicial, mas a rubrica precisa existir porque o projeto pode exigir migração ou recursos pagos no futuro.

**Servidor da API:** mantém login administrativo, autenticação, publicação, leitura do conteúdo e regras de negócio disponíveis 24 horas. Um servidor de 2 GB é mais seguro que o plano mínimo para Node.js e picos moderados.

**Banco de dados:** armazena cidades, histórias, agenda, usuários administrativos, permissões e metadados das mídias. O plano Pro evita pausa por inatividade e inclui backups diários por sete dias.

**Armazenamento de mídia:** guarda os arquivos pesados fora do servidor da API. Isso evita travamentos e permite servir fotografias e vídeos com maior eficiência. O R2 inclui 10 GB gratuitos e cobra US$ 0,015 por GB/mês acima disso, sem cobrança direta de saída para a internet.

**Expo EAS:** gera os pacotes Android/iOS e facilita atualizações. O plano gratuito pode atender durante testes, mas o Starter oferece fila prioritária e crédito para builds, sendo mais adequado a um cronograma institucional.

## 5. Manutenção e sustentação

| Serviço mensal | Quantidade | Valor mensal | Valor anual |
|---|---:|---:|---:|
| Atualizações de segurança e dependências | 4 h | R$ 400,00 | R$ 4.800,00 |
| Monitoramento, backups e disponibilidade | 2 h | R$ 200,00 | R$ 2.400,00 |
| Correções e compatibilidade Android/iOS | 3 h | R$ 300,00 | R$ 3.600,00 |
| Suporte editorial e pequenos ajustes | 3 h | R$ 300,00 | R$ 3.600,00 |
| **Total de manutenção** | **12 h/mês** | **R$ 1.200,00** | **R$ 14.400,00** |

Horas não utilizadas não acumulam. Novas funcionalidades e mudanças de escopo são orçadas separadamente.

## 6. Resumo financeiro recomendado

| Grupo | Valor |
|---|---:|
| Desenvolvimento e implantação | R$ 53.600,00 |
| Infraestrutura e licenças — 12 meses | R$ 6.000,00 |
| Manutenção e suporte — 12 meses | R$ 14.400,00 |
| Treinamento do fotógrafo | Sem cobrança |
| **Valor total recomendado para o primeiro ano** | **R$ 74.000,00** |

### Valor recomendado para envio

**R$ 74.000,00**, incluindo construção, implantação, infraestrutura, licenças e manutenção por 12 meses. O treinamento do fotógrafo não será cobrado.

Caso impostos de emissão da nota fiscal não estejam incorporados à sua hora técnica, eles devem ser adicionados conforme o regime tributário do proponente. Não utilize um percentual genérico sem confirmar com a contabilidade.

## 7. Alternativas de escopo

| Cenário | Conteúdo | Faixa recomendada no primeiro ano |
|---|---|---:|
| Essencial | PWA, painel, API, banco e manutenção reduzida; sem lojas | R$ 48.000 a R$ 58.000 |
| Recomendado | Android, iOS, PWA, painel, vídeos, infraestrutura e 12 meses de suporte | **R$ 74.000** |
| Ampliado | Maior tráfego, transcodificação profissional, analytics avançado, mais editores e SLA | R$ 90.000 a R$ 120.000 |

O cenário recomendado é o mais coerente com uma entrega institucional e com a continuidade do acervo após o lançamento.

## 8. Despesas que não estão incluídas

- viagens, hospedagem, alimentação e transporte da equipe de campo;
- cachês, produção cultural e contratação de entrevistados;
- equipamentos fotográficos, áudio, vídeo, iluminação e seguros;
- edição do acervo, tratamento individual de fotografias, legendagem e transcrição;
- assessoria jurídica, termos de uso, política de privacidade e autorizações de imagem;
- identidade visual institucional completa;
- campanhas de mídia paga, assessoria de imprensa e lançamento presencial;
- tradução para outros idiomas;
- funcionalidades novas solicitadas após a aprovação do escopo.

Essas despesas devem aparecer em rubricas separadas no orçamento cultural, para não consumir a verba destinada ao desenvolvimento e à operação tecnológica.

## 9. Cronograma financeiro sugerido

| Marco | Percentual | Valor sobre implantação |
|---|---:|---:|
| Assinatura e início | 20% | R$ 10.720,00 |
| Aprovação de arquitetura e design | 20% | R$ 10.720,00 |
| Entrega do app e painel para homologação | 30% | R$ 16.080,00 |
| Publicação e entrada em produção | 20% | R$ 10.720,00 |
| Aceite final e entrega técnica | 10% | R$ 5.360,00 |

Infraestrutura e taxas podem ser pagas diretamente pelo contratante ou reembolsadas mediante comprovantes. A manutenção deve ser faturada mensalmente após o lançamento.

## 10. Observações para contratação pública

- contas de nuvem, domínio e lojas devem preferencialmente pertencer à Secretaria ou à entidade proponente, evitando dependência do desenvolvedor;
- a titularidade do código, das credenciais e do acervo deve constar no contrato;
- o aceite deve ser baseado em entregas verificáveis, não somente na publicação nas lojas, pois Apple e Google controlam o prazo de análise;
- o orçamento deve prever acessibilidade, LGPD, backup, suporte e atualização; retirar essas rubricas reduz o preço, mas aumenta o risco institucional;
- serviços cobrados em dólar podem variar, por isso foi adotado câmbio orçamentário superior à conversão à vista.
