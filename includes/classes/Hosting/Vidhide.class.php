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
 namespace GDPlayer\Hosting; class Vidhide extends \GDPlayer\XVFSParser { protected $baseURL = "\150\x74\164\x70\x73\x3a\57\x2f\155\157\x76\x65\x61\162\156\x70\x72\145\x2e\x63\x6f\x6d\57"; public function __construct(string $id = '') { goto npi2S; eJpod: $this->getDOMTitle($this->baseURL . "\146\151\154\145\x2f" . $this->id, "\x68\x31\x2e\150\65"); goto K3x33; yQxAP: parent::__construct($id); goto eJpod; npi2S: session_write_close(); goto JPlF6; JPlF6: $this->url = $this->baseURL . "\145\x6d\142\145\144\x2f" . $id; goto yQxAP; K3x33: } }
