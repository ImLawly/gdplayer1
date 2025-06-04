<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:39              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 session_write_close(); use GDPlayer\{Config, Player}; goto OlvQg; sUfFN: $player = new Player(); goto WZo05; gd91t: $repeat = $_GET["\x72\145\160\145\141\164"] ?? Config::get("\162\x65\160\145\141\x74"); goto sUfFN; ZUPVe: $mute = $_GET["\x6d\x75\x74\145"] ?? Config::get("\x6d\x75\164\145"); goto gd91t; WZo05: $player->setPublicQueries(["\x61\165\164\157\160\x6c\x61\x79" => validateBoolean($autoplay) ? 1 : 0, "\155\165\164\145" => validateBoolean($mute) ? 1 : 0, "\162\145\160\x65\141\x74" => validateBoolean($repeat) ? 1 : 0]); goto SNmGQ; Rdeob: $autoplay = $_GET["\x61\165\x74\157\160\154\x61\171"] ?? Config::get("\141\165\x74\157\x70\x6c\x61\x79"); goto ZUPVe; yfyZ7: createResponseHeaders($headers); goto Rdeob; OlvQg: $headers = corsResponseHeaders(true); goto yfyZ7; SNmGQ: echo $player->getEmbedPage();
