var panelElement;
var trussPanel;
var moduleObj;
var allModuleInstances;

var REQ_IDS = {
    INIT: 0,
    SEND_LOG_TO_PANEL: 1,
    SEND_MODULES_ON_CREATE: 2,
    INIT_PANEL: 3,
    SEND_MODULES_ON_DESTROY: 4
};

var EVT_IDS = {
    TEST: 0,
    GET_MODULES: 1
};                

var backgroundPageConnection = chrome.runtime.connect({
    name: "BlinxPanel"
});

var sendMessageToContentScript = function(message){
    backgroundPageConnection.postMessage(message);
}

sendMessageToContentScript({
    name: 'INIT',
    tabId: chrome.devtools.inspectedWindow.tabId
});


var createTrussPanel = new function(){
    console.log("creating blinx panel");
    chrome.devtools.panels.create(
    "Blinx",'',
    "TrussPanel.html",                
    function(panel) {
        panel.onShown.addListener(function tempFunc(panel_window){

            // panel.onShown.removeListener(tempFunc);
             panelElement = panel_window;

            // panelElement.document.getElementById("consoleTab").addEventListener("click", onConsoleClick);
            // panelElement.document.getElementById("treeTab").addEventListener("click", onTreeClick);
            // panelElement.document.getElementById("treeRoot").addEventListener("click", onTreeListClick);     

            // logToTrussConsole("Test: Connection from Core Intitialized!");

            /* Toggle between adding and removing the "active" and "show" classes when the user clicks on one of the "Section" buttons. The "active" class is used to add a background color to the current button when its belonging panel is open. The "show" class is used to open the specific accordion panel */            

            panelElement.document.getElementById("refreshBtn").addEventListener("click", function(){
                panelElement.document.getElementById("logText").innerText = "Checking For Blinx Modules in Page"; 
                sendMessageToContentScript({
                    name: 'GET_MODULES',
                    tabId: chrome.devtools.inspectedWindow.tabId
                });
            });    

        });
    });
}

var recieveMessage = function(message){
    switch(message.type){
        case "INIT":

            //this.createTrussPanel();
        break;
        case "LOG_EVENT":
            // this.logToTrussConsole(message.text);
        break;
        case "GET_DOM":
            // this.logDOMToTreeView(message.text);
        break;
        case "UPDATE_MODULES":
            panelElement.document.getElementById("logText").innerText = "Modules In Page: " + message.data.length; 
            updateModules(message.data);
        break;
        default:
            console.log("Unknown Request Id");
        break;
    }

}

var sendMessage = function(message){
    backgroundPageConnection.postMessage(message);
}

backgroundPageConnection.onMessage.addListener(function (message) {    
    recieveMessage(message);
});

var clearModuleInfo = function(){
    var rootNode = panelElement.document.getElementById("moduleInfo");
    rootNode.innerHTML = "";
}

var updateModules = function(dataObject){
    clearModuleInfo();
    if(dataObject){
        sortModuleArrayToTree(dataObject);
        dataObject.forEach(function(moduleObject, index){
            var rootNode = panelElement.document.getElementById("moduleInfo"); 
            generateAndAppendModuleAccordian(rootNode, moduleObject, index);
        });
    }    
}

var sortModuleArrayToTree = function(objectToConvert){
    objectToConvert.forEach(function(moduleObject, index){
        moduleObject.subModules.forEach(function(subModuleObject, subModuleIndex){
            var instanceConfigToCheck = subModuleObject.moduleInstanceConfig;
            objectToConvert.forEach(function(moduleObjectToCheck, checkIndex){
                if(instanceConfigToCheck == moduleObjectToCheck.moduleInstanceConfig){
                    objectToConvert.splice(checkIndex, 1);
                }
            });
        });
    });
}

