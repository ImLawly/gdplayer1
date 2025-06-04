<?php

// Insert your website homepage url. Example: https://yoursite.com/ (slash at the end)
define('BASE_URL', 'http://localhost/gdplayer/');

// Insert random alphanumeric as security code to encrypt/decrypt the existing string on your site
define('SECURE_SALT', 'xJh29ikas-!');

/**
 * Insert additional network interface hostnames or IP addresses installed on your server
 * You can insert IPv6 here, but not all video hosting can be accessed with IPv6
 * Example: ['eth0', '0.0.0.0', 'ffff:ffff:ffff::ffff']
 */
define('EXTRA_IP', []);

// Backend url path
define('ADMIN_DIR', 'administrator');

// Backend theme folder name
define('BACKEND_THEME', 'default');

// Frontend theme folder name
define('FRONTEND_THEME', 'default');

// The absolute path directory where this tool installed
define('BASE_DIR', dirname(__FILE__, 2) . '/');

// User agent makes this tool appear accessible to humans, not robots
define('USER_AGENT', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36');

// Network/file buffer size for data transfer over the network and for file read-write
define('BUFFER_SIZE', 10485760);

// Small buffer/chunk size for data transfer over the network and for file read-write
define('SMALL_BUFFER_SIZE', 10485760);

// Video Restreaming max. download speed in bytes (CURLOPT_MAX_RECV_SPEED_LARGE). Default: 0 means unlimited
define('MAX_DOWNLOAD_SPEED', 0);

// Database configuration
define('DB_HOSTNAME', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'db_gdplayer_online');
define('DB_PORT', 3306);

// If you set the value to true, open database connections will be reused
define('DB_ATTR_PERSISTENT', false);

// Setting the prefetch size allows you to balance speed against memory usage for your application. A larger prefetch size results in increased performance at the cost of higher memory usage. Default: 1
define('DB_ATTR_PREFETCH', 5);

// Sets the timeout value in seconds for communications with the database. Default: 0
define('DB_ATTR_TIMEOUT', 15);

// Sets the timeout value in seconds. This setting is the database query cache timeout. Default: 30
define('DB_CACHE_TIMEOUT', 3600);

// Specifies the cache driver that will be used to store the cache. Available value: 'Apcu/Files/Memcache/Memcached/Redis/Sqlite'. All cache drivers need to have PHP Extensions installed except 'Files' driver
define('CACHE_DRIVER', 'Redis');

// Insert the driver hostname or leave blank if you want to use Apcu/Sqlite/Files driver. Example '127.0.0.1' is default hostname for Memcache/Memcached/Redis driver
define('CACHE_HOST', '127.0.0.1');

// Cache driver port, example: 6379 is default port for Redis driver
define('CACHE_PORT', 6379);

// Cache driver database name, example: 16 is default database for Redis driver
define('CACHE_DATABASE', 16);

// Cache username to access the cache on the 3rd party server
define('CACHE_USERNAME', '');

// Cache password to access the cache on the 3rd party server
define('CACHE_PASSWORD', '');

// Sets the timeout value in seconds. This setting is a global cache timeout. Default: 3600
define('CACHE_TIMEOUT', 2592000);
