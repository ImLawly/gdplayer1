<?php
session_write_close();

use \GDPlayer\HTML;

http_response_code(503);
header('Content-Type: text/html; charset=utf-8', true);
echo HTML::renderTemplate('default.html.twig', [
    'title' => '503 Service Unavailable',
    'desc' => 'Sorry, the server is currently unavailable. Please try again later.'
]);
