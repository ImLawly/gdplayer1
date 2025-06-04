<?php
session_write_close();

use \GDPlayer\{Config, HTML, Views, Widget};

$allowAnonym = isAnonymous();
$userLogin = currentUser();

if ($_SERVER['REQUEST_METHOD'] === 'POST' || (!$allowAnonym && !$userLogin)) {
    Views::loadPage403();
    exit;
} elseif (isLoadBalancer()) {
    $mainSiteUrl = Config::get('main_site');
    if (!empty($mainSiteUrl)) {
        redirectTo($mainSiteUrl);
        exit;
    } else {
        Views::loadPage403();
        exit;
    }
}

$isAdmin = $userLogin && intval($userLogin['role']) === 0;
$defaultColor = '673ab7';
$themeColor = '#' . (Config::get('pwa_themecolor') ?? $defaultColor);
$isDarkMode = ($_COOKIE['theme'] ?? '') === 'dark';

$devHost = parse_url(BASE_URL, PHP_URL_HOST);
$isGDPlayer = stripos($devHost, 'gdplayer.to') !== false ||
    stripos($devHost, 'gdplayer.dev') !== false ||
    stripos($devHost, 'localhost') !== false;
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <base href="<?php echo BASE_URL; ?>">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <meta name="msapplication-TileColor" content="<?php echo $themeColor; ?>">
    <meta name="theme-color" content="<?php echo $themeColor; ?>">
    <meta name="mobile-web-app-capable" content="yes">

    <meta name="description" content="<?php echo getEnvCustom('description'); ?>">

    <!-- facebook -->
    <meta name="og:sitename" content="<?php echo Config::get('site_name'); ?>">
    <meta name="og:title" content="<?php echo getEnvCustom('title'); ?>">
    <meta name="og:description" content="<?php echo getEnvCustom('description'); ?>">
    <meta name="og:type" content="Website">
    <meta name="og:image" content="<?php echo getEnvCustom('poster'); ?>">

    <!-- twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo getEnvCustom('title'); ?>">
    <meta name="twitter:description" content="<?php echo getEnvCustom('description'); ?>">
    <meta name="twitter:image" content="<?php echo getEnvCustom('poster'); ?>">

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

    <title><?php echo getEnvCustom('title') . ' - ' . Config::get('site_name'); ?></title>

    <link rel="preconnect dns-prefetch" href="//<?php echo parse_url(BASE_URL)['host']; ?>">
    <link rel="preconnect dns-prefetch" href="//cdn.datatables.net">
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
            uid = <?php echo $userLogin ? $userLogin['id'] : 0; ?>,
            email = '<?php echo $userLogin ? $userLogin['email'] : ''; ?>',
            languages = <?php echo json_encode(array_values(languageList())); ?>,
            showModalUpdate = false,
            oldDBVersion = <?php echo intval(Config::get('updated')); ?>,
            newDBVersion = <?php echo DB_VERSION; ?>;
        window.themeColors = [];
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
        <header id="header">
            <nav class="navbar navbar-expand-lg container-xl fixed-top shadow bg-custom navbar-dark">
                <a class="navbar-brand" href=""><?php echo Config::get('site_name'); ?></a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse navbar-nav-scroll" id="navbarCollapse" style="max-height:calc(100vh - 56px)">
                    <ul class="navbar-nav ml-auto">
                        <?php
                        echo Widget::createMenu('Home', BASE_URL, '', 'fas fa-home mr-2');
                        if ($isAdmin || ($allowAnonym && validateBoolean(Config::get('enable_gsharer')))) {
                            echo Widget::createMenu('Bypass Limit', BASE_URL . 'sharer/', '', 'fab fa-google-drive mr-2');
                        }
                        if ($userLogin) {
                            echo Widget::createMenu('User Panel', BACKEND_BASEURL . 'dashboard/', '', 'fas fa-user-circle mr-2', array(
                                Widget::createSubMenu('Dashboard', BACKEND_BASEURL . 'dashboard/', '', 'fas fa-tachometer-alt mr-2'),
                                Widget::createSubMenu('My Videos', BACKEND_BASEURL . 'videos/list/', '', 'fas fa-film mr-2'),
                                Widget::createSubMenu('My Account', BACKEND_BASEURL . 'profile/', '', 'fas fa-user mr-2'),
                                Widget::createSubMenuDivider(),
                                Widget::createSubMenu('Logout', BACKEND_BASEURL . 'login/?logout=true', '', 'fas fa-sign-out-alt mr-2'),
                            ));
                        } elseif ($allowAnonym) {
                            echo Widget::createMenu('Login', BACKEND_BASEURL . 'login/', '', 'fas fa-sign-in-alt mr-2');
                            if (!file_exists(BASE_DIR . '.rent') && validateBoolean(Config::get('enable_registration'))) {
                                echo Widget::createMenu('Register', BACKEND_BASEURL . 'register/', '', 'fas fa-user-plus mr-2');
                            }
                        }
                        echo Widget::createMenu('Theme Mode', '#', '', 'fas fa-' . ($isDarkMode ? 'moon' : 'sun') . ' ico-theme mr-2', array(
                            Widget::createSubMenu('Light', $_SERVER['REQUEST_URI'] . '#theme=light', '', 'fas fa-sun mr-2'),
                            Widget::createSubMenu('Dark', $_SERVER['REQUEST_URI'] . '#theme=dark', '', 'fas fa-moon mr-2')
                        ));
                        if ($isGDPlayer) {
                            echo Widget::createMenu('Live TV', 'https://en.gdplayertv.to/', '', 'fas fa-tv mr-2');
                            echo Widget::createMenu('Buy', BASE_URL . 'buy/', '', 'fas fa-shopping-basket mr-2', array(
                                Widget::createSubMenu('Buy Video Player', BASE_URL . 'buy/', '', 'fas fa-shopping-basket mr-2'),
                                Widget::createSubMenu('Buy Additional Hosts', BASE_URL . 'buy-additional-host/', '', 'fas fa-plus-circle mr-2')
                            ), 'btn btn-block btn-green', 'dropdown-menu-right');
                        }
                        ?>
                    </ul>
                </div>
            </nav>
        </header>
        <main id="main" class="pb-5" style="margin-top:56px">