# Transformando Vidas

## Sobre o projeto

Site acadêmico de Desenvolvimento Front-End para a **ONG fictícia Transformando Vidas**, consolidado a partir de quatro experiências práticas. Apresenta iniciativas de educação, voluntariado e doações e um formulário de interesse. Não representa uma ONG real e não recebe inscrições em servidor.

## Tecnologias e estrutura

HTML5, CSS3, JavaScript Vanilla ES6 Modules, localStorage, Vite e Git/GitHub. Playwright é usado somente em desenvolvimento, para testes.

```text
index.html          Entrada da SPA, cabeçalho e rodapé
html/               Conteúdos de início, projetos e cadastro
css/style.css       Design System, Grid, Flexbox e responsividade
imagens/            Fotografias WebP com fallback JPG
js/app.js           Inicialização
js/router.js        Hash routing, histórico e foco
js/templates.js     Fragmentos HTML e cards dinâmicos
js/events.js        Eventos, navegação, contraste e feedback
js/validation.js    Máscaras e validação
js/storage.js       Armazenamento local
tests/navegador.cjs  Verificação no navegador
```

Os fragmentos HTML são importados como texto pelo Vite e incluídos na build. Não são páginas independentes. A entrada pública é `index.html`, com rotas por hash.

## Funcionalidades

- SPA com `#inicio`, `#projetos` e `#cadastro`, histórico e fallback para início.
- Cards gerados a partir de array, Template Literals, `map()` e `join()`.
- Menu mobile e dropdown utilizáveis por mouse, toque e teclado.
- Formulário com labels, fieldsets, required, tipos de input, patterns e máscaras de CPF, telefone e CEP.
- Validação JavaScript, mensagens próximas dos campos e estados acessíveis.
- Badges, alertas, toast e modal nativo com Escape e retorno de foco.
- Alto contraste com preferência persistida.
- Layout de 12 colunas, Flexbox e breakpoints em 480, 768, 1024, 1280 e 1440px.

### Privacidade e limites

Somente a forma de participação é salva na chave `cadastros`, por exemplo `{ "participacao": "voluntariado" }`. Nome, CPF, e-mail, telefone, nascimento e endereço **não são armazenados nem enviados**. A preferência visual usa a chave `alto-contraste`.

CPF, telefone e CEP são verificados apenas por formato; não há validação matemática de CPF. Dados corrompidos são tratados como lista vazia; falhas de gravação produzem aviso, sem confirmação falsa de sucesso. localStorage é específico do navegador/origem e não oferece transação entre abas: envios simultâneos podem perder um registro. Não há back-end, autenticação, API externa ou banco de dados.

## Execução local

Requer Node.js 22.12 ou superior e npm.

```sh
git clone https://github.com/leodds21/AP-Dev-front-end-ONG-.git
cd AP-Dev-front-end-ONG-
npm install
npm run dev
```

Abra o endereço exibido pelo Vite. Para verificar a versão de produção:

```sh
npm run build
npm run preview
```

Não abra `index.html` por `file://`; os módulos dependem do servidor de desenvolvimento ou dos arquivos gerados em `dist/`.

## Testes

Com `npm run dev` ativo e Google Chrome instalado, em outro terminal execute:

```sh
npm test
```

O script usa o Chrome através do Playwright. `CHROME_PATH` permite indicar outro executável; `BROWSER_CHANNEL` permite selecionar outro canal suportado. Para testar a build com `npm run preview` ativo, defina `BASE_URL` para o endereço de preview:

```powershell
$env:BASE_URL = 'http://127.0.0.1:4173'
npm test
```

Em shells POSIX: `BASE_URL=http://127.0.0.1:4173 npm test`.

A suíte verifica rotas, histórico, recarga, cards, máscaras, dados inválidos/válidos, persistência e falhas de armazenamento, menus, teclado, modal, contraste e layouts em 320, 375, 390, 480, 768, 1024, 1280 e 1440px. Capturas de verificação ficam em `test-results/`, fora do Git. Prints e exportações acadêmicas anteriores também não fazem parte da publicação.

Na consolidação final, a suíte passou em desenvolvimento e no preview de produção, sem erros de console. `npm run build`, verificações de sintaxe e `git diff --check` passaram; `npm audit` não encontrou vulnerabilidades nas dependências instaladas.

## Acessibilidade

O projeto foi desenvolvido e revisado com base nas diretrizes WCAG 2.1 nível AA. Usa HTML semântico, `lang="pt-BR"`, textos alternativos, labels e legendas, mensagens associadas aos campos, link para pular ao conteúdo e foco visível. Menus comunicam expansão; o modal usa `<dialog>` nativo. Há alto contraste e respeito a `prefers-reduced-motion`.

Os pares principais de texto são verificados em ambos os temas para razão mínima de 4.5:1. Isso não representa certificação ou auditoria formal de conformidade integral; testes com leitores de tela e diferentes navegadores continuam recomendados.

## Versionamento

`main` contém a versão integrada e `develop` reúne a consolidação. Branches `feature/*` podem ser usadas quando houver uma funcionalidade real separada; não são criadas apenas para aumentar o histórico. Os commits seguem Conventional Commits. O histórico começa pelo registro da base existente, sem inventar etapas passadas.

## Deploy

Pronto para importação na Vercel: selecione Vite, use `npm run build` e o diretório de saída `dist`. As rotas usam hash, portanto não necessitam de rewrites ou `vercel.json`. Nenhuma URL de deploy é declarada antes de uma publicação efetiva.

Repositório: [leodds21/AP-Dev-front-end-ONG-](https://github.com/leodds21/AP-Dev-front-end-ONG-).
