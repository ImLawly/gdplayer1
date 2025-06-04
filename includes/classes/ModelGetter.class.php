<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:37              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 namespace GDPlayer; trait ModelGetter { public function getLastError() : string { session_write_close(); return end($this->errors); } public function getTableName() : string { session_write_close(); return $this->table; } public function getFields() : array { session_write_close(); return $this->fields; } public function getPrimaryKey() : string { session_write_close(); return $this->primaryKey; } public function getSQLQuery() : string { session_write_close(); return $this->sqlQuery; } }
