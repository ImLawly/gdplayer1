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
 namespace GDPlayer\Hosting; class Gett extends \GDPlayer\XVFSParser { public function __construct(string $id = '') { goto QnTgh; NqUcr: $id = trim($id, "\x20\46\x2f\77\43"); goto Grjhi; QnTgh: session_write_close(); goto NqUcr; PZiKx: $this->sources[0]["\x74\x79\160\145"] = $this->videoType; goto F203M; uR0zr: $this->sources[0]["\146\x69\x6c\145"] = strtr($this->sources[0]["\146\151\x6c\x65"], ["\163\x74\x72\x65\x61\155\x2e" => "\143\144\x6e\x2d\142\56", "\57\x68\154\163\57" => "\57\144\x6f\167\x6e\154\157\x61\x64\163\57", "\155\x61\163\x74\x65\x72\56\155\x33\x75\70" => "\166\x69\144\x65\x6f\56\155\160\64"]); goto Vz8Gk; F203M: $host = parse_url($this->sources[0]["\x66\x69\x6c\x65"], PHP_URL_HOST); goto FNCyv; GaUMI: xFDNu: goto iqfVk; FNCyv: if (!(strpos($host, "\144\157\x77\x6e\154\157\141\144") !== false)) { goto QyViZ; } goto j2PiG; j2PiG: $this->sources[0]["\x66\x69\154\145"] = strtr($this->sources[0]["\146\x69\154\x65"], [$host => "\x63\x64\156\x2d\x62\x2e\165\55\160\x2e\x70\167"]); goto DLQZr; CFRGZ: if (empty($this->sources)) { goto xFDNu; } goto uR0zr; Grjhi: parent::__construct($id); goto CFRGZ; Vz8Gk: $this->sources[0]["\154\141\x62\x65\154"] = "\117\x72\x69\x67\151\x6e\x61\x6c"; goto PZiKx; DLQZr: QyViZ: goto GaUMI; iqfVk: } }
