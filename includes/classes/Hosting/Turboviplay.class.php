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
 namespace GDPlayer\Hosting; class Turboviplay extends \GDPlayer\CoreExtractor { public function __construct(string $id = '') { goto xCcm5; xCcm5: session_write_close(); goto KvEu_; KvEu_: parent::__construct($id); goto ns3za; ns3za: $this->curlRequest("\150\x74\x74\160\163\x3a\57\57\145\x6d\x74\x75\x72\x62\157\x76\x69\x64\56\x63\157\155\57\164\57" . $id, [], function (string $response = '') { goto zSG_V; P8VwB: if (!validateUrl($videoURL)) { goto XqaVk; } goto De8kO; aeEYq: $this->title = trim(getStringBetween($response, "\164\x69\164\154\x65\x3e", "\74\x2f\164\x69\x74\x6c\x65")); goto NuLWO; De8kO: $this->status = "\x6f\x6b"; goto TyI8t; L8pjY: XqaVk: goto T5c19; zSG_V: $videoURL = trim(getStringBetween($response, "\x64\141\x74\141\55\150\x61\163\150\x3d\42", "\x22")); goto P8VwB; TyI8t: $this->image = "\x68\164\x74\160\163\72\57\57\166\x65\162\61\56\163\x70\164\x76\160\x2e\x63\157\155\57\160\x6f\x73\164\x65\x72\x2f\x41\x2f\104\x37\x2f{$this->id}\x2e\160\x6e\x67"; goto aeEYq; NuLWO: $this->sources[] = ["\146\151\x6c\x65" => $videoURL, "\x74\171\x70\145" => $this->hlsType, "\x6c\141\x62\x65\x6c" => "\117\162\151\x67\151\x6e\141\154"]; goto L8pjY; T5c19: }); goto uVHPC; uVHPC: } }
