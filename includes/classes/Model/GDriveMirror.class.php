<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:36              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 namespace GDPlayer\Model; class GDriveMirror extends \GDPlayer\Model { use \GDPlayer\ModelSingleton; protected $table = "\x74\142\137\x67\x64\162\151\166\x65\137\x6d\x69\162\162\157\x72\163"; protected $fields = ["\151\x64", "\x67\x64\x72\x69\166\145\x5f\x69\x64", "\x6d\151\x72\162\x6f\x72\137\x69\144", "\x6d\151\x72\x72\157\162\137\x65\155\x61\x69\x6c", "\x61\x64\144\x65\x64"]; protected $primaryKey = "\151\x64"; public function getUpdateQueries() { goto EIAsg; EIAsg: session_write_close(); goto SU8E1; SU8E1: $this->removeAllIndexes(); goto D_Yts; D_Yts: return ["\101\x4c\x54\x45\x52\x20\124\101\102\x4c\x45\40\x60\164\x62\137\147\x64\x72\151\x76\x65\x5f\155\x69\162\x72\x6f\x72\163\x60\x20\x4d\x4f\x44\111\106\x59\40\x43\117\114\x55\115\x4e\40\x60\x6d\x69\x72\x72\157\x72\x5f\x65\155\141\x69\x6c\x60\40\x56\101\122\x43\x48\101\x52\50\x31\x39\x31\51\x20\x4e\x4f\x54\40\116\x55\114\114"]; goto GlcKN; GlcKN: } }
