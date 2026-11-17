<div class="visually-hidden-focusable p-3 border-bottom">
  <a class="btn btn-sm btn-secondary" href="#main-column">
    <?php echo __('Skip to main content'); ?>
  </a>
</div>

<?php echo get_component('default', 'privacyMessage'); ?>

<?php echo get_component('default', 'updateCheck'); ?>

<?php if ($sf_user->isAdministrator() && '' === (string) QubitSetting::getByName('siteBaseUrl')) { ?>
  <div class="alert alert-warning rounded-0 text-center mb-0" role="alert">
    <?php echo link_to(__('Please configure your site base URL'), 'settings/siteInformation', ['class' => 'alert-link']); ?>
  </div>
<?php } ?>

<?php
  $mod = $sf_context->getModuleName();
  $act = $sf_context->getActionName();
  $reqId = $sf_request->getParameter('id');
?>

<header id="top-bar" class="navbar navbar-expand-lg d-print-none" role="navigation" aria-label="<?php echo __('Main navigation'); ?>">
  <div class="container-xxl npd-bar-inner">
    <a class="navbar-brand d-flex align-items-center py-0 me-2 me-lg-4" href="<?php echo url_for('@homepage'); ?>" title="<?php echo __('NPD · FAU UFRJ'); ?>" rel="home">
      <img src="/plugins/arNpdFauPlugin/images/logo-npd.png" alt="<?php echo __('NPD · FAU UFRJ'); ?>" class="npd-brand-logo">
    </a>

    <div class="npd-search-center">
      <?php echo get_component('search', 'box'); ?>
    </div>

    <button class="navbar-toggler atom-btn-secondary my-1 ms-2 px-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-content" aria-controls="navbar-content" aria-expanded="false">
      <i class="fas fa-bars" aria-hidden="true"></i>
      <span class="visually-hidden"><?php echo __('Toggle navigation'); ?></span>
    </button>

    <div class="collapse navbar-collapse" id="navbar-content">
      <ul class="navbar-nav npd-primary-nav">
        <li class="nav-item">
          <a class="nav-link <?php echo ('staticpage' === $mod && 'home' === $act) ? 'is-active' : ''; ?>"
             href="<?php echo url_for('@homepage'); ?>">
            <?php echo __('Fundos'); ?>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?php echo ('informationobject' === $mod && 'browse' === $act) ? 'is-active' : ''; ?>"
             href="<?php echo url_for(['module' => 'informationobject', 'action' => 'browse']); ?>">
            <?php echo __('Descrições arquivísticas'); ?>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?php echo ('taxonomy' === $mod && (string) QubitTaxonomy::SUBJECT_ID === (string) $reqId) ? 'is-active' : ''; ?>"
             href="<?php echo url_for(['module' => 'taxonomy', 'action' => 'index', 'id' => QubitTaxonomy::SUBJECT_ID]); ?>">
            <?php echo __('Assuntos'); ?>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?php echo ('taxonomy' === $mod && (string) QubitTaxonomy::PLACE_ID === (string) $reqId) ? 'is-active' : ''; ?>"
             href="<?php echo url_for(['module' => 'taxonomy', 'action' => 'index', 'id' => QubitTaxonomy::PLACE_ID]); ?>">
            <?php echo __('Locais'); ?>
          </a>
        </li>
      </ul>

      <div class="npd-right-tools d-flex flex-wrap flex-lg-nowrap align-items-lg-center gap-2 ms-lg-auto">
        <?php echo get_component('menu', 'browseMenu', ['sf_cache_key' => 'dominion-b5'.$sf_user->getCulture().$sf_user->getUserID()]); ?>
        <ul id="npd-right-nav" class="navbar-nav align-items-lg-center">
          <?php echo get_component('menu', 'mainMenu', ['sf_cache_key' => 'dominion-b5'.$sf_user->getCulture().$sf_user->getUserID()]); ?>
          <?php echo get_component('menu', 'clipboardMenu'); ?>
          <?php if (sfConfig::get('app_toggleLanguageMenu')) { ?>
            <?php echo get_component('menu', 'changeLanguageMenu'); ?>
          <?php } ?>
          <?php echo get_component('menu', 'quickLinksMenu'); ?>
        </ul>
        <?php echo get_component('menu', 'userMenu'); ?>
      </div>
    </div>
  </div>
</header>
