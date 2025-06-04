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
 namespace GDPlayer\Hosting; class Vidmoly extends \GDPlayer\XVFSParser { protected $baseURL = "\x68\x74\164\x70\x73\x3a\x2f\57\x76\x69\x64\155\x6f\x6c\x79\56\164\x6f\x2f"; public function __construct(string $id = '') { goto pfIar; L61Bx: dOwli: goto fz_r3; RVvOW: np0Db: goto L61Bx; qbyCJ: foreach ($tracks as $tr) { goto CgOY3; CgOY3: if (isset($tr["\153\151\156\144"]) && $tr["\x6b\151\156\144"] === "\164\150\165\x6d\142\156\x61\x69\154\163") { goto pjFqb; } goto x2140; V5OvN: OP2Be: goto t_mJG; uLDjO: goto OP2Be; goto ofFwl; Ssatj: $this->filmstrip = $this->baseURL . ltrim($tr["\146\151\154\145"], SLASH); goto V5OvN; x2140: $this->tracks[] = ["\146\151\154\x65" => $this->baseURL . ltrim($tr["\146\x69\x6c\x65"], SLASH), "\x6c\x61\142\145\154" => $tr["\154\x61\x62\x65\154"]]; goto uLDjO; t_mJG: HtVvB: goto cV3iS; ofFwl: pjFqb: goto Ssatj; cV3iS: } goto RVvOW; l2HFl: if (empty($this->cfTracks)) { goto Jm5F7; } goto LwsNq; Z56g9: if (!$tracks) { goto dOwli; } goto qbyCJ; pfIar: session_write_close(); goto aVLxK; fz_r3: Jm5F7: goto fVOjK; UxQVp: parent::__construct($id); goto l2HFl; LwsNq: $tracks = $this->jsConverter->convertToArray($this->cfTracks); goto Z56g9; aVLxK: $this->url = $this->baseURL . "\145\155\142\145\144\x2d" . $id . "\56\150\x74\155\x6c"; goto UxQVp; fVOjK: } }
