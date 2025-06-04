<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:34              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 namespace GDPlayer\Hosting; class Ecast123 extends \GDPlayer\CoreExtractor { protected $baseURL = "\x68\164\164\160\163\72\57\57\142\x69\147\x63\141\163\164\56\170\171\x7a\x2f"; public function __construct(string $id = '') { goto BiHMe; BiHMe: session_write_close(); goto dKZxl; gKQyg: $this->curlRequest($this->baseURL . "\x65\x6d\142\145\144\x2e\x70\150\x70\x3f\166\75" . $id, [], function (string $response = '') { goto a6Yx9; mMfIA: $this->status = "\x6f\x6b"; goto LwoFY; LwoFY: $this->sources[] = ["\x66\x69\x6c\145" => $source, "\164\171\160\145" => $this->hlsType, "\x6c\141\142\145\x6c" => "\x4f\x72\x69\x67\151\x6e\x61\154"]; goto RVzzG; RVzzG: BK3QP: goto MZhEf; GUzEZ: if (!validateUrl($source)) { goto BK3QP; } goto mMfIA; a6Yx9: $source = getStringBetween($response, "\163\157\x75\x72\x63\145\x3a\40\47", "\47"); goto GUzEZ; MZhEf: }); goto KFRL0; dKZxl: parent::__construct($id); goto gKQyg; KFRL0: } }
