<?php
session_write_close();

use \GDPlayer\Views;

setEnvCustom('title', 'Buy GDPlayer Google Drive Video Player');
setEnvCustom('description', 'Buy GDPlayer Google Drive Video Player Full Version only on the official site. Get lifetime update support.');

Views::loadHeader();
?>
<div class="row pt-5">
    <div class="col-sm-6 col-lg-3 mb-3">
        <div class="card shadow-sm">
            <div class="card-header p-2 text-center">
                <h2 class="h5">Buy Single Host</h2>
                <h4 class="card-subtitle h5 mb-0 text-primary">$10</h4>
            </div>
            <div class="card-body p-2 text-center">
                <a rel="noopener" href="https://ko-fi.com/s/7ceda84eff" target="_blank" class="btn btn-block btn-primary">Buy Now</a>
            </div>
        </div>
    </div>
    <div class="col-sm-6 col-lg-3 mb-3">
        <div class="card shadow-sm">
            <div class="card-header p-2 text-center">
                <h2 class="h5">Buy Additional Hosts</h2>
                <h4 class="card-subtitle h5 mb-0 text-primary">$50</h4>
            </div>
            <div class="card-body p-2 text-center">
                <a rel="noopener" href="https://ko-fi.com/s/d9430b55b2" target="_blank" class="btn btn-block btn-danger">Buy Now</a>
            </div>
        </div>
    </div>
</div>
<?php
echo loadAds();
Views::loadFooter();
