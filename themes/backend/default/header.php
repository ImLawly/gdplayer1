<?php
session_write_close();

use \GDPlayer\{Config, HTML, Widget};

$defaultColor = '673ab7';
$themeColor = '#' . (Config::get('pwa_themecolor') ?? $defaultColor);
$isDarkMode = !empty($_COOKIE['theme']) && $_COOKIE['theme'] === 'dark';
$userLogin = currentUser();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <base href="<?php echo BASE_URL; ?>">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="robots" content="noindex">

    <meta name="msapplication-TileColor" content="<?php echo $themeColor; ?>">
    <meta name="theme-color" content="<?php echo $themeColor; ?>">
    <meta name="mobile-web-app-capable" content="yes">

    <link rel="manifest" href="manifest.json">
    <link rel="mask-icon" href="assets/img/maskable_icon.png" color="#ffffff">

    <link rel="shortcut icon" href="favicon.ico" type="image/ico">
    <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
    <link rel="apple-touch-icon-precomposed" sizes="152x152" href="assets/img/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon-precomposed" sizes="152x152" href="assets/img/apple-touch-icon-152x152-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="120x120" href="assets/img/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon-precomposed" sizes="120x120" href="assets/img/apple-touch-icon-120x120-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="assets/img/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="assets/img/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon-precomposed" sizes="57x57" href="assets/img/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon-precomposed" href="assets/img/apple-touch-icon.png">
    <link rel="apple-touch-icon-precomposed" href="assets/img/apple-touch-icon-precomposed.png">

    <title><?php echo getEnvCustom('title') . ' - ' . sitename(); ?></title>

    <link rel="preconnect dns-prefetch" href="//<?php echo parse_url(BASE_URL, PHP_URL_HOST); ?>">
    <link rel="preconnect dns-prefetch" href="//www.gstatic.com">
    <link rel="preconnect dns-prefetch" href="//fonts.gstatic.com">
    <link rel="preconnect dns-prefetch" href="//www.googleapis.com">
    <link rel="preconnect dns-prefetch" href="//www.googletagmanager.com">
    <link rel="preconnect dns-prefetch" href="//www.google.com">
    <link rel="preconnect dns-prefetch" href="//www.google-analytics.com">
    <link rel="preconnect dns-prefetch" href="//googleusercontent.com">
    <link rel="preconnect dns-prefetch" href="//lh3.googleusercontent.com">
    <link rel="preconnect dns-prefetch" href="//drive-thirdparty.googleusercontent.com">
    <link rel="preconnect dns-prefetch" href="//static.addtoany.com">

    <?php
    include 'styles.php';

    echo HTML::loadScript('assets/vendor/jquery/3.7.1/jquery.min.js', false);
    echo HTML::loadScript('assets/vendor/FormData.js', false);
    ?>
    <script>
        var $ = jQuery.noConflict(),
            adminURL = '<?php echo BACKEND_BASEURL; ?>',
            baseURL = '<?php echo BASE_URL; ?>',
            imgCDNURL = baseURL,
            pluginsURL = baseURL + 'plugins/',
            uRole = <?php echo isset($userLogin['role']) ? sanitizeInt($userLogin['role']) : 1; ?>,
            vidHosts = <?php echo json_encode(supportedSites(), true); ?>,
            languages = <?php echo json_encode(array_values(languageList())); ?>,
            oldDBVersion = <?php echo intval(Config::get('updated')); ?>,
            newDBVersion = <?php echo DB_VERSION; ?>;
        window.themeColors = ['<?php echo '#' . (Config::get('custom_color') ?? $defaultColor); ?>', '<?php echo '#' . (Config::get('custom_color2') ?? $defaultColor); ?>'];
    </script>
    <?php
    echo Widget::googleAlaytics();
    echo Widget::googleTagManagerHead();
    ?>
</head>

<body class="bootstrap<?php echo $isDarkMode ? '-dark' : ' bg-light'; ?> mb-5">
    <?php echo Widget::googleTagManagerBody(); ?>
    <a class="sr-only sr-only-focusable" href="#main">Skip to main content</a>
    <div class="container-xl rounded-bottom <?php echo $isDarkMode ? 'bg-dark' : 'bg-white'; ?> shadow">
        <?php include 'nav.php'; ?>
        <main id="main" class="py-4" style="margin-top:56px">
