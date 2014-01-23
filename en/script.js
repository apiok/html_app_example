/*
* API initialization.
* You have to change 2 parameters here.
*/
var permissionStatus = "SET STATUS";
var sig;
var currentUserId;
var feedPostingObject = {};
var rParams = FAPI.Util.getRequestParameters();
FAPI.init(rParams["api_server"], rParams["apiconnection"],
          /*
          * First parameter:
          * this function will be called
          * if initialization would finish successfully
          */
          function() {
              initCard();
              currentUserId = FAPI.Util.getRequestParameters()["logged_user_id"];
          },
          /*
          * Second parameter:
          * this function will be called
          * if initialization would finish with error.
          */
          function(error) {
              processError(error);
          }
);
/*
* End initialization.
*/

/*
* This function will be called as a callback for these methods:
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
* This function will be called if initialization would fail.
*/
function processError(e) {
    console.log(e);
    alert("I'm so sorrry, but there's an error :(");
}

/*
* This function will be called after success initialization.
* Here you can see some examples of using of "FAPI.Client.call()" method.
*/
function initCard(){
    // at the beginning we prepare callback functions
    var callback_users_getCurrentUser = function(method,result,data) {
        if (result) {
            fillCard(result);
        } else {
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
            FAPI.Client.call({"method":"users.getInfo", "fields":"first_name,last_name", "uids":randomFriendId}, callback_users_getInfo); 
        }else{
            processError(data);
        }
    }
    
    // and then we call the method:
    
    // first example: we need to call method with parameters
    // parameters' sequence is unimportant!
    FAPI.Client.call({"fields":"first_name,last_name,location,pic128x128","method":"users.getCurrentUser"}, callback_users_getCurrentUser);
    // second example: we need to call method without parameters
    FAPI.Client.call({"method":"friends.get"}, callback_friends_get);    
}

/*
* An example of making a publication.
*/
function publish(){
    var description_utf8 = "Can I publish?";
    var caption_utf8 = "Published text";
    // preparing parameters
    feedPostingObject = {method: 'stream.publish',
                        message: description_utf8,
                     attachment: JSON.stringify({'caption': caption_utf8}),
                   action_links: '[]'
                        };
    // counting signature
    sig = FAPI.Client.calcSignature(feedPostingObject);
    // showing confirmation
    FAPI.UI.showConfirmation('stream.publish', description_utf8, sig);
}

/*
* Example of checking permission.
* Here we check permission "SET STATUS".
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
* Example of acquiring permission.
* Here we acquiring permission "SET STATUS".
*/
function askSetStatusPermission(){
    FAPI.UI.showPermissions("[\"" + permissionStatus + "\"]");
    // after getting a result function API_callback will be called
    // Attention! If user will unckeck the permission and press button "Allow"
    // the callback will be called with result "ok", but the permission wouldn't be granted
}

/*
* Example of setting status.
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
* Example of inviting friends.
*/
function showInvite(){
    FAPI.UI.showInvite("Let's play my game!", "arg1=val1");
    // if success, the third parameter of callback will be string with invited friends' ids, splited with comma
}

/* 
* Example of inviting choosed friends.
* Attention! Method works only with fapi5.
*/
function showInvite2(){
    var callback = function(status, result, data){
        if(result.length > 2){
            FAPI.UI.showInvite("Let's play my game!", "arg1=val1", result[0] + ";" + result[1]);
            // if success, the third parameter of callback will be string with invited friends' ids, splited with comma
        } else {
            alert("You have too few friends for this example");
        }
    }
    FAPI.Client.call({"method":"friends.get"},callback);
}

/*
* Example ofтnotifying friends.
*/
function showNotification(){
    FAPI.UI.showNotification("Let's play my game!", "arg1=val1");
    // if success, the third parameter of callback will be string with invited friends' ids, splited with comma
}

/* 
* Example of notifying choosed friends.
* Attention! Method works only with fapi5.
*/
function showNotification2(){
    var callback = function(status, result, data){
        if(result.length > 2){
            FAPI.UI.showNotification("Let's play my game!", "arg1=val1", result[0] + ";" + result[1]);
            // if success, the third parameter of callback will be string with invited friends' ids, splited with comma
        } else {
            alert("You have too few friends for this example");
        }
    }
    FAPI.Client.call({"method":"friends.get"},callback);
}

/*
* Example of using showPayment().
* Attention! Server must confirm payment,  otherwise payment will fail!
* The example of payment confirmation you can see at file payment.php.
*/
function showPayment(){
    FAPI.UI.showPayment("Apple", "It is very tasty!", 777, 1, null, null, "ok", "true");
}

/*
* Function shows window offering to buy oks.
*/
function showPortalPayment(){
    FAPI.UI.showPortalPayment();
}

/*
* Example of changing container size.
* Attention: there are size restrictions!
* Height: 100 - 4000 px, width: 100 - 760 px.
*/
function setWindowSize(width, height){
    if((width >= 100) && (width <= 760) && (height >= 100) && (height <= 4000)){
        FAPI.UI.setWindowSize(width,height);
    } else {
        alert("Неверный размер окна!");
    }
}

/*
* Function for non-public using.
*/
function navigateTo(){
    FAPI.UI.navigateTo("http://example1.aws.af.cm/payment.php");
}

/*
* Function for non-public using.
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

function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min)) + min;
}