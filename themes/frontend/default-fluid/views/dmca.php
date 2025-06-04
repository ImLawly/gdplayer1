<?php
session_write_close();

use \GDPlayer\HTML;

http_response_code(403);
header('Content-Type: text/html; charset=utf-8', true);
echo HTML::renderTemplate('default.html.twig', [
    'title' => 'DMCA Takedown',
    'desc' => 'Content has been taken down'
]);
