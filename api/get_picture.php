<?php

require("config.inc.php");

$id = mysqli_real_escape_string($db, $_GET['id']);

header("Content-Type: image/jpg");

$rs = mysqli_fetch_assoc(mysqli_query($db, "SELECT `photo` FROM `users` WHERE `id` = ".$id));

if(is_array($rs))
  echo $rs['photo'];
else
  echo "no photo available";

