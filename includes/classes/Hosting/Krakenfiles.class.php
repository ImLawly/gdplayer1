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
 namespace GDPlayer\Hosting; class Krakenfiles extends \GDPlayer\XVFSParser { public function __construct(string $id = '') { goto m9tx0; vYTWp: R4e51: goto PlIG6; AY0sp: if (empty($this->sources)) { goto R4e51; } goto RYk3S; VzfTn: parent::__construct($id); goto AY0sp; m9tx0: session_write_close(); goto VzfTn; PlIG6: $this->getDOMTitle($this->url, "\56\143\x6f\x69\x6e\x2d\151\x6e\146\x6f\x20\x68\x35"); goto dj0Jz; RYk3S: $this->sources = array_map(function ($dt) { goto bDqYY; Ip1eH: $dt["\146\151\154\x65"] = substr($file, 0, 4) === "\150\x74\164\160" ? $file : "\x68\164\x74\x70\163\72\x2f\x2f"; goto KjrGP; bDqYY: $file = htmlspecialchars_decode($dt["\x66\x69\154\145"]); goto Ip1eH; KjrGP: return $dt; goto qavBF; qavBF: }, $this->sources); goto vYTWp; dj0Jz: } }
