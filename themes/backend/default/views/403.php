<?php
session_write_close();

use \GDPlayer\Views;

http_response_code(403);
header('Content-Type: text/html; charset=utf-8', true);
Views::renderBackendDefaultPage('default.html.twig', [
    'title' => '403 Forbidden',
    'desc' => 'You are not allowed to access the page.'
]);
