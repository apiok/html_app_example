/*
* Инициализация API.
* Здесь необходимо изменить 2 параметра:
*/
var permissionStatus = "SET STATUS";
var sig;
var currentUserId;
var feedPostingObject = {};
var rParams = FAPI.Util.getRequestParameters();
FAPI.init(rParams["api_server"], rParams["apiconnection"],
          /*
          * Первый параметр:
          * функция, которая будет вызвана после успешной инициализации.
          */
          function() {
              initCard();
              currentUserId = FAPI.Util.getRequestParameters()["logged_user_id"];
          },
          /*
          * Второй параметр:
          * функция, которая будет вызвана, если инициализация не удалась.
          */
          function(error) {
              processError(error);
          }
);
/*
* Конец блока инициализации API.
*/

/*
* Эта функция вызывается после завершения выполнения следующих методов:
* showPermissions, showInvite, showNotification, showPayment, showConfirmation, setWindowSize
*/
function API_callback(method, result, data) {
    alert("Method "+method+" finished with result "+result+", "+data);
     if (method == "showConfirmation" && result == "ok") { 
         FAPI.Client.call(feedPostingObject, function(status, data, error) {
            console.log(status + "   " + data + " " + error["error_msg"]);
        }, data);
    }
}

/*
* Функция для обработки ошибок.
*/
function processError(e) {
    console.log(e);
    alert("I'm so sorrry, but there's an error :(");
}

/*
* Данная функция вызывается при успешной инициализации.
* Она содержит несколько примеров использования метода "FAPI.Client.call()".
*/
function initCard() {
    // в начале необходимо подготовитьcallback-функции(функции, которые будут вызваны после получения ответа)
    var callback_users_getCurrentUser = function(method,result,data){
        if (result) {
            fillCard(result);
        } else {
            processError(data);
        }
    };
    
    var callback_friends_get = function(method,result,data){
        if(result) {
            var randomFriendId = result[getRandomInt(0,result.length)];
            var callback_users_getInfo = function(method,result,data) {
                if (result) {
                    document.getElementById("random_friend_name_surname").innerHTML = result[0]["first_name"] + " " + result[0]["last_name"];
                } else {
                    processError(data);
                }
            }
            FAPI.Client.call({"method":"users.getInfo", "fields":"first_name,last_name", "uids":randomFriendId}, callback_users_getInfo); 
        } else {
            processError(data);
        }
    }
    
    // а затем вызвать метод "FAPI.Client.call()", передав ему набор параметров и callback-функцию
    
    // пример №1: вызов метода API с параметрами
    // внимание! порядок параметров значения не имеет
    FAPI.Client.call({"fields":"first_name,last_name,location,pic128x128","method":"users.getCurrentUser"}, callback_users_getCurrentUser);
    // пример №2: вызов метода без параметров
    FAPI.Client.call({"method":"friends.get"}, callback_friends_get);    
}

/*
* Пример публикации в ленту.
*/
function publish() {
    FAPI.UI.postMediatopic({
        "media":[
            {
                "type": "text",
                "text": "Here you can see odnoklassniki API docs (click the link)"
            },
            {
                "type": "link",
                "url": "https://apiok.ru"
            },
            {
                "type": "poll",
                "question": "Do you like our API?",
                "answers": [
                    { "text": "Yes" },
                    { "text": "No" }
                ],
                "options": "SingleChoice,AnonymousVoting"
            }
        ]
    }, false);
}

/*
* Пример проверки разрешения.
* В данном примере проверяется разрешение на установку статуса.
*/
function checkSetStatusPermission(){
    var callback = function(status,result,data){
        if(result){
            alert("Разрешение есть");
        } else {
            alert("Разрешения нет");
        }
    }
    FAPI.Client.call({"method":"users.hasAppPermission", "ext_perm":permissionStatus}, callback);
}

/*
* Пример запроса разрешения.
* В данном примере запрашивается разрешение на установку статуса.
*/
function askSetStatusPermission(){
    FAPI.UI.showPermissions("[\"" + permissionStatus + "\"]");
    // в результате будет вызвана функция API_callback
    // стоит обратить внимание на то, что если пользователь снял галочку, но все равно нажал кнопку "Разрешить",
    // вернется результат "ok", но разрешение предоставлено не будет
}

