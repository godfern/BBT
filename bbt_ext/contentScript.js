var REQ_IDS = {
    INIT_PANEL: 0,
    UPDATE_MODULES: 1,
    SEND_MODULES_ON_CREATE: 2,
    
    SEND_MODULES_ON_DESTROY: 4
};

var EVT_IDS = {
    TEST: 0,
    GET_MODULES: 1
};

//to devtools
var requestDevTools = function(reqId, data){
	switch(reqId){
    case REQ_IDS.INIT:
        chrome.runtime.sendMessage({ type: "INIT", text: data});
    break;
    case REQ_IDS.INIT_PANEL:
        // console.log("requesting init from devtools");          
        var parentNode = document.getElementsByClassName('_2AkmmA _3Plo8Q _19RW-r')[0].parentElement;
        document.getElementsByClassName('_2AkmmA _3Plo8Q _19RW-r')[0].style.display = 'none'
        
        var bargainButton = document.createElement("button");
        bargainButton.innerHTML = "Bargain"
        bargainButton.style.cssText = "background: #31a223; box-shadow: 0 1px 2px 0 rgba(0,0,0,.2); border: none; color: #fff;" + 
        "font-family: Roboto,Arial,sans-serif; letter-spacing: 0;" + 
        "width: 80px; float: right; height: 20px; width: 80px; float: right; height: 30px; margin-top: 15px;";        

        parentNode.appendChild(bargainButton);

        var bargainTextField = document.createElement("input");
        bargainTextField.className = "text";
        bargainTextField.style.cssText = "height: 30px; margin-top: 15px; width: 64%;"

        parentNode.appendChild(bargainTextField);        

        chrome.runtime.sendMessage({ type: "INIT", text: data});        
    break;		
		default:
			console.log("Unknown Request Id");
		break;
	}
}

//from devtools
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var port = chrome.runtime.connect();

  console.log("event from devtools: "+JSON.stringify(request));
if (sender && (request.type == "LOG_EVENT")) {
   // if(document.getElementById("extensionDiv"));

   // var keyItem = localStorage.getItem("initReq");
   // if(keyItem)
      requestDevTools(REQ_IDS.LOG_TO_PANEL,"LOG_EVENT");
     
  }

  if (sender && (request.type == "INIT")) {
      requestDevTools(REQ_IDS.INIT_PANEL);    
  }


  if (sender && (request.type == "GET_MODULES")) {   
      console.log("sending event to blinx: devtools module state");
      sendEventToCore(EVT_IDS.GET_MODULES);
  }

}, false);


var sendEventToCore = function(eventId) {
  var message;
  switch(eventId){
    case EVT_IDS.TEST:    
        message = {"eventId" : "TEST", "data" : "test"};
    break;
    case EVT_IDS.GET_MODULES:
        message = {"eventId" : "GET_MODULES", "data" : ""};
    break;
    default:
        console.log("Unknown event ID in content script");
    break;
  }

  var event = new CustomEvent("content-script-to-blinx", { bubbles: true, detail: message });
  document.dispatchEvent(event);
}


//from core
// document.addEventListener("blinx-to-content-script", function(event){
//   console.log("new event from blinx: "+JSON.stringify(event));
//     switch(event.detail.eventId){
//       case "GET_MODULES_REPONSE":
//         requestDevTools(REQ_IDS.UPDATE_MODULES,event.detail.data);
//       break;    
//     }
// })


//from core(background.js)
window.addEventListener("message", function(event) {
  var port = chrome.runtime.connect();

  console.log("event from blinx: "+JSON.stringify(event));

  if (event.source !== window)
    return;

  if (event.data.type && (event.data.type == "test")) {
    //console.log("event from blinx: "+event);
    
  }

  if (event.data.type && (event.data.type == "LOG_EVENT")) {

    requestDevTools(REQ_IDS.SEND_LOG_TO_PANEL, event.data.text);
  }
  
  if (event.data.type && (event.data.type == "LOG_EVENT")) {

    requestDevTools(REQ_IDS.SEND_LOG_TO_PANEL, event.data.text);
  }

  if (event.data.type && (event.data.type == "STORE_MODULES")) {
    // //console.log("Stored: " + event.data.text);
    // this.moduleArray.push(event.data.text);
    // //port.postMessage(event.data.text);

//    requestDevTools(REQ_IDS.SEND_LOG_TO_PANEL, event.data.text);

  

    requestDevTools(REQ_IDS.SEND_MODULES_TO_PANEL, event.data.text);
  //requestDevTools(REQ_IDS.SEND_MODULES_TO_PANEL, unsafewindow.getModules());  

  }

}, false);


// var addMutationListener = function(){
//     // select the target node
//   var target = document.getElementById("app-container");
//   //var target = document.querySelector('div');
//    //console.log(typeof target);
//   // create an observer instance
//   var observer = new MutationObserver(function(mutations) {    
//     mutations.forEach(function(mutation) {
//       //console.log("Mutation: " + mutation.type);
//       var mutationLog = "Module mutation on: " + mutation.target + " of type: " + mutation.type;
//       requestDevTools(REQ_IDS.SEND_LOG_TO_PANEL, mutationLog); 
//       sendDOM();
//     });    
//   });
     
//      // configuration of the observer:
//      var config = { attributes: true, childList: true, characterData: true, subtree: true };
     
//      // pass in the target node, as well as the observer options
//      observer.observe(target, config);
     
// //     //observer.disconnect();
// }

// var myNode = function(nodeElement){
//   var tag = "";
// //      var className;
// //      var id;
//   var attribs = new Array;
//   var children = new Array;
//   if(nodeElement){
//     if(nodeElement.tagName !== undefined){
//       this.tag = nodeElement.tagName;
// //          this.className = nodeElement.className;
// //          this.id = nodeElement.id;

//       if(nodeElement.hasAttributes){
//         this.attribs = this.createAttribs(nodeElement);          
//       }
//       this.children = this.createChildren(nodeElement);

//     } 
//   }
//   return this;                   
// };

// myNode.prototype.createAttribs = function(nodeElement){
//   var attribArray = new Array;

//   Array.prototype.forEach.call(nodeElement.attributes, function( attrib ){
//     attribArray.push({name:attrib.name, value:attrib.value});
//   });  
//   return attribArray;
// }

// myNode.prototype.createChildren = function(nodeElement){
//   var childNodeArray = new Array;
//   Array.prototype.forEach.call(nodeElement.childNodes, function( childNode ){
//     if(childNode.tagName !== undefined){
//       var customNode = new myNode(childNode);
//       childNodeArray.push(customNode);
//     } 
//   });   
//   //console.log("in loop: "+childNodeArray.length);      
//   return childNodeArray;      
// }

// var sendDOM = function(){
//     var element = document.getElementById("app-container");

//     var moduleTree = new myNode(element);

//     requestDevTools(REQ_IDS.SEND_DOM_TO_PANEL, moduleTree);
// }

// var sendModules =  function(){
//   //getModulesFromCore = func;

//   //console.log("sending modules: "+func);
// //    requestDevTools(REQ_IDS.SEND_MODULES_TO_PANEL, getModulesFromCore);  
//   sendEventToCore(EVT_IDS.GET_MODULES);
// } 





