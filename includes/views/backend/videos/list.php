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
 session_write_close(); use GDPlayer\{Config, HTML, Views}; goto gTXpn; u3NN1: ksort($supportedSites, SORT_NATURAL); goto nc26p; nc26p: echo HTML::renderTemplate("\166\151\144\145\157\163\57\154\151\x73\x74\56\x68\x74\x6d\x6c\56\164\167\151\147", ["\x74\x69\164\154\145" => getEnvCustom("\x74\151\164\154\x65"), "\x62\141\x73\145\137\165\162\154" => BASE_URL, "\141\144\x6d\x69\156\137\144\x69\162" => ADMIN_DIR, "\x69\163\137\141\x64\155\x69\x6e" => isAdmin(), "\163\165\160\160\x6f\162\x74\145\144\137\163\151\164\145\x73" => $supportedSites, "\151\155\x70\157\x72\x74\137\146\151\154\145\163\151\172\x65" => intval(Config::get("\x69\x6d\160\x6f\162\x74\137\x66\151\154\145\163\151\x7a\x65") ?? 1024)]); goto buX1u; oyAaV: Views::loadBackendHeader(); goto vpsDH; LKnpo: setEnvCustom("\x74\151\x74\154\145", "\x56\x69\144\x65\x6f\x20\x4c\151\163\x74"); goto oyAaV; gTXpn: Views::userValidation(); goto LKnpo; vpsDH: $supportedSites = supportedSites(); goto u3NN1; buX1u: Views::loadBackendFooter();
