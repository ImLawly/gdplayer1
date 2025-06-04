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
 namespace GDPlayer\Model; class DatabaseInfo extends \GDPlayer\Model { use \GDPlayer\ModelSingleton; public function getServerVersion() { session_write_close(); return self::$pdo->getAttribute(\PDO::ATTR_SERVER_VERSION); } public function getServerInfo() { session_write_close(); return self::$pdo->getAttribute(\PDO::ATTR_SERVER_INFO); } public function getClientVersion() { session_write_close(); return self::$pdo->getAttribute(\PDO::ATTR_CLIENT_VERSION); } }
