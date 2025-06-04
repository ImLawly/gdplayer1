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
 session_write_close(); use GDPlayer\{InstanceCache, Views}; goto SyOoH; OxVoH: $cache = InstanceCache::getItem("\150\x69\144\145\55\x65\x78\164\55\x64\x69\141\x6c\x6f\x67"); goto wXvaF; SyOoH: Views::userValidation(); goto OxVoH; wXvaF: Views::renderBackendDefaultPage("\x64\x61\x73\150\142\157\x61\x72\144\56\150\164\x6d\x6c\x2e\x74\x77\x69\x67", ["\x74\x69\x74\x6c\x65" => "\x44\141\x73\150\x62\157\x61\162\144", "\141\x64\155\x69\156\137\144\x69\x72" => ADMIN_DIR, "\x69\163\x5f\141\x64\x6d\151\156" => isAdmin(), "\x69\x73\x5f\167\x69\156\x64\157\x77\x73" => PHP_OS_FAMILY === "\x57\x69\156\x64\157\167\x73", "\x68\x69\x64\145\x5f\x65\x78\x74\137\144\x69\x61\154\157\147" => $cache->isHit() ? $cache->get() : false]);
