# Tema NPD · FAU UFRJ para AtoM (`arNpdFauPlugin`)

Tema minimalista (inspirado no design gráfico suíço) para o acervo do **Núcleo de Pesquisa e Documentação da Faculdade de Arquitetura e Urbanismo da UFRJ (NPD · FAU UFRJ)** no [AtoM (Access to Memory)](https://github.com/artefactual/atom).

---

## O que tem neste repositório

1. **Protótipo estático** (`index.html`, `css/theme.css`, `js/theme.js`, `js/data.js`, `img/`):
   Para abrir direto no navegador sem precisar do AtoM instalado.
2. **Plugin instalável no AtoM 2.7+** (`arNpdFauPlugin/`):
   Baseado diretamente no tema padrão **`arDominionB5Plugin`**, pronto para rodar em **todas as páginas** do AtoM (página inicial, descrições arquivísticas, busca avançada, entidades custodiadoras, assuntos, locais, login e administração), com modo claro e modo noturno.

---

## Como testar no servidor AtoM sem quebrar o sistema

O plugin **não altera nenhum arquivo do core nem do `arDominionB5Plugin`**, e **não precisa compilar Webpack/Node no servidor**. Ele estende `arDominionB5PluginConfiguration` e injeta os estilos e scripts por cima do tema padrão.

### Passo 1 — Clonar e copiar/linkar o plugin na pasta `plugins/` do AtoM

```bash
cd /tmp
git clone https://github.com/burillomom/atom-npd-tema.git

# Copie a pasta arNpdFauPlugin para dentro dos plugins do seu AtoM
# (ajuste o caminho se o seu AtoM estiver em outro diretório)
sudo cp -r /tmp/atom-npd-tema/arNpdFauPlugin /usr/share/nginx/atom/plugins/
```

### Passo 2 — Limpar o cache e ativar o tema

```bash
cd /usr/share/nginx/atom
sudo -u www-data php symfony cc
```

Depois acesse **Admin > Themes** no navegador e selecione **arNpdFauPlugin** (ou via CLI: `sudo -u www-data php symfony tools:theme --enable=arNpdFauPlugin` ou habilitando na interface administrativa).

> **Observação sobre Content Security Policy (CSP):**
> Como `atom-npd.css` importa a fonte *Inter* do Google Fonts (`fonts.googleapis.com`), caso seu servidor tenha um CSP restrito no Nginx, o navegador usará automaticamente `Helvetica Neue` / `Helvetica` / `Arial` como fallback sem quebrar nada.

### Passo 3 — Como reverter imediatamente (se precisar voltar atrás)

Se quiser voltar para o tema padrão a qualquer momento:
- Pelo painel: **Admin > Themes** → ative **Dominion B5** (`arDominionB5Plugin`).
- Ou pelo terminal:

```bash
cd /usr/share/nginx/atom
sudo rm -rf plugins/arNpdFauPlugin
sudo -u www-data php symfony cc
```
