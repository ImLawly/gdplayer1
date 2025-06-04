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
 namespace GDPlayer\Hosting; class Streamwish extends \GDPlayer\XVFSParser { protected $baseURL = "\x68\164\164\160\x73\x3a\57\x2f\x64\x68\x63\160\x6c\x61\x79\56\x63\157\155\57"; public function __construct(string $id = '') { goto msJNP; ZPN2M: $this->url = $this->baseURL . "\145\57" . $id; goto XZQei; msJNP: session_write_close(); goto ZPN2M; XZQei: parent::__construct($id); goto WNC_n; WNC_n: $this->getDOMTitle($this->baseURL . $id, "\x68\61\56\150\64"); goto EiyAp; EiyAp: } }
