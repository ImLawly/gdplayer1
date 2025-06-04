<?php
/*   __________________________________________________
    |  Obfuscated by YAK Pro - Php Obfuscator  2.0.16  |
    |              on 2025-05-18 20:27:34              |
    |    GitHub: https://github.com/pk-fr/yakpro-po    |
    |__________________________________________________|
*/
/*
Copyright @ 2020 - 2025 GDPlayer v4.7.1. https://gdplayer.to | https://t.me/gdplayerto
*/
 namespace GDPlayer\Hosting; class Gocast2 extends \GDPlayer\CoreExtractor { protected $baseURL = "\x68\x74\164\x70\x73\72\57\57\147\x6f\143\141\163\x74\62\x2e\143\157\155\x2f"; public function __construct(string $id = '') { goto HrZU2; HrZU2: session_write_close(); goto uMQXh; q4p3f: $this->referer = $this->baseURL; goto EmYsT; uMQXh: $this->url = $this->baseURL . "\143\162\x69\x63\150\144\167\x73\x2e\160\150\x70\x3f\x70\x6c\141\171\x65\162\x3d\x64\x65\x73\153\164\x6f\160\46\x6c\151\x76\x65\75" . $id; goto cZwW5; cZwW5: parent::__construct($id); goto q4p3f; EmYsT: } public function getSources() : array { goto Ro2g4; AQpx7: if (!validateUrl($source)) { goto hqYc0; } goto CT0Tc; C95Rh: hqYc0: goto DnjGU; DnjGU: HqiT9: goto Fv6il; UfyTA: $response = curl_exec($this->ch); goto ovZ7J; ovZ7J: $status = curl_getinfo($this->ch, CURLINFO_HTTP_CODE); goto apGDl; Ro2g4: $this->modifyCurlConfig($this->url); goto UfyTA; cd3wJ: $this->sources[] = ["\146\151\x6c\x65" => $source, "\x74\171\160\x65" => "\150\154\x73", "\x6c\141\x62\x65\154" => "\117\x72\x69\147\151\156\x61\x6c"]; goto C95Rh; aDHHS: createErrorLog([__FILE__, __FUNCTION__, $this->id, $status, $err]); goto WmOOP; wEPTL: $source = getStringBetween($response, "\163\x6f\x75\x72\143\145\x55\x72\x6c\x3a\x20\47", "\47"); goto AQpx7; WmOOP: goto HqiT9; goto x2T9Z; x2T9Z: s3CUT: goto wEPTL; apGDl: $err = curl_error($this->ch); goto P5w81; i8WyV: if ($status >= 200 && $status < 400) { goto s3CUT; } goto aDHHS; P5w81: curl_close($this->ch); goto i8WyV; CT0Tc: $this->status = "\157\153"; goto cd3wJ; Fv6il: return $this->sources; goto xAIXt; xAIXt: } }
