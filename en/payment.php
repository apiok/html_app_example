<?php
// simpliest, but not best way to save transaction info
$params = "";
foreach($_GET as $key=>$value){
	$params = $params.$key." = ".$value."; ";
}
// error_log("New payment: ".$params."\n", 3, "/www/artem.deaddev.com/log.log");
error_log("New payment: ".$params."\n", 3, "/var/log/php/payment_log.log");
//TODO: check and save transaction info
// adding header
header('Content-Type: application/xml');
// creating xml document
$dom = new DomDocument('1.0'); 

//adding root tag - <callbacks_payment_response> 
$root = $dom->appendChild($dom->createElement('callbacks_payment_response')); 

// adding text "true" to <callbacks_payment_response> 
$root->appendChild($dom->createTextNode('true')); 

//generating xml 
$dom->formatOutput = true;
$test1 = $dom->saveXML();
echo $test1;
?>
