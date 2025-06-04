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
 namespace GDPlayer\Hosting; class Fileupload extends \GDPlayer\XVFSParser { protected $baseURL = "\150\x74\164\x70\163\x3a\x2f\x2f\x77\167\x77\56\x66\151\154\x65\x2d\x75\x70\154\157\x61\144\x2e\x6f\x72\x67\x2f"; public function __construct(string $id = '') { goto Bdui5; Bdui5: session_write_close(); goto jSx8S; igTdT: $this->getDOMTitle($this->baseURL . $id, "\x68\61"); goto OdD93; GvO4f: parent::__construct($id); goto igTdT; jSx8S: $this->url = $this->baseURL . "\x65\155\142\145\x64\55" . $id . "\x2e\150\164\155\x6c"; goto GvO4f; OdD93: } }
