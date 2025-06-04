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
 session_write_close(); use GDPlayer\Views; use GDPlayer\Model\GDriveAuth; goto GTS4a; y3mxS: $list = $gdAuth->get(["\x65\155\141\x69\x6c"]); goto xUBB8; VADH_: $gdAuth = GDriveAuth::getInstance(); goto Xoj41; Xoj41: $gdAuth->setCriteria("\x73\164\141\x74\x75\163", 1); goto FIHnb; FIHnb: $gdAuth->setOrderBy("\145\155\141\151\x6c", "\x41\x53\103"); goto y3mxS; GTS4a: Views::adminValidation(); goto VADH_; xUBB8: Views::renderBackendDefaultPage("\147\144\x72\x69\x76\x65\x2f\146\151\x6c\145\163\56\150\164\x6d\154\x2e\164\167\x69\x67", ["\164\151\x74\x6c\x65" => "\x47\157\x6f\x67\154\145\40\x44\162\151\166\145\40\106\x69\x6c\x65\163", "\x66\157\154\x64\145\162\137\x69\144" => sanitizeHtml($_GET["\146\157\154\x64\145\x72\x5f\151\144"] ?? "\x72\157\157\x74"), "\145\155\x61\x69\x6c" => sanitizeEmail($_GET["\145\155\x61\x69\154"] ?? ''), "\145\x6d\141\151\x6c\x5f\x6c\151\x73\164" => array_is_list($list) ? array_column($list, "\145\x6d\x61\151\154") : []]);
