/*
* Инициализация API.
* Здесь необходимо изменить 2 параметра:
*/
var rParams = FAPI.Util.getRequestParameters();
FAPI.init(rParams["api_server"], rParams["apiconnection"],
          /*
          * Первый параметр:
          * функция, которая будет вызвана после успешной инициализации.
          */
          function() {
              initCard();
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

function fillCard(userInfo){
    document.getElementById("name").innerHTML = userInfo["first_name"];
    document.getElementById("surname").innerHTML = userInfo["last_name"];
    document.getElementById("city").innerHTML = userInfo["location"]["city"];
    document.getElementById("userPhoto").src = userInfo["pic128x128"];
}


function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min)) + min;
}
