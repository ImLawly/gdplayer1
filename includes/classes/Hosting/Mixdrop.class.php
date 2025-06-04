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
 namespace GDPlayer\Hosting; class Mixdrop extends \GDPlayer\XVFSParser { protected $baseURL = "\x68\x74\x74\x70\x73\x3a\x2f\57\x6d\x69\x78\144\x72\157\160\x2e\155\171\57"; public function __construct(string $id = '') { goto E0uHI; zh5k1: parent::__construct($id); goto uqswr; E0uHI: session_write_close(); goto uKH2W; uqswr: $this->getDOMTitle(strtr($this->url, ["\57\145\57" => "\x2f\x66\57"])); goto BE80l; uKH2W: $this->url = $this->baseURL . "\x65\x2f" . $id; goto zh5k1; BE80l: } }
