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
echo HTML::loadStyle('assets/vendor/jquery-wheelcolorpicker/3.0.9/css/wheelcolorpicker.css');
echo HTML::loadStyle('assets/vendor/toastify-js/1.12.0/toastify.' . $cssExt);
echo HTML::loadStyle('assets/vendor/apexcharts/4.3.0/apexcharts.' . $cssExt);
echo HTML::loadStyle('assets/vendor/multi-select/0.9.12/css/multi-select.dist.css');
echo HTML::loadStyle('assets/vendor/datatables/2.2.1/datatables.min.css');
echo HTML::loadStyle("assets/css/bs-dark-v1.3.1.min.css");
echo HTML::loadStyle("themes/backend/default-fluid/assets/css/style-v3.4.1.{$cssExt}");
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

    div.dataTables_processing>div:last-child>div,
    .select2-container--bootstrap4 .select2-results__option--highlighted,
    .select2-container--bootstrap4 .select2-results__option--highlighted.select2-results__option[aria-selected=true],
    .page-item.active .page-link,
    .dropdown-item.active,
    .dropdown-item:active,
    .bg-custom,
    .btn-custom,
    .nav-pills .nav-link.active,
    .nav-pills .show>.nav-link {
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
