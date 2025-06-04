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
 namespace GDPlayer\Hosting; class Pixeldrain extends \GDPlayer\CoreExtractor { protected $baseURL = "\x68\x74\164\160\x73\x3a\x2f\57\160\x69\170\x65\154\144\x72\x61\151\x6e\56\x63\x6f\x6d\57\x61\x70\x69\57\146\151\154\145\57"; public function __construct(string $id) { goto qgLnu; OOE7w: $this->curlRequest($apiUrl . "\x2f\151\x6e\x66\157", [], function ($response) { goto yubvz; rFa4_: $this->title = $arr["\x6e\x61\155\x65"]; goto UyHOF; CMKQ6: if (empty($arr["\156\141\155\x65"])) { goto yQdvQ; } goto rFa4_; UyHOF: yQdvQ: goto EISEF; yubvz: $arr = @json_decode($response, true); goto CMKQ6; EISEF: }); goto fxD3r; YRPzT: $this->sources[] = ["\146\x69\154\x65" => $apiUrl, "\x74\171\160\145" => "\166\x69\x64\x65\x6f\57\x6d\x70\64", "\154\141\142\x65\x6c" => "\117\x72\x69\x67\x69\x6e\x61\154"]; goto OOE7w; qgLnu: session_write_close(); goto ufGn0; FfQPF: $this->status = "\x6f\153"; goto IE0jx; ufGn0: parent::__construct($id); goto FNgzc; FNgzc: $apiUrl = $this->baseURL . $id; goto FfQPF; IE0jx: $this->image = $apiUrl . "\57\164\x68\165\x6d\x62\156\x61\x69\154"; goto YRPzT; fxD3r: } }
