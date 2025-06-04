<?php
session_write_close();

use \GDPlayer\Views;

http_response_code(404);
header('Content-Type: text/html; charset=utf-8', true);
Views::renderBackendDefaultPage('default.html.twig', [
    'title' => '404 Page Not Found',
    'desc' => 'The page you are looking for was not found.'
]);
