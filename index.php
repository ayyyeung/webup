<?php require("api/config.inc.php"); ?>
<!DOCTYPE html> 
<html>
<head>
    <title style="background-color:#333">MeetUp</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name=apple-mobile-web-app-capable content=yes>
    <link href='http://fonts.googleapis.com/css?family=Lato:300,400,700,900' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.css" />
    <link rel="stylesheet" type="text/css" href="main.css" />
    <script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
    <script src="http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.js"></script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAU-PeXo4Aocq7-JS9SR4yUT1tFLLHFRWU&sensor=true&libraries=places&libraries=geometry"></script>
    <!--<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?libraries=geometry&sensor=false"></script>-->
    <script type="text/javascript" src="js/jqm-gmaps/jquery.ui.map.js"></script>
    <script type="text/javascript" src="js/jqm-gmaps/jquery.ui.map.services.js"></script>
    <script type="text/javascript" src="js/jqm-gmaps/jquery.ui.map.extensions.js"></script>
    <script type="text/javascript" src="js/JIC.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
    <script type="text/javascript">
    </script>
</head>

<body>
<?php if(!isset($_SESSION['user_id'])) { ?>
    <div data-role="page" id="create_event">
        <div data-role="main" class="ui-content">
	    <div id="login_status">MeetUp</div>
            <form method="post" action="api/create_event.php" data-ajax="false">
                 <input type="text" id="username" name="username" class="login-input" placeholder="Full Name"/>
		 <input type="tel" data-clear-btn="false" name="phone" id="phone" class="login-input" placeholder="Phone Number" value=""/>
                 <?php if (!isset($_GET['event']) || empty($_GET['event'])) { ?>
                      <input type="submit" class="login" name="submit" value="Create meetup" />
                 <?php } else { ?>
                      <input type="hidden" name="event" value="<?=htmlentities($_GET['event']);?>" />
                      <input type="submit" name="submit" class="login" value="Join MeetUp" />
                 <?php } ?>
            </form>
        </div>
    </div>
<?php } else { ?>
    <div data-role="page" id="mainpage">
        <div data-role="panel" data-display="overlay" data-position="right" id="actionspanel">
            <a href="#postmessage" class="ui-btn">Post Message</a>
            <a href="#" class="ui-btn">Set Details</a>
            <a href="#" class="ui-btn">Invite Friends</a>
            <a href="#" class="ui-btn">View Pending Meetups</a>
            <a href="#" class="ui-btn ui-btn-b">Cancel Current Meetup</a>
        </div>
        <div data-role="header" style="background-color:#0b0b0b">
            <a data-ajax="false" href="api/logout.php" style="margin-left:-8px;">Leave</a>
            <h1 style="background-color:#0b0b0b;color:white;text-shadow:none;min-height:1.1em;font-size:17px;">MeetUp</h1>
	    <a href="#" data-icon="navigation" class="ui-btn-notext ui-btn-inline" id="nav-btn" style="height:15px;background-color:transparent;margin-top:5px;padding-top:7px;padding-bottom:6px;padding-right:0px"></a>
        </div>
        <div role="main" class="ui-content">
            <div id="main_map" style="height:417px; margin:-15px -16px"></div>
        </div>
        <div data-role="footer">
           <div data-role="navbar">
              <ul id="tools">
                <li>
                  <a href="#postmessage" class="ui-icon-edit ui-btn-icon-left">Post</a>
                </li>
                <li>
                  <a href="#getlink" class="ui-icon-plus ui-btn-icon-left">
                    Invite
                  </a>
                </li>
                <li>
                   <a href="#summarypage" class="ui-icon-user ui-btn-icon-left"><span class="count">3</span>Friends</a>
                </li>
              </ul>
           </div>
        </div>
    </div>

    <div data-role="page" id="getlink">
      <div data-role="header">
        <a href="#mainpage" class="ui-btn-left ui-link ui-btn ui-shadow ui-corner-all" data-role="button" role="button">Back</a>
        <h1>Invite</h1>
      </div>
      <div role="main" class="ui-content">
        <span id="invite_msg">Invite people by texting the link below!</span>
        <textarea onfocus="this.select()" onmouseup="return false;" name="link" id="link">http://<?=$_SERVER['HTTP_HOST']?>/event/<?=$_SESSION['event']?></textarea>
        <div style="text-align:center;width:100%;font-weight:900;"> - or - </div>
        <input type="submit" class="login" id="email" name="submit" value="Send by Email" />
      </div>
    </div>

    <div data-role="page" id="postmessage">
        <div data-role="header">
            <a href="#mainpage" class="ui-btn-left ui-link ui-btn ui-shadow ui-corner-all" data-role="button" role="button">Back</a>
            <h1>Post Status</h1>
        </div>
        <div role="main" class="ui-content">
            <form action="api/set_status.php" method="post" data-ajax="false" enctype="multipart/form-data">
                <label for="textarea-1">Status:</label>
                <textarea name="message" id="message"></textarea>
                <label for="image">Photo:</label>
                <input type="file"  name="image" accept="image/*" >
		<input type="submit" class="ui-btn" id="update_status" name="update_status" value="Update Status">
            </form>
        </div>
    </div>

    <div data-role="page" id="summarypage">
        <div data-role="header">
            <a href="#mainpage" class="ui-btn-left ui-link ui-btn ui-shadow ui-corner-all" data-role="button" role="button">Back</a>
            <h1>Friends</h1>
        </div>
        <div role="main" class="ui-content">
            <ul data-role="listview" id="friendslist" style="color:black;">
            </ul>
        </div>
    </div>
<?php } ?>
</body>
</html>
