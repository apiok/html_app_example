/*
* Инициализация API.
* Здесь необходимо изменить 2 параметра:
*/
var hasPublishPermission;
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
              currentUserId = getUrlParameters("logged_user_id","",false);
          },
          /*
          * Второй параметр:
          * функция, которая будет вызвана, если инициализация не удалась.
          */
          function(error){
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
function processError(e){
    console.log(e);
    alert("I'm so sorrry, but there's an error :(");
}

/*
* Данная функция вызывается при успешной инициализации.
* Она содержит несколько примеров использования метода "FAPI.Client.call()".
*/
function initCard(){
    //в начале необходимо подготовитьcallback-функции(функции, которые будут вызваны после получения ответа)
    var callback_users_getCurrentUser = function(method,result,data){
        if (result){
            fillCard(result);
        }else{
            processError(data);
        }
    };
    
    var callback_friends_get = function(method,result,data){
        if(result){
            var randomFriendId = result[getRandomInt(0,result.length)];
            var callback_users_getInfo = function(method,result,data){
                if (result){
                    document.getElementById("random_friend_name_surname").innerHTML = result[0]["first_name"] + " " + result[0]["last_name"];
                }else{
                    processError(data);
                }
            }
            FAPI.Client.call({"method":"users.getInfo","fields":"first_name,last_name","uids":randomFriendId},callback_users_getInfo); 
        }else{
            processError(data);
        }
    }
    
    //а затем вызвать метод "FAPI.Client.call()", передав ему набор параметров и callback-функцию
    
    //пример №1: вызов метода API с параметрами
    //внимание! порядок параметров значения не имеет
    FAPI.Client.call({"fields":"first_name,last_name,location,pic128x128","method":"users.getCurrentUser"},callback_users_getCurrentUser);
    //пример №2: вызов метода без параметров
    FAPI.Client.call({"method":"friends.get"},callback_friends_get);    
}

/*
* Пример публикации в ленту.
*/
function publish(){
    var description_utf8 = "Can I publish?";
    var caption_utf8 = "Published text";
    //подготовка параметров для публикации
    feedPostingObject = {method: 'stream.publish',
                        message: description_utf8,
                     attachment: JSON.stringify({'caption': caption_utf8}),
                   action_links: '[]',
                         //эти три параметра надо добавить
               application_key : FAPI.Client.applicationKey,
		           session_key : FAPI.Client.sessionKey,
		                format : FAPI.Client.format
                        };
    //рассчет подписи
    sig = FAPI.Util.calcSignature(feedPostingObject, FAPI.Client.sessionSecretKey);
    //вызов окна подтверждения
    FAPI.UI.showConfirmation('stream.publish', description_utf8, sig);
}

function fillCard(userInfo){
    document.getElementById("name").innerHTML = userInfo["first_name"];
    document.getElementById("surname").innerHTML = userInfo["last_name"];
    document.getElementById("city").innerHTML = userInfo["location"]["city"];
    document.getElementById("userPhoto").src = userInfo["pic128x128"];
}

function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min)) + min;
}

function getUrlParameters(parameter, staticURL, decode){
   /*
    Function: getUrlParameters
    Description: Get the value of URL parameters either from 
                 current URL or static URL
    Author: Tirumal
    URL: www.code-tricks.com
   */
   var currLocation = (staticURL.length)? staticURL : window.location.search,
       parArr = currLocation.split("?")[1].split("&"),
       returnBool = true;
   
   for(var i = 0; i < parArr.length; i++){
        parr = parArr[i].split("=");
        if(parr[0] == parameter){
            return (decode) ? decodeURIComponent(parr[1]) : parr[1];
            returnBool = true;
        }else{
            returnBool = false;            
        }
   }
   
   if(!returnBool) return false;
}