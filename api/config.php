<?php
// Pinecone API Configuration for Aback.ai
// Load from environment variables (set in .htaccess)

// Prevent direct access to this file
if (!defined('INCLUDED_FROM_PROXY') && basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    header('HTTP/1.0 403 Forbidden');
    exit('Access Denied');
}

define('PINECONE_API_KEY', getenv('PINECONE_API_KEY'));
define('PINECONE_ASSISTANT_NAME', getenv('PINECONE_ASSISTANT_NAME'));
define('PINECONE_API_VERSION', '2025-01');
define('PINECONE_MODEL', 'gpt-4o');
?>
