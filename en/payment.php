<?php
//TODO: check and save transaction info :)
// adding header
header('Content-Type: application/xml');
//creating xml document
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