<?php
session_write_close();

use \GDPlayer\{Config, Views};

$cr_captions = [];
$cr_images = [];
if (is_dir(FRONTEND_THEME_PATH . '/assets/img/shop')) {
    openResourcesHandler();
    $handle = @opendir(FRONTEND_THEME_PATH . '/assets/img/shop');
    if ($handle) {
        while (($entry = readdir($handle)) !== false) {
            if ($entry !== '.' && $entry !== '..') {
                $name = pathinfo($entry, PATHINFO_FILENAME);
                $ext = pathinfo($entry, PATHINFO_EXTENSION);
                $cr_images[] = FRONTEND_THEME_BASEURL . 'assets/img/shop/' . $entry;
                $cr_captions[] = ucwords(trim($name));
            }
        }
        closedir($handle);
    }
}

setEnvCustom('title', 'Buy GDPlayer Google Drive Video Player');
setEnvCustom('description', 'Buy GDPlayer Google Drive Video Player Full Version only on the official site. Get lifetime update support.');

Views::loadHeader();
?>
<style>
    #crGDPlayer .carousel-control-next,
    #crGDPlayer .carousel-control-prev {
        opacity: 1;
        background: rgba(0, 0, 0, .3);
    }

    #crGDPlayer .carousel-caption {
        background-color: rgba(0, 0, 0, .3);
        bottom: 0;
    }
