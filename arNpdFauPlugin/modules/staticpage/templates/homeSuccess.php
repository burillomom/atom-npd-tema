<?php decorate_with('layout'); ?>

<?php
  $criteria = new Criteria();
  $criteria->add(QubitInformationObject::PARENT_ID, QubitInformationObject::ROOT_ID);
  if (!$sf_user->isAuthenticated()) {
      $criteria->addJoin(
          QubitInformationObject::ID,
          QubitStatus::OBJECT_ID,
          Criteria::INNER_JOIN
      );
      $criteria->add(QubitStatus::TYPE_ID, QubitTerm::STATUS_TYPE_PUBLICATION_ID);
      $criteria->add(QubitStatus::STATUS_ID, QubitTerm::PUBLICATION_STATUS_PUBLISHED_ID);
  }
  $topFonds = QubitInformationObject::get($criteria);

  // Conteúdo institucional: usa o texto do NPD se a página ainda estiver com o texto padrão do AtoM
  $rawContent = (string) $sf_data->getRaw('content');
  $isDefaultAtomHome = ('' === trim(strip_tags($rawContent)))
      || false !== strpos($rawContent, 'This is the default homepage for AtoM');
  $heroLeadHtml = $isDefaultAtomHome
      ? '<p>O NPD reúne, preserva e torna acessíveis os arquivos de arquitetos e escritórios que marcaram a arquitetura e o urbanismo no Brasil, apoiando o ensino e a pesquisa na FAU&nbsp;UFRJ.</p>'
      : render_value_html($rawContent);

  $fondsData = [];

  foreach ($topFonds as $item) {
      $title = $item->getTitle(['cultureFallback' => true]);
      $ref = $item->identifier ?: $item->referenceCode;

      $datesText = '';
      $startYear = '';
      foreach ($item->getDates() as $d) {
          $display = $d->getDate(['cultureFallback' => true]);
          if (!empty($display)) {
              $datesText = $display;
          }
          if (preg_match('/(\d{4})/', (string) $d->startDate ?: $display, $m)) {
              $y = (int) $m[1];
              if ('' === $startYear) {
                  $startYear = $y;
              }
          }
      }

      // Contagem de filhos diretos com nível Série
      $seriesCount = (int) QubitPdo::fetchColumn(
          'SELECT COUNT(DISTINCT io.id)
             FROM information_object io
             INNER JOIN term t ON io.level_of_description_id = t.id
             INNER JOIN term_i18n ti ON ti.id = t.id
            WHERE io.parent_id = ?
              AND t.taxonomy_id = ?
              AND ti.name IN (?, ?)',
          [$item->id, QubitTaxonomy::LEVEL_OF_DESCRIPTION_ID, 'Series', 'Série']
      );

      // Contagem total de itens (descendentes com nível Item; se não houver, total de descendentes)
      $itemsCount = (int) QubitPdo::fetchColumn(
          'SELECT COUNT(DISTINCT io.id)
             FROM information_object io
             INNER JOIN term t ON io.level_of_description_id = t.id
             INNER JOIN term_i18n ti ON ti.id = t.id
            WHERE io.lft > ?
              AND io.rgt < ?
              AND t.taxonomy_id = ?
              AND ti.name IN (?, ?)',
          [$item->lft, $item->rgt, QubitTaxonomy::LEVEL_OF_DESCRIPTION_ID, 'Item', 'Documento']
      );
      if (0 === $itemsCount) {
          $itemsCount = (int) QubitPdo::fetchColumn(
              'SELECT COUNT(*) FROM information_object WHERE lft > ? AND rgt < ?',
              [$item->lft, $item->rgt]
          );
      }

      $thumbPath = null;
      if ($do = $item->getDigitalObject()) {
          $rep = $do->getRepresentationByUsage(QubitTerm::REFERENCE_ID)
              ?: $do->getRepresentationByUsage(QubitTerm::THUMBNAIL_ID);
          if ($rep) {
              $thumbPath = $rep->getFullPath();
          }
      }

      $fondsData[] = [
          'item' => $item,
          'title' => $title,
          'ref' => $ref,
          'dates' => $datesText ?: 's.d.',
          'start' => $startYear ?: 9999,
          'series' => $seriesCount,
          'items' => $itemsCount,
          'thumb' => $thumbPath,
      ];
  }
?>

