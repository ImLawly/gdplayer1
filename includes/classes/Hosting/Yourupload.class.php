<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:36              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 namespace GDPlayer\Hosting; class Yourupload extends \GDPlayer\CoreExtractor { protected $baseURL = "\150\164\164\160\x73\72\x2f\57\167\x77\167\x2e\x79\x6f\165\x72\165\x70\x6c\157\141\144\56\143\x6f\x6d\x2f"; public function __construct(string $id = '') { goto yfM2K; mczkx: $this->curlRequest($this->baseURL . "\x65\155\142\145\144\57" . $id, [], function ($response) { goto A9eyO; lJeSz: $this->image = getStringBetween($response, "\x69\x6d\141\147\x65\42\40\143\157\156\x74\145\156\164\x3d\x22", $close); goto bLDH7; QBy2q: $this->status = "\x6f\x6b"; goto lMcRM; y2rTn: if (!validateUrl($video)) { goto ZyXgr; } goto QBy2q; dzP0G: $this->sources = $this->getNewSources($sources); goto Hhlpi; A9eyO: $close = "\42"; goto CzzLj; Hhlpi: ZyXgr: goto EnO5p; lMcRM: $sources = [["\146\x69\154\x65" => $video, "\x74\x79\x70\x65" => $this->videoType, "\154\x61\x62\145\x6c" => "\x4f\x72\151\147\x69\156\141\154"]]; goto dzP0G; CzzLj: $video = getStringBetween($response, "\166\151\144\145\157\42\40\143\157\156\x74\x65\156\164\75\x22", $close); goto lJeSz; bLDH7: $this->title = getStringBetween($response, "\164\151\x74\x6c\145\x22\x20\143\157\x6e\x74\x65\156\164\75\42", $close); goto y2rTn; EnO5p: }); goto LSNnt; yfM2K: session_write_close(); goto tGVwj; tGVwj: parent::__construct($id); goto mczkx; LSNnt: } }
