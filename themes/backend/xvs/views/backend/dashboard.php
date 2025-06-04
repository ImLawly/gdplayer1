<?php
session_write_close();

use \GDPlayer\{HTML, InstanceCache, Views};

Views::userValidation();

setEnvCustom('title', 'Dashboard');
$cache = InstanceCache::getItem('hide-ext-dialog');
Views::loadBackendHeader();
echo HTML::renderBackendTemplate('dashboard.html.twig', [
    'title' => 'Dashboard',
    'admin_dir' => ADMIN_DIR,
    'is_admin' => isAdmin(),
    'is_windows' => PHP_OS_FAMILY === 'Windows',
    'hide_ext_dialog' => $cache->isHit() ? $cache->get() : false
]);
Views::loadBackendFooter();