var generateAndAppendModuleAccordian = function(rootNode, moduleObject, index){    
       

    var accordianNode = document.createElement("button");
    accordianNode.className = "accordion";
    //accordion.Id = "acc" + index;
    accordianNode.innerText = moduleObject.moduleName;  

    if(moduleObject.moduleConfig.placeholders){
        moduleObject.moduleConfig.placeholders = JSON.parse(moduleObject.moduleConfig.placeholders);
    }  

    var detailNode = document.createElement("div");
    detailNode.className = "panel";
    // var moduleConfig = document.createElement("p");
    // //moduleConfig.innerText = "moduleConfig: " + moduleObject.moduleConfig;
    // $(moduleConfig).jsonView(moduleObject.moduleConfig);

    // detailNode.appendChild(moduleConfig);

    var subModules = document.createElement("p");

    moduleObject.subModules.forEach(function(subModuleObject, subModuleIndex){
        var rootNode = subModules;
        generateAndAppendModuleAccordian(rootNode, subModuleObject, subModuleIndex);
    })
    
    // subModules.innerText = "subModules: " + moduleObject.subModules;
    detailNode.appendChild(subModules);

    rootNode.appendChild(accordianNode);
    rootNode.appendChild(detailNode);    

    accordianNode.onclick = function(){
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle("show");

        sidebarTitle = panelElement.document.getElementById("sidebarHeader");
        sidebarTitle.innerText = "InstanceConfig: ";

        sideBarTextNode = panelElement.document.getElementById("sidebarText");
        sideBarTextNode.innerText = "";
        $(sideBarTextNode).jsonView(moduleObject.moduleConfig);
    }

    // activateAccordians();
};

// var activateAccordians = function(){
//     var acc = panelElement.document.getElementsByClassName("accordion");
//     var i;

//     for (i = 0; i < acc.length; i++) {
//         acc[i].onclick = function(){
//             this.classList.toggle("active");
//             this.nextElementSibling.classList.toggle("show");
//         }
//     }
// }



// this.createTrussPanel();

// var onConsoleClick = function(event){
//     panelElement.document.getElementById("logListContainer").style.display = "block";
//     panelElement.document.getElementById("consoleTab").className = "active";
//     panelElement.document.getElementById("treeTab").className = "";
//     panelElement.document.getElementById("treeView").style.display = "none";
// }   

// var onTreeClick = function(event){
//     panelElement.document.getElementById("treeView").style.display = "block";    
//     panelElement.document.getElementById("consoleTab").className = "";
//     panelElement.document.getElementById("treeTab").className = "active";   
//     panelElement.document.getElementById("logListContainer").style.display = "none";

//     backgroundPageConnection.postMessage({name:"GET_DOM", tabId: chrome.devtools.inspectedWindow.tabId});
// //    backgroundPageConnection.postMessage({name:"GET_MODULES", tabId: chrome.devtools.inspectedWindow.tabId});    

// //    pageRequests.getModules();

// }

// var onTreeListClick = function(event){
//     //logToTrussConsole("Clicked on " + event.target.innerText);
//     reqPageNode = getPageNodeFromListNode(event.target);
//     if(reqPageNode){
//     //    logToTrussConsole("Found page node of tag: "+reqPageNode.tag);
//         showNodeInSidebar(reqPageNode);
//     }
// }

// var showNodeInSidebar = function(nodeElement){
//     var head = panelElement.document.getElementById("sidebarTitle");
//     head.innerText = "<" + nodeElement.tag + ">";

//     var propList = panelElement.document.getElementById("sidebarProperties");
//     propList.innerHTML = "";

//     if(nodeElement.attribs && nodeElement.attribs.length>0){
//         for(var i=0;i<nodeElement.attribs.length;++i){
//             var listNode = document.createElement("LI");
//             var textNode = document.createTextNode(" "+nodeElement.attribs[i].name + ": \"" + nodeElement.attribs[i].value + "\"");

//             listNode.appendChild(textNode)
//             propList.appendChild(listNode);            
//         }    
//     }
    
//     if(nodeElement.children){
//         var listNode = document.createElement("LI");
//         var textNode = document.createTextNode("children: " + nodeElement.children.length);

//         listNode.appendChild(textNode)
//         propList.appendChild(listNode);     

//         if(nodeElement.children.length>0){
//             var childList = document.createElement("UL");
//             for(var i=0;i<nodeElement.children.length;++i){
//                 var subListNode = document.createElement("LI");
//                 var subTextNode = document.createTextNode(nodeElement.children[i].tag.toLowerCase());

//                 subListNode.appendChild(subTextNode)
//                 childList.appendChild(subListNode);            
//             }   
//             propList.appendChild(childList);             
//         }
//     }
// }

// var getPageNodeFromListNode = function(listNode){
//     for(var i=0;i<listNodeToPageNodeMap.length;++i){
//         //logToTrussConsole("searching..."+listNodeToPageNodeMap[i].pageNode.tag);
//         if(listNode == listNodeToPageNodeMap[i].listNode){
//             return listNodeToPageNodeMap[i].pageNode;
//         }
//     }    
//     return false;
// }

