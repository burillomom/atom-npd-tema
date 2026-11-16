<?php

/*
 * Tema 2 NPD · FAU UFRJ para AtoM (Prateleira de Caixas-Arquivo)
 * Estende o tema padrão arDominionB5Plugin sem modificar arquivos do core.
 */

class arNpdFauShelfPluginConfiguration extends arDominionB5PluginConfiguration
{
    public static
        $summary = 'Tema minimalista (Prateleira de Caixas-Arquivo) do NPD FAU UFRJ, estendendo o arDominionB5Plugin.',
        $version = '0.1.0';

    public function initialize()
    {
        parent::initialize();

        $decoratorDirs = sfConfig::get('sf_decorator_dirs');
        array_unshift($decoratorDirs, $this->rootDir . '/templates');
        sfConfig::set('sf_decorator_dirs', $decoratorDirs);

        $plugins = $this->configuration->getPlugins();
        if (false !== $key = array_search('arNpdFauShelfPlugin', $plugins)) {
            unset($plugins[$key]);
        }
        $this->configuration->setPlugins(
            array_merge(['arNpdFauShelfPlugin'], $plugins)
        );
    }
}
