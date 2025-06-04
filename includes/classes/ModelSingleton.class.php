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
 namespace GDPlayer; trait ModelSingleton { private static $instance = null; protected function __construct() { goto lvrUE; c1ddt: $this->initSingleton(); goto rZeAC; rZeAC: B3ySD: goto vIiv1; WIhS4: if (!method_exists($this, "\x69\156\151\164\x53\151\156\x67\154\145\x74\157\x6e")) { goto B3ySD; } goto c1ddt; lvrUE: session_write_close(); goto WIhS4; vIiv1: } public static function getInstance() : self { goto BewmT; I4htg: self::$instance = new self(); goto jLw2O; BewmT: session_write_close(); goto Tw9x4; Tw9x4: if (!(self::$instance === null)) { goto L2U6T; } goto I4htg; ShzEi: return self::$instance; goto LtVod; jLw2O: L2U6T: goto ShzEi; LtVod: } private function __clone() { } public function __wakeup() { } }
