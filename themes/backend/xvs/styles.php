<?php

use \GDPlayer\{Config, HTML};

$defaultColor = '673ab7';
$themeColor = '#' . (Config::get('pwa_themecolor') ?? $defaultColor);
$rgbColor = hex2RGB(trim($themeColor, '#'), true, ',') ?: '103, 58, 183';
$customColor = '#' . (Config::get('custom_color') ?? $defaultColor);
$customColor2 = '#' . (Config::get('custom_color2') ?? '3f51b5');
$baseThemeUrl = BASE_URL . 'themes/backend/xvs/';
$cssExt = validateBoolean(Config::get('production_mode')) ? 'min.css' : 'css';
echo HTML::loadStyle($baseThemeUrl . 'assets/css/bootstrap.min.css');
echo HTML::loadStyle($baseThemeUrl . 'assets/css/datatables.min.css');
echo HTML::loadStyle($baseThemeUrl . 'assets/css/icomoon.css');
echo HTML::loadStyle('assets/vendor/font-awesome/6.7.2/css/all.' . $cssExt);
echo HTML::loadStyle('assets/vendor/bootstrap-sweetalert/1.0.1/sweetalert.' . $cssExt);
echo HTML::loadStyle('assets/vendor/select2/4.0.13/css/select2.' . $cssExt);
echo HTML::loadStyle('assets/vendor/select2-bootstrap4-theme/1.5.2/select2-bootstrap4.' . $cssExt);
echo HTML::loadStyle('assets/vendor/jquery-wheelcolorpicker/3.0.9/css/wheelcolorpicker.css');
echo HTML::loadStyle('assets/vendor/toastify-js/1.12.0/toastify.' . $cssExt);
echo HTML::loadStyle('assets/vendor/apexcharts/4.3.0/apexcharts.' . $cssExt);
echo HTML::loadStyle('assets/vendor/multi-select/0.9.12/css/multi-select.dist.css');
echo HTML::loadStyle($baseThemeUrl . 'assets/css/styles.css');
?>
<style>
    a,
    .page-link,
    .btn-outline-custom,
    .text-custom {
        color: <?php echo $customColor; ?>;
    }

    .btn-outline-custom {
        border-color: <?php echo $customColor; ?>;
    }

    a:hover,
    .page-link:hover,
    .text-custom2 {
        color: <?php echo $customColor2; ?>;
    }

    .border-custom {
        border-color: <?php echo $customColor; ?> !important;
    }

    div.dataTables_processing>div:last-child>div,
    .select2-container--bootstrap4 .select2-results__option--highlighted,
    .select2-container--bootstrap4 .select2-results__option--highlighted.select2-results__option[aria-selected=true],
    .page-item.active .page-link,
    .dropdown-item.active,
    .dropdown-item:active,
    .bg-custom,
    .btn-custom,
    .nav-pills .nav-link.active,
    .nav-pills .show>.nav-link,
    .block.block-gr {
        color: #fff;
        border-color: <?php echo $customColor; ?>;
        background-color: <?php echo $customColor; ?>;
        background-image: -webkit-linear-gradient(to right, <?php echo $customColor; ?>, <?php echo $customColor2; ?>);
        background-image: -moz-linear-gradient(to right, <?php echo $customColor; ?>, <?php echo $customColor2; ?>);
        background-image: -o-linear-gradient(to right, <?php echo $customColor; ?>, <?php echo $customColor2; ?>);
        background-image: linear-gradient(to right, <?php echo $customColor; ?>, <?php echo $customColor2; ?>)
    }

    .btn-outline-custom.active,
    .btn-outline-custom:active,
    .btn-outline-custom.focus,
    .btn-outline-custom:focus,
    .btn-outline-custom:not(:disabled):hover,
    .btn-custom.focus,
    .btn-custom:focus,
    .btn-custom:not(:disabled):hover,
    .btn-check:checked+.btn,
    .btn.active,
    .btn.show {
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
        box-shadow: 0 0 0 .2rem rgba(<?php echo $rgbColor; ?>, .2) !important
    }

    .table-hover tbody tr:hover td {
        background-color: rgba(<?php echo $rgbColor; ?>, .07) !important;
    }

    .bootstrap-dark .table-hover tbody tr:hover td {
        background-color: rgba(<?php echo $rgbColor; ?>, .2) !important;
    }

    #subsWrapper .input-group-prepend {
        max-width: 150px;
    }

    #footer .nav-link.active,
    #footer .nav-link:active,
    #footer .nav-link:focus,
    #footer .nav-link:hover {
        color: <?php echo $customColor; ?> !important;
    }
</style>