/*
* Пример установки статуса
*/
function setUserStatus(){
    var callback = function(status, result, data){
        console.log("Function setUserStatus callback: status = " + status + " result = " + result + " data = " + data);
    };
    var status = document.getElementById("statusInput").value;
    var params = {"method":"users.setStatus", "status":status};
    FAPI.Client.call(params,callback);
}

/*
* Пример использования диалога приглашения друзей.
*/
function showInvite(){
    FAPI.UI.showInvite("Поиграй в мою игру!", "arg1=val1");
    // в случае успеха возвращает третьим параметром строку, в которой через запятую указаны id приглашенных друзей
}

/* 
* Пример исользования диалога приглашения друзей с предварительным выделением.
* Внимание! Метод работает только если используется fapi5
*/
function showInvite2(){
    var callback = function(status, result, data){
        if(result.length > 2){
            FAPI.UI.showInvite("Поиграй в мою игру!", "arg1=val1", result[0] + ";" + result[1]);
            // в случае успеха возвращает третьим параметром строку, в которой через запятую указаны id приглашенных друзей
        } else {
            alert("Не хватает друзей для примера");
        }
    }
    FAPI.Client.call({"method":"friends.get"},callback);
}

/*
* Пример использования уведомлений.
*/
function showNotification(){
    FAPI.UI.showNotification("Поиграй в мою игру!", "arg1=val1");
    // в случае успеха возвращает третьим параметром строку, в которой через запятую указаны id приглашенных друзей
}

/* 
* Пример исользования уведомлений с выбором.
* Внимание! Метод работает только если используется fapi5
*/
function showNotification2(){
    var callback = function(status, result, data){
        if(result.length > 2){
            FAPI.UI.showNotification("Поиграй в мою игру!", "arg1=val1", result[0] + ";" + result[1]);
            // в случае успеха возвращает третьим параметром строку, в которой через запятую указаны id приглашенных друзей
        } else {
            alert("Не хватает друзей для примера");
        }
    }
    FAPI.Client.call({"method":"friends.get"},callback);
}

/*
* Пример вызова showPayment().
* Внимание! Сервер должен подтвердить оплату, иначе списывание средств пользователя не происходит!
* Пример подтвержения с сервера можно посмотреть в файле payment.php.
*/
function showPayment(){
    var options = "[\"type\":1]";
    FAPI.UI.showPayment("Яблоко", "Это очень вкусно!", 777, 1, null, null, "ok", "true");
}

/*
* Функция показывает окно с предложением пополнить счет в одноклассниках.
*/
function showPortalPayment(){
    FAPI.UI.showPortalPayment();
}

/*
* Изменение размера контейнера.
* Обратите внимание: размер окна имеет ограничегие!
* Высота находится в диапазоне 100 - 4000 пикселей, ширина - 100 - 760 пикселей.
*/
function setWindowSize(width, height){
    if((width >= 100) && (width <= 760) && (height >= 100) && (height <= 4000)){
        FAPI.UI.setWindowSize(width,height);
    } else {
        alert("Неверный размер окна!");
    }
}

/*
* Метод прокручивает страницу к началу.
* Внимание! Метод работает только если используется fapi5.
*/
function scrollToTop(){
    FAPI.UI.scrollToTop();
}

/*
* Вызываетс API_callback с параметром data, содержащим (clientWidth,clientHeight,scrollLeft,scrollTop,offsetLeft,offsetTop,innerHeight,innerWidth).
* Внимание! Метод работает только если используется fapi5.
*/
function getPageInfo(){
    FAPI.UI.getPageInfo();
}

/*
* Функция используется для внутренних нужд.
*/
function navigateTo(){
    FAPI.UI.navigateTo("http://example1.aws.af.cm/payment.php");
}

/*
* Функция используется для внутренних нужд.
*/
function showProfileEmail(){
    FAPI.UI.showProfileEmail();
}

function fillCard(userInfo){
    document.getElementById("name").innerHTML = userInfo["first_name"];
    document.getElementById("surname").innerHTML = userInfo["last_name"];
    document.getElementById("city").innerHTML = userInfo["location"]["city"];
    document.getElementById("userPhoto").src = userInfo["pic128x128"];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}