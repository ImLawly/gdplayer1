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
 session_write_close(); use GDPlayer\Player; goto MCVJf; JYu_I: $player = new Player($isDownloadPage); goto FDqfo; amWDR: $headers[] = "\x43\157\x6e\164\x65\x6e\x74\55\124\171\160\x65\x3a\40\x61\x70\x70\x6c\x69\143\141\x74\x69\x6f\156\x2f\x6a\163\157\x6e\x3b\x20\x63\x68\141\162\x73\145\164\x3d\x75\x74\x66\55\x38"; goto n8HkV; dN6o5: PwK7p: goto U9MHj; I_WfG: if (!($_SERVER["\122\x45\x51\x55\x45\123\x54\137\x4d\105\x54\110\117\104"] === "\117\x50\124\x49\x4f\x4e\123")) { goto PwK7p; } goto y8zDt; MCVJf: $headers = corsResponseHeaders(); goto amWDR; n8HkV: createResponseHeaders($headers); goto I_WfG; U9MHj: $isDownloadPage = validateBoolean($_GET["\144\x6c"] ?? 0); goto JYu_I; y8zDt: exit; goto dN6o5; FDqfo: echo $isDownloadPage ? $player->getDownloadPageConfig() : $player->getEmbedPageConfig();
