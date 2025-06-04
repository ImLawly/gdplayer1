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
 session_write_close(); use GDPlayer\{Config, Views}; goto qq6aX; qq6aX: Views::adminValidation(); goto RKzQ0; lPEXD: Config::saveAll($title); goto HJtac; HJtac: JD4oN: goto oj2oI; Cu64y: if (!$_POST) { goto JD4oN; } goto lPEXD; RKzQ0: $title = "\107\145\x6e\145\x72\141\154\40\123\145\164\x74\151\x6e\x67\x73"; goto Cu64y; E8LTo: $options["\x74\x69\155\x65\172\x6f\x6e\145\137\x6c\151\163\x74"] = getBinFileContent("\x74\151\155\x65\x7a\x6f\156\x65\56\x6a\x73\157\x6e", "\x74\151\155\145\172\x6f\x6e\x65\x2d\154\x69\163\x74"); goto kiA90; oj2oI: $options = Config::getAll(); goto E8LTo; kiA90: Views::renderBackendDefaultPage("\x73\x65\x74\164\151\156\147\x73\x2d\x77\x72\141\160\x70\x65\162\x2e\x68\164\x6d\x6c\56\164\167\x69\147", ["\143\x6c\145\x61\x72\x43\x61\x63\x68\x65" => intval($_GET["\143\154\x65\x61\162\103\x61\143\x68\x65"] ?? 0), "\x74\151\x74\154\145" => $title, "\x61\x64\155\151\x6e\x5f\x64\x69\x72" => ADMIN_DIR . "\x2f\x73\x65\x74\164\x69\x6e\x67\x73\57\x67\145\x6e\145\x72\x61\154\57", "\x66\x6f\162\x6d" => "\x73\145\x74\x74\x69\156\x67\x73\57\x67\145\156\x65\162\x61\x6c\56\x68\x74\155\154\56\164\x77\x69\147", "\x66\x6f\x72\155\x5f\144\x61\x74\x61" => $options]);
