<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:35              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 namespace GDPlayer\Hosting; class Vudeo extends \GDPlayer\CoreExtractor { protected $baseURL = "\150\164\x74\x70\x73\x3a\57\x2f\166\x75\x64\145\x6f\56\167\x73\57"; public function __construct(string $id = '') { goto oDg9e; kC2jP: parent::__construct($id); goto RChIN; oDg9e: session_write_close(); goto CFmtx; CFmtx: $this->url = $this->baseURL . "\x65\x6d\142\x65\x64\x2d" . $id . "\56\150\x74\x6d\154"; goto kC2jP; RChIN: $this->curlRequest($this->url, [], function ($response) { goto mNl4x; SMIka: $this->status = "\x6f\x6b"; goto hLUT8; mNl4x: $videoUrl = getStringBetween($response, "\x73\157\x75\162\143\x65\163\x3a\40\133\x22", "\x22"); goto ooNH7; R8R9r: $this->title = getStringBetween($response, "\x74\x69\164\154\145\x3a\x20\42", "\42"); goto QyYgb; ooNH7: if (!validateUrl($videoUrl)) { goto PpMCZ; } goto SMIka; hLUT8: $this->image = getStringBetween($response, "\x70\157\163\164\145\x72\72\x20\x22", "\x22"); goto R8R9r; QyYgb: $this->sources[] = ["\x66\151\154\145" => $videoUrl, "\x74\171\160\x65" => "\166\x69\144\145\x6f\57\x6d\x70\x34", "\x6c\x61\142\x65\x6c" => "\x4f\162\151\147\x69\x6e\141\x6c"]; goto Njidc; Njidc: PpMCZ: goto xIVhG; xIVhG: }); goto i53SD; i53SD: } }
