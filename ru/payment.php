<?php
//TODO: все транзакции проверять и записывать
// добавляем заголовок
header('Content-Type: application/xml');
//Создает XML-строку и XML-документ при помощи DOM 
$dom = new DomDocument('1.0'); 

//добавление корня - <callbacks_payment_response> 
$root = $dom->appendChild($dom->createElement('callbacks_payment_response')); 

// добавление элемента текстового узла true в <callbacks_payment_response> 
$root->appendChild($dom->createTextNode('true')); 

//генерация xml 
$dom->formatOutput = true;
$test1 = $dom->saveXML(); // передача строки в test1
echo $test1;
?>