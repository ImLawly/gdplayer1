<?php
session_write_close();

use \GDPlayer\{Config, Views, Widget};

$slogan = Config::get('site_slogan') ?? 'Google Drive Video Player';
$description = Config::get('site_description') ?? 'Google Drive Video Player Tool';

setEnvCustom('title', $slogan);
Views::loadHeader();
?>
<div class="row">
    <div class="col py-5 bg-custom text-center">
        <h1 class="h3"><?php echo $slogan; ?></h1>
        <p><?php echo htmlspecialchars_decode($description); ?></p>
    </div>
</div>
<div class="row my-3">
    <div class="col">
        <?php echo Widget::createPlayerGenerator(); ?>
    </div>
</div>
<?php
echo loadAds('my-3');
echo Widget::createPlayerResult();
echo Widget::hostLinkExample();
echo Widget::disqus();
Views::loadFooter();
