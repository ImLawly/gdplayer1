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
 namespace GDPlayer\Hosting; class Dropbox extends \GDPlayer\CoreExtractor { protected $baseURL = "\x68\x74\x74\160\163\x3a\57\x2f\167\167\167\x2e\x64\162\x6f\160\142\x6f\170\56\x63\157\155\57"; public function __construct(string $id = '') { goto Jqkw0; c_7Er: $this->curlRequest($this->url, [], function () { goto XSnkx; Q0wJh: $this->sources[] = ["\x66\x69\154\x65" => strtr(rawurldecode($this->id), ["\x64\x6c\x3d\60" => "\144\x6c\x3d\x31"]), "\x74\x79\x70\x65" => $this->videoType, "\x6c\141\142\145\154" => "\x4f\x72\151\147\151\156\x61\154"]; goto ADdqA; qpzVL: if (validateUrl($this->id) && strpos($this->id, "\x64\x6c\x3d") !== false) { goto VQuy2; } goto o18o5; XSnkx: $this->status = "\157\x6b"; goto qpzVL; bYzuK: VQuy2: goto Q0wJh; o18o5: $this->sources[] = ["\x66\151\154\145" => $this->url . "\77\x64\154\75\x31", "\164\x79\x70\145" => $this->videoType, "\154\141\x62\145\x6c" => "\117\162\151\x67\151\156\141\154"]; goto XAFoI; ADdqA: qF4JW: goto haCY4; XAFoI: goto qF4JW; goto bYzuK; haCY4: }); goto TRh68; aFErV: koTPa: goto QnNzt; QnNzt: $this->url = $this->id; goto MbSX3; BBCfd: $this->url = $this->baseURL . "\x73\57" . $this->id; goto CROlB; CROlB: goto kpTkR; goto aFErV; ypurM: parent::__construct($id); goto X_oiF; rNyBC: $this->title = basename(parse_url($this->url, PHP_URL_PATH) ?? ''); goto c_7Er; Jqkw0: session_write_close(); goto ypurM; X_oiF: if (validateUrl($this->id)) { goto koTPa; } goto BBCfd; MbSX3: kpTkR: goto rNyBC; TRh68: } }
