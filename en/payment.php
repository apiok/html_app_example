<?php
/*
* Class responsible for payment operations:
* checking opearation correctness, saving information to database,
* responsing to odnoklassniki server.
*/
class Payment {
    const ERROR_TYPE_UNKNOWN = 1;
    const ERROR_TYPE_SERVISE = 2;
    const ERROR_TYPE_CALLBACK_INVALID_PYMENT = 3;
    const ERROR_TYPE_SYSTEM = 9999;
    const ERROR_TYPE_PARAM_SIGNATURE = 104;
    
	// array of pairs product code => price
	private static $catalog = array(
		"777" => 1
    );

	// array of pairs error code => error message
	private static $errors = array(
			1 => "UNKNOWN: please, try again later. If error repeats, contact application support team.",
			2 => "SERVICE: service temporary unavailible. Please try again later",
			3 => "CALLBACK_INVALID_PAYMENT: invalid payment data. Please try again later. If error repeats, contact application support team. ",
			9999 => "SYSTEM: critical system error. Please contact application support team.",
			104 => "PARAM_SIGNATURE: invalid signature. Please contact application support team."
    );

	// function checks the correct price of the product
	public static function checkPayment($productCode, $price){
		if (array_key_exists($productCode, self::$catalog) && (self::$catalog[$productCode] == $price)) {
			return true; 
		} else {
			return false;
		}
	}

	public static function returnPaymentOK(){
		$rootElement = 'callbacks_payment_response';

        $dom = self::createXMLWithRoot($rootElement);
        $root = $dom->getElementsByTagName($rootElement)->item(0);
		
		// adding text "true" to <callbacks_payment_response> 
		$root->appendChild($dom->createTextNode('true')); 
		
		// generating xml 
		$dom->formatOutput = true;
		$rezString = $dom->saveXML();
		
		// adding header
		header('Content-Type: application/xml');
		// printing xml response
		print $rezString;
	}

	public static function returnPaymentError($errorCode){
        $rootElement = 'ns2:error_response';

        $dom = self::createXMLWithRoot($rootElement);
        $root = $dom->getElementsByTagName($rootElement)->item(0);
		// adding error code and error message to root element
		$el = $dom->createElement('error_code');
		$el->appendChild($dom->createTextNode($errorCode));
		$root->appendChild($el);
		if (array_key_exists($errorCode,self::$errors)){
			$el = $dom->createElement('error_msg');
			$el->appendChild($dom->createTextNode(self::$errors[$errorCode]));
			$root->appendChild($el);
		} 
			
		// generating xml 
		$dom->formatOutput = true;
		$rezString = $dom->saveXML();
		
		// adding header
		header('Content-Type: application/xml');
		// IMPORTANT: if you'll not add this header, system may have incorrect reaction
		header('invocation-error:'.$errorCode);
		// printing xml response
		print $rezString;
	}

	// It is recommended to keep all transactions info
	public function saveTransactionToDataBase(/* any params you need*/){
	// add code, that saves transaction info here
	}
    
    private static function createXMLWithRoot($root){
        // creating xml document
		$dom = new DomDocument('1.0'); 
		// adding root tag
		$root = $dom->appendChild($dom->createElement($root));
        $attr = $dom->createAttribute("xmlns:ns2");
		$attr->value = "http://api.forticom.com/1.0/";
		$root->appendChild($attr);
        return $dom;
    }

}

/*
* Payment processing starts here
*/
if ((array_key_exists("product_code", $_GET)) && array_key_exists("amount", $_GET)){
	if (Payment::checkPayment($_GET["product_code"], $_GET["amount"])){
		Payment::saveTransactionToDataBase();
		Payment::returnPaymentOK();
	} else {
        // do something if get request has params product_code and amount, but they are not correct
		Payment::returnPaymentError(Payment::ERROR_TYPE_CALLBACK_INVALID_PYMENT);
	}
} else {
	// do something if get request has no params product_code and amount
	Payment::returnPaymentError(Payment::ERROR_TYPE_CALLBACK_INVALID_PYMENT);
}
?>