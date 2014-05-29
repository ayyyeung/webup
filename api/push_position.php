<?php

require("config.inc.php");

if(!isset($_SESSION['user_id'])) die("Not logged in");

$lat = mysqli_real_escape_string($db, $_POST['lat']);
$long = mysqli_real_escape_string($db, $_POST['long']);

mysqli_query($db, "UPDATE `users` SET `curr_longitude` = '$long', `curr_latitude` = '$lat' WHERE `id` = ".$_SESSION['user_id']);
die("Success");
