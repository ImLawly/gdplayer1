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
 namespace GDPlayer\Hosting; class Tiktok extends \GDPlayer\CoreExtractor { public function __construct(string $id = '') { goto S66Ls; xmazV: parent::__construct($id); goto yJujd; S66Ls: session_write_close(); goto xmazV; cDxor: TnRTJ: goto E2Si2; a8BJ2: if (empty($this->image)) { goto TnRTJ; } goto MIx35; S4F_g: $this->sources[0]["\146\151\x6c\145"] = strtr(rawurldecode($this->sources[0]["\x66\151\154\145"]), ["\134\165\x30\60\62\x46" => SLASH]); goto U5y5O; MIx35: $this->image = strtr(rawurldecode($this->image), ["\x5c\165\60\x30\x32\x46" => SLASH]); goto cDxor; yJujd: if (empty($this->sources[0]["\146\151\x6c\x65"])) { goto UoFzz; } goto S4F_g; U5y5O: UoFzz: goto a8BJ2; E2Si2: } }
