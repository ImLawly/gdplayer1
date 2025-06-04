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
 namespace GDPlayer\Hosting; class Mp4upload extends \GDPlayer\XVFSParser { protected $baseURL = "\150\164\x74\160\x73\x3a\57\57\x77\167\x77\56\x6d\x70\64\x75\x70\x6c\157\x61\x64\56\x63\157\x6d\57"; public function __construct(string $id = '') { goto aRefs; jjmCd: $this->url = $this->baseURL . "\x65\155\x62\145\144\x2d" . $id . "\56\x68\x74\x6d\x6c"; goto eBRwA; EIBIW: $this->getDOMTitle($this->baseURL . $id, "\144\x69\x76\x2e\156\141\155\x65\40\x3e\x20\150\64"); goto S1Ct9; aRefs: session_write_close(); goto jjmCd; eBRwA: parent::__construct($id); goto EIBIW; S1Ct9: } }
