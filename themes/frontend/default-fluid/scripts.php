<?php
session_write_close();

use \GDPlayer\{Config, HTML, Widget};

$jsExt = validateBoolean(Config::get('production_mode')) ? 'min.js' : 'js';
echo HTML::loadScript('assets/vendor/pwacompat/2.0.17/pwacompat.min.js');
echo HTML::loadScript('assets/vendor/bootstrap/4.6.2/js/bootstrap.bundle.' . $jsExt);
echo HTML::loadScript('assets/vendor/select2/4.0.13/js/select2.' . $jsExt);
echo HTML::loadScript('assets/vendor/bootstrap-sweetalert/1.0.1/sweetalert.' . $jsExt);
echo HTML::loadScript('assets/vendor/bs-custom-file-input/1.3.4/bs-custom-file-input.' . $jsExt);
echo HTML::loadScript('assets/vendor/js-cookie/3.0.5/js.cookie.' . $jsExt);
echo HTML::loadScript(sprintf('assets/js/main-v%s.%s', JS_VERSION, $jsExt));
echo Widget::recaptcha();
echo Widget::sharer();
echo Widget::histats();
echo Config::get('chat_widget');
echo Widget::default();
