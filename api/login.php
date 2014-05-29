<?php

require("config.inc.php");

$phone = mysqli_real_escape_string($db, $_POST['phone']);
$password = mysqli_real_escape_string($db, $_POST['password']);

$ret = mysqli_fetch_assoc(mysqli_query($db, "SELECT * FROM `users` WHERE `phone` = '$phone' AND `password` = '$password'"));

if (is_array($ret)) {
  header("Content-Type: text/json");
  $_SESSION['user_id'] = $ret['id'];
  die(json_encode($ret));
} else {
  http_response_code(403);
  die("Wrong phone # or password.");
}