// var logToTrussConsole = function(message){

//     var logList = panelElement.document.getElementById("logList");
//     var node = document.createElement("LI");
//     var textNode = document.createTextNode(message);
//     node.appendChild(textNode);

//     logList.appendChild(node);  
// }

// var logModulesToTreeView = function(message){

//     var treeViewElement = panelElement.document.getElementById("treeView");
//     var rootElement = panelElement.document.getElementById('treeRoot');
//     rootElement.innerHTML = "";

//     var logModuleTree = function(nodeId, node, domElement){
//       //  logToTrussConsole(nodeId+": "+ typeof node);
//           var listNode = document.createElement("LI");

//           var textNode = document.createTextNode("<"+nodeId);
//           listNode.appendChild(textNode);

//           textNode = document.createTextNode(">");        
//           listNode.appendChild(textNode);

//           domElement.appendChild(listNode);

//           var lineBreak = document.createElement("BR");
//           domElement.appendChild(lineBreak);

//   //      if(Object.keys(node).length>0){
//         //if(Object.prototype.toString.call( node ) !== '[object Array]'){
//         if(Object.prototype.toString.call( node ) !== '[object String]'){   
//             for(var attrib in node){
//                 //if((typeof attrib)!=="string"){
//                 //if(Object.prototype.toString.call( attrib ) !== '[object Array]'){
//                     var innerListNode = document.createElement("UL");
//                     // logModuleTree(attrib, innerListNode);
//                     // //var textNode = document.createTextNode(" "+ attrib + "= \"" + node[attrib] + "\"");
//                    // if(!(typeof node == Array))
//                     logModuleTree(attrib, node[attrib], innerListNode);
//                     listNode.appendChild(innerListNode);                
//                 //}                
//             }   
//         }else if(Object.prototype.toString.call( node ) == '[object String]'){
//             var innerListNode = document.createElement("LI");
//             var textNode = document.createTextNode(node);
//             innerListNode.appendChild(textNode);
// //                    logModuleTree(attrib, node, innerListNode);
//             listNode.appendChild(innerListNode);  
//         }else if(Object.prototype.toString.call( node ) !== '[object Function]'){
//             var innerListNode = document.createElement("LI");
//             var textNode = document.createTextNode(node + "()");
//             innerListNode.appendChild(textNode);
// //                    logModuleTree(attrib, node, innerListNode);
//             listNode.appendChild(innerListNode); 
//         }     

//     }
//     for(var module in message){       
//         logModuleTree(module, message[module], rootElement);                
//         //console.log("module loaded: "+module);         
//     }

//    CollapsibleLists.applyTo(rootElement);
// }

// var logDOMToTreeView = function(message){
//     var treeViewElement = panelElement.document.getElementById("treeView");
//     var rootElement = panelElement.document.getElementById('treeRoot');
//     rootElement.innerHTML = "";

//     var logTree = function(nodeElement, domElement){

//       var listNode = document.createElement("LI");
//       listNodeToPageNodeMap.push({listNode:listNode,pageNode:nodeElement});
//       // var index = listNodeToPageNodeMap.length - 1;
//       // logToTrussConsole(listNodeToPageNodeMap[index].pageNode.tag);

//       var textNode = document.createTextNode("<"+nodeElement.tag.toLowerCase());
//       listNode.appendChild(textNode);

//       if(nodeElement.attribs && nodeElement.attribs.length>0){

//         for(var i=0;i<nodeElement.attribs.length;++i){
//             var textNode = document.createTextNode(" "+nodeElement.attribs[i].name + "= \"" + nodeElement.attribs[i].value + "\"");
//             listNode.appendChild(textNode);
//         }      

//       }

//       textNode = document.createTextNode(">");        
//       listNode.appendChild(textNode);

//       domElement.appendChild(listNode);

//       var lineBreak = document.createElement("BR");
//       domElement.appendChild(lineBreak);

//       if(nodeElement.children && nodeElement.children.length>0){
//         var innerListNode = document.createElement("UL");
//         listNode.appendChild(innerListNode);
//         for(var i=0;i<nodeElement.children.length;++i){
//             logTree(nodeElement.children[i], innerListNode);
//         }  
//       }  
//     }

//    logTree(message, rootElement);

//    CollapsibleLists.applyTo(rootElement);
// }

