<?php

use \GDPlayer\{Config, HTML, PluginManager, Widget};

$baseThemeUrl = BASE_URL . 'themes/backend/xvs/';
$jsExt = validateBoolean(Config::get('production_mode')) ? 'min.js' : 'js';
echo HTML::loadScript('assets/vendor/jquery-ui/1.4.1/jquery-ui.' . $jsExt);
echo HTML::loadScript($baseThemeUrl . 'assets/js/bootstrap.bundle.min.js');
echo HTML::loadScript($baseThemeUrl . 'assets/js/datatables.min.js');
echo HTML::loadScript('assets/vendor/bootstrap-sweetalert/1.0.1/sweetalert.' . $jsExt);
echo HTML::loadScript('assets/vendor/bs-custom-file-input/1.3.4/bs-custom-file-input.' . $jsExt);
echo HTML::loadScript('assets/vendor/select2/4.0.13/js/select2.' . $jsExt);
echo HTML::loadScript('assets/vendor/jquery-wheelcolorpicker/3.0.9/jquery.wheelcolorpicker.min.js');
echo HTML::loadScript('assets/vendor/toastify-js/1.12.0/toastify.' . $jsExt);
echo HTML::loadScript('assets/vendor/apexcharts/4.3.0/apexcharts.' . $jsExt);
echo HTML::loadScript('assets/vendor/multi-select/0.9.12/js/jquery.multi-select.js');
echo HTML::loadScript('assets/js/md5.js');
echo HTML::loadScript(sprintf('assets/js/main-v%s.%s', JS_VERSION, $jsExt));
echo HTML::loadScript($baseThemeUrl . "assets/js/app.js");
PluginManager::renderScripts('footer', '*');
echo Widget::recaptcha();
echo Widget::histats();
echo Config::get('chat_widget');
echo Widget::default();
