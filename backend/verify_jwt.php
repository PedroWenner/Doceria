<?php
$url = 'http://127.0.0.1:8001/api/auth/login';
$data = ['email' => 'admin@sweetstore.com', 'password' => 'password'];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
$response = json_decode($result, true);

if (isset($response['access_token'])) {
    echo "SUCCESS: Token received: " . substr($response['access_token'], 0, 20) . "...\n";
    echo "Token Type: " . $response['token_type'] . "\n";
    echo "User: " . $response['user']['name'] . "\n";
} else {
    echo "ERROR: Login failed.\n";
    print_r($response);
}
