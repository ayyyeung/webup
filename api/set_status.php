<?php

require("config.inc.php");

if(!isset($_SESSION['user_id'])) die("Not logged in");

$message = mysqli_real_escape_string($db, $_POST['message']);
mysqli_query($db, "UPDATE `users` SET `curr_status` = '".$message."', `curr_status_time` = ".time()." WHERE `id` = ".$_SESSION['user_id']);

function compress_image($source, $destination, $quality) {
  $info = getimagesize($source);
  if ($info['mime'] == 'image/jpeg')
	$image = imagecreatefromjpeg($source);
  elseif ($info['mime'] == 'image/gif')
	$image = imagecreatefrompng($source);
  elseif ($info['mime'] == 'image/png')
	$image = imagecreatefrompng($source);
  imagejpeg($image, $destination, $quality);
  return $destination;
}

if(isset($_FILES['image'])) {
  // handle ze image
  $data = file_get_contents($_FILES['image']['tmp_name']);
  $stmt = $db->prepare("UPDATE `users` SET `photo` = ? WHERE `id` = ".$_SESSION['user_id']);
  $stmt->bind_param("s", $data);
  $stmt->execute();
}

print("<script type='text/javascript'>window.location = '../index.php#mainpage'</script>");
