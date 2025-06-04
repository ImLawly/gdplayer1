<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:40              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 session_write_close(); use GDPlayer\Security; goto eGx7z; eGx7z: $security = new Security(); goto OsCjw; Hcxvr: $origin = $security->decryptURL($ex[1]); goto V50HQ; MlN0H: $ex = explode(SLASH, end($ex)); goto Hcxvr; OsCjw: $ex = explode("\x2f\162\145\144\x69\x72\x65\143\164\x2f", $_SERVER["\x52\x45\121\x55\x45\x53\x54\x5f\x55\122\x49"]); goto MlN0H; HefiL: if (!validateUrl($redirectUrl)) { goto CF_Rb; } goto yeKBb; V50HQ: array_splice($ex, 0, 2); goto sHv1s; sHv1s: $redirectUrl = $origin . implode(SLASH, $ex); goto HefiL; yeKBb: redirectTo($redirectUrl); goto EovWO; EovWO: CF_Rb:
