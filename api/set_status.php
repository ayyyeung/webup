<?php

require("config.inc.php");

if(!isset($_SESSION['user_id'])) die("Not logged in");

$message = mysqli_real_escape_string($db, $_POST['message']);
mysqli_query($db, "UPDATE `users` SET `curr_status` = '".$message."', `curr_status_time` = ".time()." WHERE `id` = ".$_SESSION['user_id']);

if(isset($_FILES['image'])) {
  // handle ze image

  $data = file_get_contents($_FILES['image']['tmp_name']);
  $stmt = $db->prepare("UPDATE `users` SET `photo` = ? WHERE `id` = ".$_SESSION['user_id']);
  $stmt->bind_param("s", $data);
  $stmt->execute();
}

print("<script type='text/javascript'>window.location = '../index.php#mainpage'</script>");
