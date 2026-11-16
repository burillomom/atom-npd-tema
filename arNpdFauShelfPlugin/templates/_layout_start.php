<?php
ob_start();
include sfConfig::get('sf_plugins_dir') . '/arDominionB5Plugin/templates/_layout_start.php';
$layoutStart = ob_get_clean();

$nonce = sfConfig::get('csp_nonce');
$npdHead =
    '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n" .
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n" .
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">' . "\n" .
    '<link href="/plugins/arNpdFauShelfPlugin/css/atom-npd.css" rel="stylesheet">' . "\n" .
    '<link href="/plugins/arNpdFauShelfPlugin/css/shelf.css" rel="stylesheet">' . "\n" .
    '<script defer src="/plugins/arNpdFauShelfPlugin/js/atom-npd-shelf.js"' . ($nonce ? ' ' . $nonce : '') . '></script>' . "\n";

echo str_replace('</head>', $npdHead . '</head>', $layoutStart);