</style>
<div class="row pt-5">
    <div class="col-12 col-lg-4">
        <div class="card shadow-sm mb-3">
            <div class="card-header text-center">
                <h2 class="card-title h5 m-0">Checkout</h2>
            </div>
            <div class="card-body text-center">
                <h3 class="m-0 text-bold">$99.00</h3>
                <p class="text-muted">One-Time Payment</p>
                <a rel="noopener" href="https://ko-fi.com/s/3f38af940a" target="_blank" class="btn btn-success btn-block">Buy Now</a>
                <hr>
                <a rel="noopener" href="<?php echo Config::get('contact_page_link'); ?>" target="_blank" class="btn btn-secondary btn-block">Contact Us</a>
            </div>
        </div>
    </div>
    <div class="col-12 col-lg-8">
        <div class="card shadow-sm">
            <div class="card-header text-center">
                <h1 class="card-title h5 m-0">Buy GDPlayer Google Drive Video Player</h1>
            </div>
            <div class="card-body p-0">
                <?php if (!empty($cr_images)) : ?>
                    <div id="crGDPlayer" class="carousel slide" data-ride="carousel">
                        <div class="carousel-inner">
                            <?php foreach ($cr_images as $i => $dt) : ?>
                                <a rel="noopener" href="<?php echo $dt; ?>" target="_blank" class="carousel-item <?php echo $i === 0 ? 'active' : ''; ?>">
                                    <img src="<?php echo $dt; ?>" class="d-block w-100" alt="<?php echo $cr_captions[$i]; ?>">
                                    <div class="carousel-caption d-none d-md-block">
                                        <h5><?php echo $cr_captions[$i]; ?></h5>
                                    </div>
                                </a>
                            <?php endforeach; ?>
                        </div>
                        <button class="carousel-control-prev" type="button" data-target="#crGDPlayer" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-target="#crGDPlayer" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </button>
                    </div>
                <?php endif; ?>
                <div class="p-3">
                    <p>The most important thing is that we developed the source code ourselves so that whatever problem you face with this tool, we will solve it quickly.</p>
                    <h2 class="h5 mb-3">Features</h2>
                    <ol>
                        <li>You can play static HLS/MPD videos;</li>
                        <li>You can play live streaming HLS/MPD videos;</li>
                        <li>You can upload poster image;</li>
                        <li>You can upload multiple subtitles;</li>
                        <li>You can install this application on multiple load balancer servers without any additional scripts;</li>
                        <li>Support Apache/NGINX/Litespeed servers;</li>
                        <li>Support more than 45 hosts;</li>
                        <li>Support multiple resolutions;</li>
                        <li>Support JW Player and Plyr video players;</li>
                        <li>Support redis/sqlite/files cache to improve performance;</li>
                        <li>Support multiple VAST ads;</li>
                        <li>Support banner ads, popups, etc;</li>
                        <li>Support anti-adblockers;</li>
                        <li>Support shortener links like adfly, etc;</li>
                        <li>Support whitelisted/blacklisted ip/domain;</li>
                        <li>Support blacklisted titles;</li>
                        <li>Support reporting to Google Analytics so you can see which videos are crashing or playing;</li>
                        <li>Support smart cache so that if a video error will be created a new cache immediately;</li>
                        <li>Support PWA white labels.</li>
                    </ol>
                    <p>
                        <strong>DEMO SITE:</strong> <a rel="noopener" href="http://gdplayer.dev/administrator/login/" target="_blank" title="Visit gdplayer.dev" data-toggle="tooltip">gdplayer.dev</a><br>
                        Username: admin<br>
                        Password: admin
                    </p>
                    <div class="alert alert-warning">You must use a vps or dedicated server and activate some php functions if you want to use the following hosts: Facebook, HxFile, Microsoft Stream, Vidguard, Vixstream so make sure you can fully access your server.</div>
                    <h2 class="h5 mb-3">Frequently Asked Questions</h2>
                    <div class="accordion" id="accGDPlayer">
                        <div class="card border-0 mb-2">
                            <div id="heading1">
                                <button class="btn btn-danger btn-block text-left shadow-none" type="button" data-toggle="collapse" data-target="#collapse1" aria-expanded="true" aria-controls="collapse1">Can we add some features?</button>
                            </div>
                            <div id="collapse1" class="collapse show" aria-labelledby="heading1" data-parent="#accGDPlayer">
                                <div class="card-body">Yes, please contact us.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading2">
                                <button class="btn btn-warning btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse2" aria-expanded="false" aria-controls="collapse2">Can we resell the gdplayer script?</button>
                            </div>
                            <div id="collapse2" class="collapse" aria-labelledby="heading2" data-parent="#accGDPlayer">
                                <div class="card-body">You are not allowed to resell source code or publish it to public groups without our permission.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading3">
                                <button class="btn btn-success btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse3" aria-expanded="false" aria-controls="collapse3">Can you install the script on my server?</button>
                            </div>
                            <div id="collapse3" class="collapse" aria-labelledby="heading3" data-parent="#accGDPlayer">
                                <div class="card-body">Yes, we need access to your server for that.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading4">
                                <button class="btn btn-primary btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse4" aria-expanded="false" aria-controls="collapse4">Can we get the update file?</button>
                            </div>
                            <div id="collapse4" class="collapse" aria-labelledby="heading4" data-parent="#accGDPlayer">
                                <div class="card-body">You can get the update file via the download link provided after your purchase. Especially for old members who don't have a license key, you have to pay an update fee of $15 to get the license key.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading5">
                                <button class="btn btn-custom btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse5" aria-expanded="false" aria-controls="collapse5">Can we get a warranty?</button>
                            </div>
                            <div id="collapse5" class="collapse" aria-labelledby="heading5" data-parent="#accGDPlayer">
                                <div class="card-body">Yes, you will get an update file if the script doesn't work. You need to know that sometimes it's not just the script that crashes but also the server you're using, so let us know if you want to use a specific host first so we can check it before we sell it to you. Remember! We also provide server installation support.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading6">
                                <button class="btn btn-danger btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse6" aria-expanded="false" aria-controls="collapse6">Can we get a refund?</button>
                            </div>
                            <div id="collapse6" class="collapse" aria-labelledby="heading6" data-parent="#accGDPlayer">
                                <div class="card-body">No, you don't get it. There are no refunds in any way for digital products. Meet all the needs of your life before buying a script like this.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading7">
                                <button class="btn btn-warning btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse7" aria-expanded="false" aria-controls="collapse7">What are additional hosts?</button>
                            </div>
                            <div id="collapse7" class="collapse" aria-labelledby="heading7" data-parent="#accGDPlayer">
                                <div class="card-body">Additional hosts are added upon request. Those hosts are not on this standard package.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading8">
                                <button class="btn btn-success btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse8" aria-expanded="false" aria-controls="collapse8">How do I get these additional hosts?</button>
                            </div>
                            <div id="collapse8" class="collapse" aria-labelledby="heading8" data-parent="#accGDPlayer">
                                <div class="card-body">You have to buy it separately after purchasing this standard package.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading9">
                                <button class="btn btn-primary btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse9" aria-expanded="false" aria-controls="collapse9">Do I get the live tv script too?</button>
                            </div>
                            <div id="collapse9" class="collapse" aria-labelledby="heading9" data-parent="#accGDPlayer">
                                <div class="card-body">No, you don't get it. We don't sell live tv script.</div>
                            </div>
                        </div>
                        <div class="card border-0 mb-2">
                            <div id="heading10">
                                <button class="btn btn-custom btn-block text-left shadow-none collapsed" type="button" data-toggle="collapse" data-target="#collapse10" aria-expanded="false" aria-controls="collapse10">Does the tool have an API?</button>
                            </div>
                            <div id="collapse10" class="collapse" aria-labelledby="heading10" data-parent="#accGDPlayer">
                                <div class="card-body">No, the API only exists for internal purposes, there are no API features for the public or users. Use the embed page provided.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php
echo loadAds();
Views::loadFooter();
