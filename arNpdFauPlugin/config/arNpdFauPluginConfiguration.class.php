<?php

/*
 * Tema NPD · FAU UFRJ para AtoM (Access to Memory)
 * Estende o tema padrão arDominionB5Plugin sem modificar arquivos do core.
 */

class arNpdFauPluginConfiguration extends arDominionB5PluginConfiguration
{
    public static
        $summary = 'Tema minimalista (estilo suíço) do NPD FAU UFRJ, estendendo o arDominionB5Plugin.',
        $version = '0.1.0';

    public function contextLoadFactories(sfEvent $event)
    {
        $context = $event->getSubject();
        $response = $context->response;

        // Fonte Inter (com fallback para Helvetica Neue / Helvetica / Arial)
        $response->addStylesheet(
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
            'last'
        );

        // CSS e JS do tema aplicados por último para sobrescrever apenas o visual do Dominion B5
        $response->addStylesheet('/plugins/arNpdFauPlugin/css/atom-npd.css', 'last');
        $response->addJavascript('/plugins/arNpdFauPlugin/js/atom-npd.js', 'last');
    }

    public function initialize()
    {
        parent::initialize();

        // Registra os templates deste plugin antes dos templates do Dominion B5 / core
        $decoratorDirs = sfConfig::get('sf_decorator_dirs');
        $decoratorDirs[] = $this->rootDir . '/templates';
        sfConfig::set('sf_decorator_dirs', $decoratorDirs);

        // Garante que arNpdFauPlugin tenha prioridade sobre arDominionB5Plugin nos módulos e templates
        $plugins = $this->configuration->getPlugins();
        if (false !== $key = array_search('arNpdFauPlugin', $plugins)) {
            unset($plugins[$key]);
        }
        $this->configuration->setPlugins(
            array_merge(['arNpdFauPlugin'], $plugins)
        );

        $this->dispatcher->connect('context.load_factories', [$this, 'contextLoadFactories']);
    }
}
