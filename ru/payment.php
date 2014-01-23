<?php
/*
* Класс отвечает за следующие операции:
* проверка корректности платежа, сохранение информации о платеже,
* ответ на запрос сервера одноклассников.
*/
class Payment {
	// массив пар код продукта => цена
	private static $catalog = array(
		"777" => 1
	);

	// массив пар код ошибки => описание
	private static $errors = array(
			1 => "UNKNOWN: please, try again later. If error repeats, contact application support team.",
			2 => "SERVICE: service temporary unavailible. Please try again later",
			3 => "CALLBACK_INVALID_PAYMENT: invalid payment data. Please try again later. If error repeats, contact application support team. ",
			9999 => "SYSTEM: critical system error. Please contact application support team.",
			104 => "PARAM_SIGNATURE: invalid signature. Please contact application support team."
    );

	// функция провкерки корректности платежа
	public static function checkPayment($productCode, $price){
		if (array_key_exists($productCode,self::$catalog) && (self::$catalog[$productCode] == $price)) {
			return true; 
		} else {
			return false;
		}
	}

	public static function returnPaymentOK(){
		// создание xml документа
		$dom = new DomDocument('1.0'); 
		
		// добавление корневого тега - <callbacks_payment_response> 
		$root = $dom->appendChild($dom->createElement('callbacks_payment_response'));
        $attr = $dom->createAttribute("xmlns:ns2");
		$attr->value = "http://api.forticom.com/1.0/";
		$root->appendChild($attr);
		
		// добавление текста "true" в тег <callbacks_payment_response> 
		$root->appendChild($dom->createTextNode('true')); 
        
		
		// генерация xml 
		$dom->formatOutput = true;
		$rezString = $dom->saveXML();
		
		// установка заголовка
		header('Content-Type: application/xml');
		// вывод xml
		print $rezString;
	}

	public static function returnPaymentError($errorCode){
	
		// создание xml документа
		$dom = new DomDocument('1.0'); 
		
		// добавление корневого тега - <ns2:error_response> 
		$root = $dom->appendChild($dom->createElement('ns2:error_response'));
		$attr = $dom->createAttribute("xmlns:ns2");
		
		$attr->value = "http://api.forticom.com/1.0/";
		$root->appendChild($attr); 
		
		// добавление кода ошибки и описания ошибки
		$el = $dom->createElement('error_code');
		$el->appendChild($dom->createTextNode($errorCode));
		$root->appendChild($el);
		if (array_key_exists($errorCode,self::$errors)){
			$el = $dom->createElement('error_msg');
			$el->appendChild($dom->createTextNode(self::$errors[$errorCode]));
			$root->appendChild($el);
		} 
			
		// генерация xml 
		$dom->formatOutput = true;
		$rezString = $dom->saveXML();
		
		// добавление необходимых заголовков
		header('Content-Type: application/xml');
		// ВАЖНО: если не добавить этот заголовок, система может некорректно обработать ответ
		header('invocation-error:'.$errorCode);
		// вывод xml
		print $rezString;
	}

	// Рекомендуется хранить информацию обо всех транзакциях
	public function saveTransactionToDataBase(/* any params you need*/){
	// опишити здесь сохранение информации о транзакции в свою базу данных
	}

}

/*
* Обработка платежа начинается отсюда
*/
if ((array_key_exists("product_code", $_GET)) && array_key_exists("amount",$_GET)){
	if (Payment::checkPayment($_GET["product_code"], $_GET["amount"])){
		Payment::saveTransactionToDataBase();
		Payment::returnPaymentOK();
	} else {
        // тут можно что-нибудь сделать, если поля amount и product_code есть в запросе, но их значение некорректно
		Payment::returnPaymentError(3);
	}
} else {
	// здесь можно что-нибудь сделать, если полей amount и product_code нет в запросе
	Payment::returnPaymentError(3);
}
?>
