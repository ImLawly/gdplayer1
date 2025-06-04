<?php
session_write_close();

use \GDPlayer\HTML;

http_response_code(401);
header('Content-Type: text/html; charset=utf-8', true);
echo HTML::renderTemplate('default.html.twig', [
    'title' => '401 Unauthorized',
    'desc' => 'The page should only be accessed by registered users.'
]);
