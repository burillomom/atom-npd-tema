<footer class="d-print-none">

  <div class="container-xxl">
    <div class="npd-footer">
      <div class="npd-footer__inner">
        <div>
          <span class="npd-footer__title">NPD · FAU UFRJ</span>
          <span> — Av. Pedro Calmon, 550, Prédio da Reitoria, 6º andar, Cidade Universitária, Rio de Janeiro</span>
        </div>
        <div class="npd-footer__links">
          <a href="https://fau.ufrj.br/" target="_blank" rel="noopener noreferrer">FAU UFRJ</a>
          <a href="https://ufrj.br/" target="_blank" rel="noopener noreferrer">UFRJ</a>
          <a href="https://www.accesstomemory.org/" target="_blank" rel="noopener noreferrer">AtoM</a>
        </div>
      </div>
      <div class="npd-footer__support">
        <span class="npd-footer__support-label">Apoio</span>
        <span>CNPq · FAPERJ · FINEP · Getty Foundation · British Library</span>
      </div>
    </div>
  </div>

  <?php if (QubitAcl::check('userInterface', 'translate')) { ?>
    <?php echo get_component('sfTranslatePlugin', 'translate'); ?>
  <?php } ?>

  <?php echo get_component_slot('footer'); ?>

  <div id="print-date">
    <?php echo __('Printed: %d%', ['%d%' => date('Y-m-d')]); ?>
  </div>

  <div id="js-i18n">
    <div id="read-more-less-links"
      data-read-more-text="<?php echo __('Read more'); ?>"
      data-read-less-text="<?php echo __('Read less'); ?>">
    </div>
  </div>

</footer>
