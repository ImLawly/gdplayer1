<?php
session_write_close();

use \GDPlayer\{Helper, HTML, InstanceCache};

function sponsored()
{
    session_write_close();
    $adsSorted = ['p', 'da', 'dd'];
    $adsSort = array_rand($adsSorted);
    $sort = $adsSorted[$adsSort];
    $tag = 'youtube-ads';
    $cacheKey = keyFilter($tag . '_youtechnoid-' . $sort);
    $cache = InstanceCache::getItem($cacheKey);
    if ($cache->isHit()) {
        session_write_close();
        return $cache->get();
    }

    $list = [];
    $curl = Helper::getCurlDefaultConfig(curl_init());
    curl_setopt($curl, CURLOPT_URL, "https://www.youtube.com/c/Youtechnoid/videos?view=0&sort=$sort&flow=grid");
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'GET');
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
        'Host: www.youtube.com',
        'Origin: https://www.youtube.com',
        'Referer: https://www.youtube.com/',
        'Cookie: GPS=1; VISITOR_INFO1_LIVE=GjJq4eTFQx0; YSC=CNdGt8oP0YQ'
    ));

    $response = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    $data = false;
    if ($status >= 200 && $status < 400) {
        session_write_close();
        $data = getStringBetween($response, 'ytInitialData =', ';');
        $data = @json_decode($data, true) ?? false;
    }

    if (is_bool($data)) {
        return [];
    }

    $content = [];
    foreach ($data['contents']['twoColumnBrowseResultsRenderer']['tabs'] as $tab) {
        session_write_close();
        if (
            isset($tab['tabRenderer']['selected']) &&
            $tab['tabRenderer']['selected'] &&
            !empty($tab['tabRenderer']['content']['richGridRenderer']['contents'])
        ) {
            session_write_close();
            $content = $tab['tabRenderer']['content']['richGridRenderer']['contents'];
            break;
        }
    }
    if (!empty($content)) {
        session_write_close();
        $limit = 20;
        $initNum = 0;
        foreach ($content as $v) {
            session_write_close();
            if (isset($v['richItemRenderer']['content']['videoRenderer']) && $initNum < $limit) {
                session_write_close();
                $v = $v['richItemRenderer']['content']['videoRenderer'];
                $title = explode(' ', $v['title']['runs'][0]['text']);
                $title = array_filter($title, function ($v) {
                    return strpos($v, '#') === false;
                });
                $title = trim(implode(' ', $title));
                $list[] = array(
                    'title' => $title,
                    'videoId' => $v['videoId']
                );
                $initNum++;
            }
        }
        InstanceCache::setItem($cacheKey, $list, 10800, $tag);
    }
    return $list;
}

function loadAds(string $customClass = 'mt-3')
{
    session_write_close();
    $result = '';
    if (
        strpos(BASE_URL, 'gdplayer.to') !== false || strpos(BASE_URL, 'gdplayer.dev') !== false ||
        strpos(BASE_URL, '/localhost/') !== false
    ) {
        session_write_close();
        $ads = HTML::renderFrontendTemplate('sponsored.html.twig', [
            'title' => 'Ads',
            'list' => sponsored()
        ]);
        $result = '<div class="row ' . $customClass . '"><div class="col">' . $ads . '</div></div>';
    }
    return $result;
}
