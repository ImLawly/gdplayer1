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
 namespace GDPlayer\Hosting; class Vidlook extends \GDPlayer\XVFSParser { protected $baseURL = "\x68\x74\x74\160\163\72\x2f\x2f\x76\151\x64\154\x6f\157\153\x2e\156\145\x74\x2f"; public function __construct(string $id = '') { goto S7ipH; S7ipH: session_write_close(); goto W2yP7; WbhVP: parent::__construct($id); goto ddWcx; W2yP7: $this->url = $this->baseURL . "\x65\x6d\142\145\x64\55" . $id . "\56\x68\x74\x6d\154"; goto WbhVP; ddWcx: $this->getDOMTitle($this->baseURL . $id); goto DRtAj; DRtAj: } }
