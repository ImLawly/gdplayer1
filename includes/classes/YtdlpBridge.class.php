<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:38              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 namespace GDPlayer; class YtdlpBridge extends \GDPlayer\CoreHelper { public function __construct(?string $url = null) { goto atvGz; SmBRi: $this->image = $ytdlp->getImage(); goto YXHWU; uXOYu: $ytdlp = new \GDPlayer\Hosting\Ytdlp($url); goto d6RX5; atvGz: session_write_close(); goto RX8Uf; hGIX9: $this->title = $ytdlp->getTitle(); goto SmBRi; RX8Uf: $ytdlpClass = "\x47\104\120\154\141\171\x65\x72\x5c\110\x6f\x73\x74\x69\x6e\x67\134\x59\164\x64\154\160"; goto kswpR; rVR5j: $this->referer = $ytdlp->getReferer(); goto GZLA9; d6RX5: $this->sources = $ytdlp->getSources(); goto hGIX9; kswpR: if (!class_exists($ytdlpClass)) { goto j7SfI; } goto uXOYu; C_qY1: j7SfI: goto TBCzb; GZLA9: $this->status = $ytdlp->getStatus(); goto C_qY1; YXHWU: $this->tracks = $ytdlp->getTracks(); goto rVR5j; TBCzb: } }
