<?php
session_write_close();

use \GDPlayer\{Config, HTML, Views};

if (!validateBoolean(Config::get('enable_gsharer')) && !isAdmin()) {
    session_write_close();
    Views::loadPage403();
    exit;
}

$topBanner = Config::get('sh_banner_top') ?? '';
$bottomBanner = Config::get('sh_banner_bottom') ?? '';

setEnvCustom('title', 'Google Drive Direct Link Generator & Downloader');
setEnvCustom('description', 'Generate direct links and download Google Drive files without signing in to a Google account.');

Views::loadHeader();
?>
<div class="row bg-custom text-center">
    <div class="col py-5">
        <h1 class="h3">Google Drive Direct Link Generator &amp; Downloader</h1>
        <p>Generate direct link and download Google Drive file without signing in to a Google account.</p>
    </div>
</div>
<?php echo loadAds('mt-5'); ?>
<div class="row mt-3">
    <?php
    if (!empty($topBanner)) {
        session_write_close();
        echo '<div class="col-12 mb-3">' . $topBanner . '</div>';
    }
    ?>
    <div class="col-12">
        <?php
        echo HTML::renderTemplate('gdrive/sharer.html.twig', [
            'recaptcha_site_key' => Config::get('recaptcha_site_key'),
            'enable_ajax_downloader' => validateBoolean(Config::get('enable_gdrive_downloader')),
            'baseURL' => BASE_URL,
        ]);
        ?>
    </div>
    <?php
    if (!empty($bottomBanner)) {
        session_write_close();
        echo '<div class="col-12 mt-3">' . $bottomBanner . '</div>';
    }
    ?>
</div>
<?php
Views::loadFooter();