<div class="npd-home">
  <section class="intro">
    <div class="intro__title">
      <div class="intro__title-top">
        <?php $fauVer = @filemtime(sfConfig::get('sf_plugins_dir').'/arNpdFauPlugin/images/logo-fau.svg') ?: 2; ?>
        <div class="npd-hero-logos">
          <img class="hero-logo hero-logo-npd logo-light" src="/plugins/arNpdFauPlugin/images/logo-npd-full.png" alt="NPD — Núcleo de Pesquisa e Documentação">
          <img class="hero-logo hero-logo-npd logo-dark" src="/plugins/arNpdFauPlugin/images/logo-npd-full-dark.png" alt="NPD — Núcleo de Pesquisa e Documentação">
          <span class="hero-logos-sep" aria-hidden="true"></span>
          <a class="hero-logo-link" href="https://fau.ufrj.br/" target="_blank" rel="noopener noreferrer" title="FAU UFRJ — Faculdade de Arquitetura e Urbanismo">
            <img class="hero-logo hero-logo-fau logo-light" src="/plugins/arNpdFauPlugin/images/logo-fau.svg?v=<?php echo $fauVer; ?>" alt="FAU UFRJ — Faculdade de Arquitetura e Urbanismo">
            <img class="hero-logo hero-logo-fau logo-dark" src="/plugins/arNpdFauPlugin/images/logo-fau-dark.svg?v=<?php echo $fauVer; ?>" alt="FAU UFRJ — Faculdade de Arquitetura e Urbanismo">
          </a>
          <span class="hero-logos-sep" aria-hidden="true"></span>
          <a class="hero-logo-link" href="https://ufrj.br/" target="_blank" rel="noopener noreferrer" title="UFRJ — Universidade Federal do Rio de Janeiro">
            <img class="hero-logo hero-logo-ufrj logo-light" src="/plugins/arNpdFauPlugin/images/logo-ufrj.png" alt="UFRJ — Universidade Federal do Rio de Janeiro">
            <img class="hero-logo hero-logo-ufrj logo-dark" src="/plugins/arNpdFauPlugin/images/logo-ufrj-dark.png" alt="UFRJ — Universidade Federal do Rio de Janeiro">
          </a>
        </div>
        <h1>Núcleo de Pesquisa <br>e Documentação</h1>
      </div>
      <div class="intro__meta">
        <p class="intro__contact">Contato: <a href="mailto:npd@fau.ufrj.br">npd@fau.ufrj.br</a></p>
        <ul class="intro__links">
          <li><a href="<?php echo url_for(['module' => 'repository', 'action' => 'index', 'slug' => 'nucleo-de-pesquisa-e-documentacao-da-faculdade-de-arquitetura-e-urbanismo-da-ufrj']); ?>"><?php echo __('Sobre o NPD'); ?></a></li>
          <li><a href="<?php echo url_for(['module' => 'staticpage', 'action' => 'index', 'slug' => 'about']); ?>"><?php echo __('Como pesquisar'); ?></a></li>
        </ul>
      </div>
    </div>
    <div class="intro__text">
      <div class="lead">
        <?php echo $heroLeadHtml; ?>
      </div>
    </div>
  </section>

  <section id="fonds" aria-labelledby="fonds-title">
    <h2 id="fonds-title" class="section-title">
      <?php echo __('Fundos'); ?>
    </h2>

    <div class="toolbar">
      <label class="filter">
        <span class="visually-hidden"><?php echo __('Filtrar fundos'); ?></span>
        <i class="fas fa-search npd-filter-icon" aria-hidden="true"></i>
        <input id="fonds-filter" type="search" placeholder="<?php echo __('Filtrar'); ?>" autocomplete="off">
      </label>

      <div class="toolbar__right">
        <span id="fonds-count" class="count"><?php echo count($fondsData); ?></span>
        <div class="text-toggle" role="group" aria-label="<?php echo __('Ordenação'); ?>">
          <button data-sort="alpha" aria-pressed="true" type="button"><?php echo __('A–Z'); ?></button>
          <button data-sort="date" aria-pressed="false" type="button"><?php echo __('Data'); ?></button>
        </div>
        <div class="text-toggle" role="group" aria-label="<?php echo __('Visualização'); ?>">
          <button data-view="shelf" aria-pressed="true" type="button"><?php echo __('Prateleira'); ?></button>
          <button data-view="grid" aria-pressed="false" type="button"><?php echo __('Grade'); ?></button>
        </div>
      </div>
    </div>

    <!-- Visão 1 (Principal): Prateleira de Caixas-Arquivo -->
    <div id="shelves-wrap" class="shelves-wrap" aria-live="polite">
      <?php foreach ($fondsData as $f) { ?>
        <div class="shelf-box"
             data-title="<?php echo esc_specialchars($f['title']); ?>"
             data-ref="<?php echo esc_specialchars($f['ref']); ?>"
             data-dates="<?php echo esc_specialchars($f['dates']); ?>"
             data-start="<?php echo esc_specialchars($f['start']); ?>">
          <a class="shelf-box__link"
             href="<?php echo url_for([$f['item'], 'module' => 'informationobject']); ?>"
             title="<?php echo esc_specialchars($f['title']); ?>">
            <div class="shelf-box__spine">
              <div class="shelf-box__label">
                <span class="shelf-box__label-ref"><?php echo esc_specialchars($f['ref'] ?: 'NPD'); ?></span>
                <span class="shelf-box__spine-name"><?php echo esc_specialchars($f['title']); ?></span>
                <span class="shelf-box__label-meta"><?php echo esc_specialchars($f['dates']); ?></span>
              </div>
              <span class="shelf-box__hole" aria-hidden="true"></span>
            </div>
            <div class="shelf-box__panel">
              <figure class="shelf-box__media">
                <?php if ($f['thumb']) { ?>
                  <img src="<?php echo $f['thumb']; ?>" alt="<?php echo esc_specialchars($f['title']); ?>" loading="lazy">
                <?php } else { ?>
                  <div class="shelf-box__noimg"><?php echo esc_specialchars($f['ref'] ?: __('Fundo')); ?></div>
                <?php } ?>
              </figure>
              <div>
                <p class="shelf-box__ref"><?php echo esc_specialchars($f['ref']); ?></p>
                <h3 class="shelf-box__title"><?php echo esc_specialchars($f['title']); ?></h3>
                <dl class="shelf-box__meta">
                  <div><dt><?php echo __('Datas'); ?></dt><dd><?php echo esc_specialchars($f['dates']); ?></dd></div>
                  <div><dt><?php echo __('Séries'); ?></dt><dd><?php echo $f['series']; ?></dd></div>
                  <div><dt><?php echo __('Itens'); ?></dt><dd><?php echo $f['items']; ?></dd></div>
                </dl>
              </div>
            </div>
          </a>
        </div>
      <?php } ?>
    </div>

    <!-- Visão 2: Grade de Cartões -->
    <ul id="fonds-grid" class="fonds-grid" hidden>
      <?php foreach ($fondsData as $f) { ?>
        <li class="fonds-card"
            data-title="<?php echo esc_specialchars($f['title']); ?>"
            data-ref="<?php echo esc_specialchars($f['ref']); ?>"
            data-dates="<?php echo esc_specialchars($f['dates']); ?>"
            data-start="<?php echo esc_specialchars($f['start']); ?>">
          <a class="fonds-card__link"
             href="<?php echo url_for([$f['item'], 'module' => 'informationobject']); ?>"
             title="<?php echo esc_specialchars($f['title']); ?>">
            <figure class="fonds-card__media">
              <?php if ($f['thumb']) { ?>
                <img src="<?php echo $f['thumb']; ?>" alt="<?php echo esc_specialchars($f['title']); ?>" loading="lazy">
              <?php } else { ?>
                <div class="fonds-card__placeholder"><?php echo esc_specialchars($f['ref'] ?: __('Fundo')); ?></div>
              <?php } ?>
            </figure>
            <p class="fonds-card__title"><span><?php echo esc_specialchars($f['title']); ?></span></p>
            <p class="fonds-card__sub"><?php echo esc_specialchars($f['dates']); ?> · <?php echo $f['series']; ?> <?php echo __('séries'); ?></p>
          </a>
        </li>
      <?php } ?>
    </ul>

    <p id="fonds-empty" class="empty" hidden><?php echo __('Nenhum fundo encontrado.'); ?></p>
  </section>

  <?php if (QubitAcl::check($resource, 'update')) { ?>
    <section class="actions mt-5">
      <?php echo link_to(__('Edit'), [$resource, 'module' => 'staticpage', 'action' => 'edit'], ['class' => 'btn atom-btn-outline-light']); ?>
    </section>
  <?php } ?>
</div>
