# Tema NPD · FAU UFRJ para AtoM (`arNpdFauPlugin`)

Protótipo e base de código do tema minimalista (inspirado no design gráfico suíço) para o acervo do **Núcleo de Pesquisa e Documentação da Faculdade de Arquitetura e Urbanismo da UFRJ (NPD · FAU UFRJ)** no [AtoM (Access to Memory)](https://github.com/artefactual/atom).

---

## 1. Visualizando o protótipo estático (sem o AtoM)

Basta abrir [`index.html`](index.html) em qualquer navegador:

- **Modo Claro / Noturno**: botão **Noturno / Claro** na barra superior (ou `?theme=dark` / `?theme=light` na URL).
- **Ordem sem hierarquia**: por padrão os fundos são embaralhados a cada visita (**Aleatória**), com opção de alternar para **A–Z** ou **Data** com animação FLIP suave.
- **Visualização em Grade ou Lista**: alternância instantânea entre grade de cartões (proporção natural alinhada pela base) e tabela técnica.
- **Sem animações (captura/acessibilidade)**: adicione `?static` na URL ou ative `prefers-reduced-motion` no sistema.

---

## 2. Estrutura do repositório

```text
.
├── index.html          # Protótipo estático completo da página inicial
├── css/
│   └── theme.css       # Folha de estilos (variáveis CSS, modo claro/noturno, grid e responsivo)
├── js/
│   ├── data.js         # Dados de demonstração dos fundos (arquitetos e escritórios)
│   └── theme.js        # Ordenação aleatória/A-Z/Data (FLIP), filtro, reveal e modo noturno
└── img/                # Miniaturas de demonstração (fotografias e pranchas arquitetônicas)
```

---

## 3. Como transformar em plugin de tema no servidor com AtoM (2.7 / 2.8+)

No servidor onde o AtoM estiver instalado (ex.: `/usr/share/nginx/atom`), crie o plugin `arNpdFauPlugin` estendendo o `arDominionB5Plugin`:

### 3.1. Estrutura de pastas do plugin no AtoM

```text
plugins/arNpdFauPlugin/
├── config/
│   └── arNpdFauPluginConfiguration.class.php
├── css/
│   └── main.scss               # Conteúdo de css/theme.css importado após o Dominion B5
├── js/
│   └── theme.js                # Script de ordenação FLIP, filtro e modo noturno
├── modules/
│   └── staticpage/
│       ├── actions/
│       │   └── homeAction.class.php
│       └── templates/
│           └── homeSuccess.php # Marcação de #wrapper / #main-column do index.html
└── templates/
    ├── _header.php             # Marcação do #top-bar do index.html
    └── _footer.php             # Marcação do #footer do index.html
```

### 3.2. Configuração do plugin (`config/arNpdFauPluginConfiguration.class.php`)

```php
<?php

class arNpdFauPluginConfiguration extends sfPluginConfiguration
{
    public static
        $summary = 'Tema minimalista do NPD FAU UFRJ para o AtoM, baseado no arDominionB5Plugin.',
        $version = '0.1.0';

    public function contextLoadFactories(sfEvent $event)
    {
        $context = $event->getSubject();
        $context->response->addStylesheet('/plugins/arNpdFauPlugin/css/theme.css', 'last');
        $context->response->addJavascript('/plugins/arNpdFauPlugin/js/theme.js', 'last');
    }

    public function initialize()
    {
        $this->dispatcher->connect('context.load_factories', [$this, 'contextLoadFactories']);
        $decoratorDirs = sfConfig::get('sf_decorator_dirs');
        $decoratorDirs[] = $this->rootDir . '/templates';
        sfConfig::set('sf_decorator_dirs', $decoratorDirs);

        $moduleDirs = sfConfig::get('sf_module_dirs');
        $moduleDirs[$this->rootDir . '/modules'] = false;
        sfConfig::set('sf_module_dirs', $moduleDirs);
    }
}
```

### 3.3. Buscando os Fundos reais no `homeSuccess.php`

No AtoM, cada cartão `.fonds-card` deve ser renderizado no servidor consultando as descrições arquivísticas de nível superior (`parentId == QubitInformationObject::ROOT_ID`):

- **Código de referência (`ref`)**: `$item->identifier` ou `$item->referenceCode`
- **Título (`title`)**: `$item->getTitle(['cultureFallback' => true])`
- **Datas (`dates`)**: datas de produção concatenadas via `$item->getDates()`
- **Total de séries (`series`)**: contagem de filhos diretos (`parentId == $item->id`) cujo `levelOfDescriptionId` corresponde ao termo *"Série"*
- **Miniatura (`image`)**: `$item->getDigitalObject()` (representação `QubitTerm::REFERENCE_ID` ou `QubitTerm::THUMBNAIL_ID`)
- **Link do cartão**: `url_for([$item, 'module' => 'informationobject'])`

Depois de ativar o tema em **Admin > Themes** (ou `php symfony tools:theme`), limpe o cache do AtoM:

```bash
php symfony cc
```
