<?php
session_write_close();

use \GDPlayer\{Config, Widget};

$devHost = parse_url(BASE_URL, PHP_URL_HOST);
$isGDPlayer = strpos($devHost, 'gdplayer.to') !== false ||
    strpos($devHost, 'gdplayer.dev') !== false ||
    strpos($devHost, 'localhost') !== false;
$userLogin = currentUser();
?>
<header id="header" class="container-fluid fixed-top bg-white shadow">
    <?php echo Widget::licenseDialog(); ?>
    <nav class="navbar navbar-expand-lg navbar-dark bg-custom row">
        <a class="navbar-brand" href="<?php echo BACKEND_BASEURL; ?>">Control Panel</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse navbar-nav-scroll" id="navbarCollapse" style="max-height:calc(100vh - 50px)">
            <?php
            $iGear = 'fas fa-gear mr-2';
            $iPlusCircle = 'fas fa-plus-circle mr-2';
            $iAngleDoubleRight = 'fas fa-angle-double-right text-right mr-2';
            $generalMenuURL = BACKEND_BASEURL . 'settings/general/';
            $closeUL = '</ul>';
            $themeMenu = Widget::createMenu('Theme Mode', '#', '', 'fas fa-' . ($isDarkMode ? 'moon' : 'sun') . ' ico-theme mr-2', array(
                Widget::createSubMenu('Light', $_SERVER['REQUEST_URI'] . '#theme=light', '', 'fas fa-sun mr-2'),
                Widget::createSubMenu('Dark', $_SERVER['REQUEST_URI'] . '#theme=dark', '', 'fas fa-moon mr-2')
            ));
            if ($userLogin) {
                session_write_close();
                echo '<ul class="navbar-nav">';
                echo Widget::createMenu('Home', BASE_URL, 'd-lg-none ml-2', 'fas fa-home');
                echo Widget::createMenu('Dashboard', BACKEND_BASEURL . 'dashboard/', '', 'fas fa-tachometer-alt mr-2');
                echo Widget::createMenu('Videos', BACKEND_BASEURL . 'videos/list/', '', 'fas fa-film mr-2', array(
                    Widget::createSubMenu('Add New Video', BACKEND_BASEURL . 'videos/new/', '', $iPlusCircle),
                    Widget::createSubMenuDivider(),
                    Widget::createSubMenu('Video List', BACKEND_BASEURL . 'videos/list/', '', 'fas fa-film mr-2'),
                    Widget::createSubMenu('Subtitle Manager', BACKEND_BASEURL . 'videos/subtitles/', '', 'fas fa-copy mr-2')
                ));
                if (intval($userLogin['role']) === 0) {
                    session_write_close();
                    echo Widget::createMenu('Google Drive', BACKEND_BASEURL . 'gdrive/list/', '', 'fab fa-google-drive mr-2', array(
                        Widget::createSubMenu('Add New Account', BACKEND_BASEURL . 'gdrive/new/', '', $iPlusCircle),
                        Widget::createSubMenuDivider(),
                        Widget::createSubMenu('Account List', BACKEND_BASEURL . 'gdrive/list/', '', 'fas fa-key text-right mr-2'),
                        Widget::createSubMenu('File List', BACKEND_BASEURL . 'gdrive/files/', '', 'fas fa-copy mr-2'),
                        Widget::createSubMenu('Backup File List', BACKEND_BASEURL . 'gdrive/backup-files/', '', 'fas fa-clone mr-2'),
                        Widget::createSubMenu('Backup Queue List', BACKEND_BASEURL . 'gdrive/backup-queue/', '', 'fas fa-calendar-check mr-2')
                    ));
                    echo Widget::createMenu('Users', BACKEND_BASEURL . 'users/list/', '', 'fas fa-users mr-2', array(
                        Widget::createSubMenu('Add New User', BACKEND_BASEURL . 'users/new/', '', $iPlusCircle),
                        Widget::createSubMenuDivider(),
                        Widget::createSubMenu('User List', BACKEND_BASEURL . 'users/list/', '', 'fas fa-users mr-2'),
                        Widget::createSubMenu('Session List', BACKEND_BASEURL . 'users/sessions/', '', 'fas fa-history mr-2')
                    ));
                    $appSubmenu = array(
                        Widget::createSubMenuHeader('Settings', '', $iGear),
                        Widget::createSubMenu('Website', BACKEND_BASEURL . 'settings/web/', '', $iAngleDoubleRight),
                        Widget::createSubMenu('General', $generalMenuURL, '', $iAngleDoubleRight),
                        Widget::createSubMenu('Public', BACKEND_BASEURL . 'settings/public/', '', $iAngleDoubleRight),
                        Widget::createSubMenu('Video Player', BACKEND_BASEURL . 'settings/video/', '', $iAngleDoubleRight),
                        Widget::createSubMenu('Advertisement', BACKEND_BASEURL . 'settings/ads/', '', $iAngleDoubleRight),
                        Widget::createSubMenu('Shortener Link', BACKEND_BASEURL . 'settings/shortlink/', '', $iAngleDoubleRight),
                        Widget::createSubMenu('SMTP', BACKEND_BASEURL . 'settings/smtp/', '', $iAngleDoubleRight),
                        Widget::createSubMenu('Video Hosting', BACKEND_BASEURL . 'settings/video-hosting/', '', $iAngleDoubleRight),
                        Widget::createSubMenu('Miscellaneous', BACKEND_BASEURL . 'settings/misc/', '', $iAngleDoubleRight)
                    );
                    $appSubmenu = array_merge(array(
                        Widget::createSubMenuHeader('Load Balancer', '', 'fas fa-server mr-2'),
                        Widget::createSubMenu('Servers', BACKEND_BASEURL . 'settings/load-balancers/list/', '', $iAngleDoubleRight),
                        Widget::createSubMenuDivider()
                    ), $appSubmenu, array(
                        Widget::createSubMenuDivider(),
                        Widget::createSubMenu('Reset Settings', BACKEND_BASEURL . 'settings/reset/', '', $iAngleDoubleRight)
                    ));
                    echo Widget::createMenu('App', $generalMenuURL, '', $iGear, $appSubmenu);
                    echo $themeMenu;
                }
                echo $closeUL;
                echo '<ul class="navbar-nav ml-auto">';
                echo Widget::createMenu($userLogin['name'], BACKEND_BASEURL . 'profile/', '', 'fas fa-user-circle mr-2', array(
                    Widget::createSubMenu('My Account', BACKEND_BASEURL . 'profile/', '', 'fas fa-user mr-2'),
                    Widget::createSubMenuDivider(),
                    Widget::createSubMenu('Logout', BACKEND_BASEURL . 'login/?logout=true', '', 'fas fa-sign-out-alt mr-2')
                ), 'nav-link', 'dropdown-menu-right');
                echo $closeUL;
            } else {
                session_write_close();
                echo '<ul class="navbar-nav ml-auto">';
                echo Widget::createMenu('Home', BASE_URL, '', 'fas fa-home mr-2');
                if (isAnonymous()) {
                    session_write_close();
                    echo Widget::createMenu('Login', BACKEND_BASEURL . 'login/', '', 'fas fa-sign-in-alt mr-2');
                    if (!file_exists(BASE_DIR . '.rent') && validateBoolean(Config::get('enable_registration'))) {
                        echo Widget::createMenu('Register', BACKEND_BASEURL . 'register/', '', 'fas fa-user-plus mr-2');
                    }
                    echo Widget::createMenu('Reset Password', BACKEND_BASEURL . 'reset-password/', '', 'fas fa-sync-alt mr-2');
                }
                echo $themeMenu;
                if ($isGDPlayer) {
                    echo Widget::createMenu('Live TV', 'https://en.gdplayertv.to/', '', 'fas fa-tv mr-2');
                    echo Widget::createMenu('Buy', BASE_URL . 'buy/', '', 'fas fa-shopping-basket mr-2', array(
                        Widget::createSubMenu('Buy Video Player', BASE_URL . 'buy/', '', 'fas fa-shopping-basket mr-2'),
                        Widget::createSubMenu('Buy Additional Hosts', BASE_URL . 'buy-additional-host/', '', $iPlusCircle),
                    ), 'btn btn-block btn-green', 'dropdown-menu-right');
                }
                echo $closeUL;
            }
            ?>
        </div>
    </nav>
</header>
