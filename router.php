<?php
// Router for PHP built-in server: php -S localhost:8080 router.php
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
$uri = rtrim($uri, "/") ?: "/";
$file = __DIR__ . $uri;

if ($uri === "/admin" || $uri === "/admin.html") {
    header("Content-Type: text/html; charset=utf-8");
    readfile(__DIR__ . "/admin.html");
    return true;
}

if ($uri === "/" || $uri === "") {
    header("Content-Type: text/html; charset=utf-8");
    readfile(__DIR__ . "/index.html");
    return true;
}

if ($uri !== "/" && file_exists($file) && !is_dir($file)) {
    return false; // serve the requested resource as-is
}

http_response_code(404);
header("Content-Type: text/plain; charset=utf-8");
echo "Not Found";
return true;
