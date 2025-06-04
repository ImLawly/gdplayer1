<?php
session_write_close();

use \GDPlayer\Config;

$dmca_link = Config::get('dmca_page_link');
$contact_link = Config::get('contact_page_link');

$defaultColor = '673ab7';
$themeColor = '#' . (Config::get('pwa_themecolor') ?? $defaultColor);
$rgbColor = hex2RGB(trim($themeColor, '#'), true, ',') ?: '103, 58, 183';
$customColor = '#' . (Config::get('custom_color') ?? $defaultColor);
$customColor2 = '#' . (Config::get('custom_color2') ?? '3f51b5');
?>
</main>
<footer id="footer" class="row py-5 bg-dark text-center text-light rounded-bottom">
    <div class="col-12">
        <ul class="nav justify-content-center mb-3">
            <li class="nav-item">
                <a class="nav-link" href="">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="changelog/">Change Log</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="terms/">Terms</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="privacy/">Privacy</a>
            </li>
            <?php if (!empty($dmca_link)) : ?>
                <li class="nav-item">
                    <a class="nav-link" href="<?php echo $dmca_link; ?>" target="_blank" rel="noopener">DMCA</a>
                </li>
            <?php endif; ?>
            <?php if (!empty($contact_link)) : ?>
                <li class="nav-item">
                    <a class="nav-link" href="<?php echo $contact_link; ?>" target="_blank" rel="noopener">Contact</a>
                </li>
            <?php endif; ?>
        </ul>
        <p>&copy; 2020 - <?php echo date('Y'); ?>. Made with <em class="fas fa-heart text-danger"></em> by <?php echo sitename(); ?>. Version <?php echo APP_VERSION; ?></p>
    </div>
</footer>
</div>
<button type="button" id="gotoTop" title="Go to Top" class="bg-custom shadow">
    <span class="gotoContent">
        <em class="fas fa-chevron-up"></em>
    </span>
</button>
<?php
include 'scripts.php';
?>
</body>

</html>
