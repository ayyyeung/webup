<?php

require("config.inc.php");

function generateFriendlyString() {
  $dictionary = file("/usr/share/dict/american-english");
  $word1 = $dictionary[rand(0, count($dictionary) - 1)];
  $word2 = $dictionary[rand(0, count($dictionary) - 1)];

  $word1 = trim(strtolower(preg_replace("/[^A-Za-z]+/", "", $word1)));
  $word2 = trim(strtolower(preg_replace("/[^A-Za-z]+/", "", $word2)));

  $number = mt_rand(1, 9999);

  return $word1 . "-" . $word2 . "-" .$number;
}

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, strlen($characters) - 1)];
    }
    //return $randomString;
    return sha1($randomString);
}

if(isset($_POST['event'])) {
  $event = mysqli_real_escape_string($db, strtolower($_POST['event']));
} else {
  $event = generateRandomString();
}

$name = mysqli_real_escape_string($db, $_POST['username']);

mysqli_query($db, "INSERT INTO `users` VALUES (NULL, '".$name."', '-122.169719', '37.427474', 'Just joined!', ".time().", NULL, '".$event."')");

$_SESSION['user_id'] = mysqli_insert_id($db);
$_SESSION['event'] = $event;

header("Location: ../index.php#mainpage");
