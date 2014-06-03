<?php

require("config.inc.php");

mysqli_query($db, "DELETE FROM users WHERE id = ".$_SESSION['user_id']);

session_destroy();

header("Location: ../index.php");
