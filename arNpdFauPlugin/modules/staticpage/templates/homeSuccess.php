<?php decorate_with('layout'); ?>

<?php
  // Busca os fundos de nível superior (parentId = ROOT_ID) diretamente do AtoM
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

  // Termo "Series" na taxonomia de Níveis de Descrição (34) para contar séries filhas
  $seriesCriteria = new Criteria();
  $seriesCriteria->add(QubitTerm::TAXONOMY_ID, QubitTaxonomy::LEVEL_OF_DESCRIPTION_ID);
  $seriesCriteria->addJoin(QubitTerm::ID, QubitTermI18n::ID, Criteria::INNER_JOIN);
  $seriesCriteria->add(QubitTermI18n::NAME, ['Series', 'Série'], Criteria::IN);
  $seriesTerm = QubitTerm::getOne($seriesCriteria);
  $totalSeries = 0;
  $minYear = null;
  $maxYear = null;
  $fondsData = [];

  foreach ($topFonds as $item) {
      $title = $item->getTitle(['cultureFallback' => true]);
      $ref = $item->identifier ?: $item->referenceCode;

      // Datas de criação/produção
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
              $minYear = null === $minYear ? $y : min($minYear, $y);
          }
          if (preg_match_all('/(\d{4})/', (string) $d->endDate ?: $display, $mAll) && !empty($mAll[1])) {
              $yEnd = (int) end($mAll[1]);
              $maxYear = null === $maxYear ? $yEnd : max($maxYear, $yEnd);
          }
      }

      // Contagem de filhos diretos com nível Série (em qualquer idioma: Series / Série)
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
      $totalSeries += $seriesCount;

      // Miniatura do objeto digital (se existir)
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
          'extent' => $item->getExtentAndMedium(['cultureFallback' => true]),
          'thumb' => $thumbPath,
      ];
  }

  $rangeText = ($minYear && $maxYear) ? ($minYear.'–'.$maxYear) : '';
?>

<div class="npd-home py-4">
  <section class="intro">
    <div class="intro__title">
      <p class="eyebrow">Faculdade de Arquitetura e Urbanismo<br>Universidade Federal do Rio de Janeiro</p>
      <h1>Núcleo de Pesquisa<br>e Documentação</h1>
    </div>
    <div class="intro__text">
      <p class="lead">
        <?php echo render_value_html($sf_data->getRaw('content')); ?>
      </p>
      <ul class="intro__links">
        <li><?php echo link_to(__('Sobre o NPD'), ['module' => 'staticpage', 'slug' => 'about']); ?></li>
        <li><?php echo link_to(__('Descrições arquivísticas'), ['module' => 'informationobject', 'action' => 'browse']); ?></li>
        <li><?php echo link_to(__('Entidade custodiadora'), ['module' => 'repository', 'action' => 'browse']); ?></li>
      </ul>
    </div>
    <dl class="facts">
      <div><dt><?php echo __('Fundos'); ?></dt><dd><?php echo count($fondsData); ?></dd></div>
      <div><dt><?php echo __('Séries'); ?></dt><dd><?php echo $totalSeries; ?></dd></div>
      <?php if ($rangeText) { ?>
        <div><dt><?php echo __('Período'); ?></dt><dd><?php echo $rangeText; ?></dd></div>
      <?php } ?>
    </dl>
  </section>

  <section id="fonds" aria-labelledby="fonds-title">
    <h2 id="fonds-title" class="section-title">
      <?php echo __('Fundos'); ?>
      <?php if ($rangeText) { ?>
        <span class="range"><?php echo $rangeText; ?></span>
      <?php } ?>
    </h2>

    <div class="toolbar">
      <label class="filter">
        <span class="visually-hidden"><?php echo __('Filtrar fundos'); ?></span>
        <input id="fonds-filter" type="search" placeholder="<?php echo __('Filtrar'); ?>" autocomplete="off">
      </label>

      <div class="toolbar__right">
        <span id="fonds-count" class="count"><?php echo count($fondsData); ?></span>
        <div class="text-toggle" role="group" aria-label="<?php echo __('Ordenação'); ?>">
          <button data-sort="random" aria-pressed="true" type="button"><?php echo __('Aleatória'); ?></button>
          <button data-sort="alpha" aria-pressed="false" type="button"><?php echo __('A–Z'); ?></button>
          <button data-sort="date" aria-pressed="false" type="button"><?php echo __('Data'); ?></button>
        </div>
        <div class="text-toggle" role="group" aria-label="<?php echo __('Visualização'); ?>">
          <button data-view="grid" aria-pressed="true" type="button"><?php echo __('Grade'); ?></button>
          <button data-view="list" aria-pressed="false" type="button"><?php echo __('Lista'); ?></button>
        </div>
      </div>
    </div>

    <div class="list-head" aria-hidden="true">
      <span></span><span><?php echo __('Fundo'); ?></span><span><?php echo __('Código'); ?></span><span><?php echo __('Datas'); ?></span><span><?php echo __('Séries'); ?></span><span><?php echo __('Extensão'); ?></span>
    </div>

    <ul id="fonds-grid" class="fonds-grid">
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
            <span class="fonds-card__cell muted-cell"><?php echo esc_specialchars($f['ref']); ?></span>
            <span class="fonds-card__cell c-dates"><?php echo esc_specialchars($f['dates']); ?></span>
            <span class="fonds-card__cell"><?php echo $f['series']; ?></span>
            <span class="fonds-card__cell muted-cell"><?php echo esc_specialchars($f['extent']); ?></span>
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
