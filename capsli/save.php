<?php

	$data = $_POST["data"];

	list($type, $data) = explode(';', $data);
	list(, $data)      = explode(',', $data);
	$data 			   = base64_decode($data);

	$filename = md5(uniqid(mt_rand(), true));

	file_put_contents('/c/'.$filename.'.png', $data);

	die($filename);

?>