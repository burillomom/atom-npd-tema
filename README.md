# Tema NPD · FAU UFRJ para AtoM (`arNpdFauPlugin`)

Tema minimalista (inspirado no design gráfico suíço) para o acervo do **Núcleo de Pesquisa e Documentação da Faculdade de Arquitetura e Urbanismo da UFRJ (NPD · FAU UFRJ)** no [AtoM (Access to Memory)](https://github.com/artefactual/atom).

---

## Principais recursos

- **Baseado no tema padrão (`arDominionB5Plugin`):** estende `arDominionB5PluginConfiguration` sem modificar arquivos do *core* e **sem precisar rodar Webpack/Node no servidor**.
- **Modo Escuro como padrão + alternância por ícone (sol/lua):** integrado a todas as páginas (Home, Descrições Arquivísticas, Busca Avançada, Assuntos, Locais, Login e Páginas de Fundos), com elementos *seamless* sobre o fundo.
- **Página inicial com Prateleira de Caixas-Arquivo (principal) + Grade (secundária):**
  - Caixas uniformes com etiqueta retangular (código, nome, datas) e furo dedal; no *hover* (ou toque no celular), revelam a imagem do fundo, datas, total de séries e quantidade de itens.
  - Filtro instantâneo e ordenação por **A–Z** ou **Data**.
- **Logos institucionais (NPD + UFRJ):** versões específicas para os modos claro e escuro no Hero, mantendo apenas o símbolo do NPD fixo na barra superior.
- **Responsivo:** barra de pesquisa acessível diretamente na *topbar* do celular entre a logo e o menu `☰`.

---

## Como instalar em qualquer outro AtoM (2.7 / 2.8 / 2.9+)

> Pré-requisito: o servidor precisa usar o tema base **`arDominionB5Plugin`** (padrão do AtoM 2.7+).

### Opção A — Instalação tradicional (Nginx + PHP-FPM no Linux)

```bash
# 1. Clone o repositório (ex.: em /opt ou /tmp)
cd /opt
sudo git clone https://github.com/burillomom/atom-npd-tema.git

# 2. Crie um link simbólico (recomendado para facilitar atualizações com git pull)
#    ou copie a pasta para plugins/
sudo ln -s /opt/atom-npd-tema/arNpdFauPlugin /usr/share/nginx/atom/plugins/arNpdFauPlugin

# 3. Ative o plugin e limpe o cache do AtoM
cd /usr/share/nginx/atom
sudo -u www-data php symfony tools:atom-plugins add arNpdFauPlugin
sudo -u www-data php symfony cc
```

*(Se o seu AtoM estiver em outro diretório, como `/var/www/atom`, apenas ajuste o caminho no comando `ln -s` e `cd`.)*

---

### Opção B — Instalação em Docker (ex.: `docker-atom-1`)

```bash
# 1. No diretório do seu AtoM (onde fica a pasta plugins/)
cd /caminho/do/seu/atom/plugins
git clone https://github.com/burillomom/atom-npd-tema.git /tmp/atom-npd-tema
cp -r /tmp/atom-npd-tema/arNpdFauPlugin ./arNpdFauPlugin

# 2. Ative o plugin e limpe o cache dentro do container PHP do AtoM
docker exec <nome-do-container-atom> php /atom/src/symfony tools:atom-plugins add arNpdFauPlugin
docker exec <nome-do-container-atom> php /atom/src/symfony cc
```

*(Caso use Memcached em container separado, reinicie o Memcached se a barra ou o tema não aparecer de imediato.)*

---

### Passo importante no painel do AtoM (após instalar)

1. **Texto institucional do Hero:** por padrão, se a página inicial ainda tiver o texto original em inglês do AtoM (*"This is the default homepage for AtoM..."*), o tema exibe automaticamente o texto institucional do NPD. Para editar esse texto pelo painel, faça login como administrador e clique em **Edit** no rodapé da página inicial (ou acesse **Admin > Static pages > Home**).
2. **Link `Sobre o NPD`:** aponta automaticamente para a primeira Entidade Custodiadora cadastrada (`QubitRepository`). Caso haja mais de uma entidade ou você queira apontar para uma página estática específica, edite as linhas 18–23 de `arNpdFauPlugin/modules/staticpage/templates/homeSuccess.php` e rode `php symfony cc`.

---

## Como atualizar depois

Se você usou link simbólico (`ln -s`):

```bash
cd /opt/atom-npd-tema
sudo git pull origin main
cd /usr/share/nginx/atom
sudo -u www-data php symfony cc
```

---

## Como desativar ou reverter com segurança

O plugin não altera o banco de dados nem arquivos do *core*. Para voltar ao tema padrão do AtoM a qualquer momento:

```bash
cd /usr/share/nginx/atom   # ou via docker exec
sudo -u www-data php symfony tools:atom-plugins delete arNpdFauPlugin
sudo -u www-data php symfony cc
```

---

## Protótipo estático (sem AtoM)

Os arquivos na raiz ([`index.html`](index.html) e [`prateleira.html`](prateleira.html)) permitem visualizar o conceito de design direto no navegador com dados de exemplo (`js/data.js`), sem precisar do AtoM instalado.
