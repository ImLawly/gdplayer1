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
 session_write_close(); use GDPlayer\{Config, Views}; goto NwC96; XllOl: Config::reset($title); goto EVfYK; NwC96: Views::adminValidation(); goto CMI6O; qoARl: if (!$_POST) { goto AV84V; } goto XllOl; EVfYK: AV84V: goto gQKQD; CMI6O: $title = "\122\145\163\145\164\40\123\145\164\164\x69\x6e\x67\163"; goto qoARl; gQKQD: Views::renderBackendDefaultPage("\163\x65\164\x74\x69\x6e\x67\x73\55\x77\x72\141\160\x70\145\x72\56\x68\164\x6d\154\x2e\x74\167\151\147", ["\x63\154\145\141\162\x43\141\143\x68\145" => intval($_GET["\143\x6c\145\x61\162\103\x61\x63\x68\145"] ?? 0), "\x74\x69\x74\154\x65" => $title, "\162\x65\163\145\164\137\x66\x6f\x72\155" => "\163\145\164\164\151\x6e\147\163\x2f\x72\x65\163\x65\164\56\150\x74\155\x6c\x2e\164\x77\151\x67", "\141\144\x6d\x69\x6e\x5f\x64\x69\162" => ADMIN_DIR . "\x2f\163\x65\x74\164\151\156\x67\x73\57\162\x65\x73\145\164\x2f"]);
