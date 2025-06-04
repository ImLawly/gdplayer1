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
 namespace GDPlayer\Hosting; class Dropload extends \GDPlayer\XVFSParser { protected $baseURL = "\150\164\164\160\x73\72\57\57\x64\162\157\160\154\157\141\144\x2e\151\157\x2f"; public function __construct(string $id = '') { goto OIIVH; OIIVH: session_write_close(); goto UNCxF; UNCxF: $this->url = $this->baseURL . "\x65\x2f" . $id; goto wQh4l; MKVgj: $this->getDOMTitle($this->baseURL . $this->id, "\x68\x31"); goto PvnYm; wQh4l: parent::__construct($id); goto MKVgj; PvnYm: } }
