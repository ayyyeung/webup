<?php

require("config.inc.php");

$cond = " WHERE 0";
if(isset($_SESSION['user_id'])) {
   $cond = " WHERE `id` <> ".$_SESSION['user_id']." AND `event_name` = '".$_SESSION['event']."'";
}

$rs = mysqli_query($db, "SELECT * FROM users $cond");

$attendees = array();
while($a = mysqli_fetch_assoc($rs)) {
  $attendees[] = array(
    "id" => $a['id'],
    "username" => $a['username'],
    "message" => $a['curr_status'],
    "updated" => date('F j Y g:ia', $a['curr_status_time']),
    "longitude" => $a['curr_longitude'],
    "latitude" => $a['curr_latitude'],
    "photo_exists" => !is_null($a['photo'])
  );
}

header("Content-Type: text/json");
echo json_encode(array('attendees' => $attendees));
