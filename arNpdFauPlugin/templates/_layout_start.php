<?php
ob_start();
include sfConfig::get('sf_plugins_dir') . '/arDominionB5Plugin/templates/_layout_start.php';
$layoutStart = ob_get_clean();

$pluginDir = sfConfig::get('sf_plugins_dir') . '/arNpdFauPlugin';
$cssVer = @filemtime($pluginDir . '/css/atom-npd.css') ?: 2;
$jsVer = @filemtime($pluginDir . '/js/atom-npd.js') ?: 2;

$nonce = sfConfig::get('csp_nonce');
$npdHead =
    '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n" .
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n" .
    '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">' . "\n" .
    '<link href="/plugins/arNpdFauPlugin/css/atom-npd.css?v=' . $cssVer . '" rel="stylesheet">' . "\n" .
    '<script defer src="/plugins/arNpdFauPlugin/js/atom-npd.js?v=' . $jsVer . '"' . ($nonce ? ' ' . $nonce : '') . '></script>' . "\n";

echo str_replace('</head>', $npdHead . '</head>', $layoutStart);
