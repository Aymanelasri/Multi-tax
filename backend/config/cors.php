<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    // Allow all localhost origins during development
    'allowed_origins' => [
        'https://taxtva20.netlify.app',

        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        
    ],
    'allowed_origins_patterns' => [
        '#^https://.*\\.netlify\\.app$#',  // All Netlify preview deployments
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
