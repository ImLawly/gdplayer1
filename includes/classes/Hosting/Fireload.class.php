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
 namespace GDPlayer\Hosting; class Fireload extends \GDPlayer\CoreExtractor { public function __construct(string $id = '') { goto gln3u; yitHL: sleep(6); goto qVndN; gln3u: session_write_close(); goto PHxsB; tf9ST: xpo8s: goto Pro4C; PHxsB: parent::__construct($id); goto TQaH2; TQaH2: if (empty($this->sources)) { goto xpo8s; } goto yitHL; qVndN: $this->sources = $this->getNewSources($this->sources); goto tf9ST; Pro4C: } }
