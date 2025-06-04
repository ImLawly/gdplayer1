<?php
session_write_close();

use \GDPlayer\{Config, HTML};

$defaultColor = '673ab7';
$themeColor = '#' . (Config::get('pwa_themecolor') ?? $defaultColor);
$rgbColor = hex2RGB(trim($themeColor, '#'), true, ',') ?: '103, 58, 183';
$customColor = '#' . (Config::get('custom_color') ?? $defaultColor);
$customColor2 = '#' . (Config::get('custom_color2') ?? '3f51b5');

$cssExt = validateBoolean(Config::get('production_mode')) ? 'min.css' : 'css';
echo HTML::loadStyle('assets/vendor/font-awesome/6.7.2/css/all.' . $cssExt);
echo HTML::loadStyle('assets/vendor/bootstrap/4.6.2/css/bootstrap.' . $cssExt);
echo HTML::loadStyle('assets/vendor/bootstrap-sweetalert/1.0.1/sweetalert.' . $cssExt);
echo HTML::loadStyle('assets/vendor/select2/4.0.13/css/select2.' . $cssExt);
echo HTML::loadStyle('assets/vendor/select2-bootstrap4-theme/1.5.2/select2-bootstrap4.' . $cssExt);
echo HTML::loadStyle('assets/css/bs-dark-v1.3.1.min.css');
echo HTML::loadStyle("themes/frontend/default/assets/css/style-v3.4.1.{$cssExt}");
?>
<style>
    a,
    .page-link,
    .btn-outline-custom {
        color: <?php echo $customColor; ?>;
    }

    .btn-outline-custom {
        border-color: <?php echo $customColor; ?>;
    }

    a:hover,
    .page-link:hover {
        color: <?php echo $customColor2; ?>;
    }

    .border-custom {
        border-color: <?php echo $customColor; ?> !important;
    }

    .page-item.active .page-link,
    .dropdown-item.active,
    .dropdown-item:active,
    .bg-custom,
    .btn-custom,
    .nav-pills .nav-link.active,
    .nav-pills .show>.nav-link {
        color: #fff !important;
        border-color: <?php echo $customColor; ?>;
        background-image: -webkit-linear-gradient(to right, <?php echo $customColor; ?>, <?php echo $customColor2; ?>);
        background-image: -moz-linear-gradient(to right, <?php echo $customColor; ?>, <?php echo $customColor2; ?>);
        background-image: -o-linear-gradient(to right, <?php echo $customColor; ?>, <?php echo $customColor2; ?>);
        background-image: linear-gradient(to right, <?php echo $customColor; ?>, <?php echo $customColor2; ?>);
        background-color: <?php echo $customColor; ?>;
    }

    .btn-outline-custom.active,
    .btn-outline-custom:active,
    .btn-outline-custom.focus,
    .btn-outline-custom:focus,
    .btn-outline-custom:not(:disabled):hover,
    .btn-custom.focus,
    .btn-custom:focus,
    .btn-custom:not(:disabled):hover {
        color: #fff !important;
        border-color: <?php echo $customColor2; ?>;
        background-image: -webkit-linear-gradient(to right, <?php echo $customColor2; ?>, <?php echo $customColor; ?>);
        background-image: -moz-linear-gradient(to right, <?php echo $customColor2; ?>, <?php echo $customColor; ?>);
        background-image: -o-linear-gradient(to right, <?php echo $customColor2; ?>, <?php echo $customColor; ?>);
        background-image: linear-gradient(to right, <?php echo $customColor2; ?>, <?php echo $customColor; ?>);
        background-color: <?php echo $customColor2; ?>;
    }

    .page-link:focus,
    .btn-outline-custom.focus,
    .btn-outline-custom:focus,
    .btn-outline-custom:not(:disabled):hover,
    .btn-custom.focus,
    .btn-custom:focus {
        box-shadow: 0 0 0 .2rem rgba(<?php echo $rgbColor; ?>, .2);
    }

    .table-hover tbody tr:hover td {
        background-color: rgba(<?php echo $rgbColor; ?>, .07) !important;
    }

    .bootstrap-dark .table-hover tbody tr:hover td {
        background-color: rgba(<?php echo $rgbColor; ?>, .2) !important;
    }

    #footer .nav-link.active,
    #footer .nav-link:active,
    #footer .nav-link:focus,
    #footer .nav-link:hover {
        color: <?php echo $customColor; ?> !important;
    }
</style>
