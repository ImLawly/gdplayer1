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
 session_write_close(); use GDPlayer\{Config, Views}; use GDPlayer\Model\User; goto NR0rO; COtDJ: PVcRp: goto jdhSd; jdhSd: $options = Config::getAll(); goto Fsi2l; Dc0Wi: Config::saveAll($title); goto COtDJ; vGYzV: if (!$_POST) { goto PVcRp; } goto Dc0Wi; t0OOT: $options["\165\x73\x65\x72\x5f\154\x69\x73\x74"] = $userList; goto Hh2RH; Hh2RH: YU5fX: goto ScTUJ; I4HjQ: $userList = $user->get(["\x69\x64", "\156\x61\x6d\145"]); goto JjsWi; NR0rO: Views::adminValidation(); goto pZBNf; JjsWi: if (!$userList) { goto YU5fX; } goto t0OOT; pZBNf: $title = "\x50\x75\142\x6c\151\x63\x20\x53\x65\164\164\151\156\x67\x73"; goto vGYzV; Fsi2l: $user = User::getInstance(); goto I4HjQ; ScTUJ: Views::renderBackendDefaultPage("\163\x65\164\164\151\x6e\x67\163\x2d\x77\162\141\160\x70\x65\162\56\x68\164\155\x6c\56\164\x77\151\147", ["\x63\154\x65\141\x72\x43\141\x63\150\x65" => intval($_GET["\x63\154\x65\141\x72\103\141\143\150\x65"] ?? 0), "\164\151\x74\154\145" => $title, "\141\144\x6d\151\x6e\x5f\x64\151\x72" => ADMIN_DIR . "\57\163\145\x74\164\x69\x6e\x67\x73\x2f\x70\165\142\x6c\x69\x63\x2f", "\146\x6f\x72\155" => "\163\x65\x74\x74\x69\x6e\147\163\57\x70\x75\142\x6c\151\143\x2e\x68\164\155\154\56\x74\x77\151\x67", "\x66\157\x72\155\137\x64\141\x74\x61" => $options]);
