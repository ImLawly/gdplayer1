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
 session_write_close(); use GDPlayer\{Config, Views}; goto z13Hr; AhKG5: $options = Config::getAll(); goto TLgQe; Fo6xl: YNV04: goto AhKG5; TLgQe: $options["\x73\x68\157\162\164\145\x6e\145\162\137\167\x65\142\163\x69\x74\x65"] = shortenerList(); goto NhE8Q; z13Hr: Views::adminValidation(); goto T2RXj; jggmo: if (!$_POST) { goto YNV04; } goto ZmHiE; T2RXj: $title = "\123\150\157\x72\164\x65\x6e\x65\162\x20\114\x69\x6e\x6b\x20\x53\x65\164\164\151\156\147\x73"; goto jggmo; ZmHiE: Config::saveAll($title); goto Fo6xl; NhE8Q: Views::renderBackendDefaultPage("\x73\145\x74\164\x69\x6e\x67\163\x2d\167\162\x61\x70\160\145\x72\x2e\150\164\155\x6c\x2e\x74\x77\151\x67", ["\143\154\145\x61\162\x43\141\143\x68\145" => intval($_GET["\x63\x6c\145\141\162\103\x61\143\150\145"] ?? 0), "\164\x69\164\154\x65" => $title, "\141\x64\155\151\x6e\x5f\x64\151\162" => ADMIN_DIR . "\57\x73\145\164\164\x69\x6e\x67\x73\x2f\x73\x68\x6f\162\x74\x6c\151\156\x6b\x2f", "\146\x6f\162\x6d" => "\x73\x65\164\x74\x69\156\x67\163\x2f\x73\150\157\162\164\x6c\x69\156\153\56\150\x74\x6d\154\56\164\x77\x69\147", "\x66\157\162\155\137\144\x61\x74\x61" => $options]);
