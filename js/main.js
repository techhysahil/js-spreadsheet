// main
function main(){
    Globals.Instance.initialize();
    Globals.Instance.spreadsheet.domUpdate();
}

/****************************************
				Global
****************************************/
function Globals(){
	//nothing here
}

Globals.Instance = new Globals();

Globals.prototype.initialize = function(){
	var dummyJson = [
        [ "14", "2", "63","7"],
        [ "2", "5", "6","8"],
        [ "7", "8", "9","97"],
        [ "6", "", "76","66"],
		];

	this.spreadsheet = new Spreadsheet("testsheet",dummyJson);
}


/****************************************
		SpreadSheet
****************************************/
function Spreadsheet(name, Array){
    this.name = name;
    this.json = Array;

    this.ySize = this.json.length;
    this.xSize = this.json.length===0?0:this.json[0].length;
    
}

// Spreadsheet.prototype.createJson = function(x,y){
// 	var json = [];
// 	for(var i=0;i<y;i++){
// 		for(var j=0;i<x;i++){
// 			json[i][i]="";
// 		}	
// 	}

// 	var spreadsheet = Globals.Instance.spreadsheet;
//     spreadsheet.json = json;
// }

Spreadsheet.prototype.storeData = function(){
	localStorage.setItem("name",JSON.stringify(this.name));
	localStorage.setItem("json",JSON.stringify(this.json));
	localStorage.setItem("xSize",JSON.stringify(this.xSize));
	localStorage.setItem("ySize",JSON.stringify(this.ySize));
}

Spreadsheet.prototype.updateJSON = function(){
	var newJson = [];

	for(var i=0;i<parseInt(this.ySize);i++){
		var row = [];
		if(this.json[i] === undefined){
			var row = [];
		}
		for(var j=0;j<parseInt(this.xSize);j++){
			if(this.json[i] === undefined || this.json[i][j] === undefined){
				row.push("");
			}else{
				row.push(this.json[i][j]);
			}
		}
		newJson.push(row);
	}
	var spreadsheet = Globals.Instance.spreadsheet;
    spreadsheet.json = newJson;
    spreadsheet.resetDom();
    spreadsheet.domUpdate();
}

Spreadsheet.prototype.resetDom = function(){
	var SpreadsheetWrapper = document.getElementById("Spreadsheet-wrapper");

	while(SpreadsheetWrapper.firstChild){
		SpreadsheetWrapper.removeChild(SpreadsheetWrapper.firstChild);
	}
}

Spreadsheet.prototype.domUpdate = function(){
	// File Name
    var inputName = document.getElementById("fileName");
    inputName.value = this.name;

    // X size
    var inputName = document.getElementById("xSize");
    inputName.value = this.xSize;

    // Y size
    var inputName = document.getElementById("ySize");
    inputName.value = this.ySize;

    

	var SpreadsheetWrapper = document.getElementById("Spreadsheet-wrapper");

    var header = document.createElement("div");
    	header.setAttribute('class','header row');

    //Build Table Headers
    var charCodeForA = "a".charCodeAt();
   	for (var i=0; i<this.xSize+1; i++) {
   		var columnLetter = String.fromCharCode(charCodeForA + i -1);
    	var headerCol = document.createElement("div");
    		headerCol.setAttribute('class','col');
    		if(i>0){
    			headerCol.innerHTML = columnLetter;	
    			headerCol.setAttribute("data-index", i-1);
    			headerCol.addEventListener('click', sortHeader, false);
    		}else{
    			headerCol.innerHTML = "@";	
    		}
    	header.appendChild(headerCol);
    }

    SpreadsheetWrapper.appendChild(header);	

    for (var j=0; j<this.ySize; j++) {
        var row = document.createElement("div");
        	row.setAttribute('class','row');	        

        for (var i=0; i<this.xSize+1; i++) {
        	var rowCol = document.createElement("div");
	        	rowCol.setAttribute('class','col');
        	if(i===0){
        		rowCol.innerHTML = (j+1);
        	}else{
        		rowCol.setAttribute('contenteditable','true');
        		rowCol.tabIndex = 1;
        		rowCol.setAttribute('xPos',i-1)
        		rowCol.setAttribute('yPos',j)
        		rowCol.addEventListener('blur',changeCellvalue);
        		rowCol.innerHTML = this.json[j][i-1];
        	}

        	row.appendChild(rowCol);
        }
    	SpreadsheetWrapper.appendChild(row);
	}
}	


/****************************************
				Ui Events
****************************************/

function buttonLoad_Clicked(){
    var spreadsheet = Globals.Instance.spreadsheet;
 
    var inputFileToLoad = document.getElementById("inputFileToLoad");
    var fileToLoad = inputFileToLoad.files[0];
    if (fileToLoad == null)
    {
        alert("No file specified!");
    }
    else
    {
        FileHelper.loadFileAsText(fileToLoad,buttonLoad_Clicked_FileLoaded);
    }
}

function buttonLoad_Clicked_FileLoaded(fileName, fileContents){
    var spreadsheetAsJSON = fileContents;
    var spreadsheet = Serializer.deserialize(spreadsheetAsJSON);
 
    Globals.Instance.spreadsheet = spreadsheet;
    spreadsheet.resetDom();
    spreadsheet.domUpdate();
    spreadsheet.storeData();

}

function changeCellvalue (event){
	var spreadsheet = Globals.Instance.spreadsheet,
		newVal = event.target.innerText,
    	xPos = event.target.getAttribute("xpos"),
    	yPos = event.target.getAttribute("ypos"),
    	json = spreadsheet.json;

	if(json[xPos][yPos] !== newVal){
		json[yPos][xPos] = newVal;
		spreadsheet.json = json;
		spreadsheet.resetDom();
		spreadsheet.domUpdate();
		spreadsheet.storeData();
	}
}

function inputName_Changed(inputName){
    var spreadsheet = Globals.Instance.spreadsheet;
    spreadsheet.name = inputName.value;
}

function inputXSize_Changed(input){
	var spreadsheet = Globals.Instance.spreadsheet;
    spreadsheet.xSize = parseInt(input.value);

    spreadsheet.updateJSON();
    spreadsheet.storeData();
}

function inputYsize_Changed(input){
	var spreadsheet = Globals.Instance.spreadsheet;
    spreadsheet.ySize = parseInt(input.value);

    spreadsheet.updateJSON();
    spreadsheet.storeData();
}	

function sortHeader(event){
	var spreadsheet = Globals.Instance.spreadsheet;
	var index = parseInt(event.target.getAttribute('data-index'));
	var json = spreadsheet.json;
	json.sort(function(a,b){
		return a[index] - b[index] 
	});

	spreadsheet.json = json;
    spreadsheet.updateJSON();
    spreadsheet.storeData();	
}

function addNewRow(){
	var index = document.getElementById('addRowindex').value;
	if(index){
		var spreadsheet = Globals.Instance.spreadsheet;
		var json = spreadsheet.json;

		var columns = json.length > 0 ? json[0].length : 1;
		if(json.length > 0 && index > json.length -1){
			alert("index value cannot be greater than column length");
		}else{
			var row = [];
			for(var i=0;i<columns;i++){
				row.push("")
			}
			json.splice(index,0,row);

			spreadsheet.json = json;
			spreadsheet.ySize += 1;
		    spreadsheet.resetDom();
		    spreadsheet.domUpdate();
		    spreadsheet.storeData();
		}
	}else{
		alert("Please enter a verticle index position");
	}
}

function deleteRow(){
	var index = document.getElementById('addRowindex').value;
	if(index){
		var spreadsheet = Globals.Instance.spreadsheet;
		var json = spreadsheet.json;

		var columns = json.length > 0 ? json[0].length : 1;
		if(json.length > 0 && index > json.length -1){
			alert("index value cannot be greater than column length");
		}else{
			json.splice(index,1);

			spreadsheet.json = json;
			spreadsheet.ySize += 1;
		    spreadsheet.resetDom();
		    spreadsheet.domUpdate();
		    spreadsheet.storeData();
		}
	}else{
		alert("Please enter a verticle index position");
	}
}

function addNewColumn(){
	var index = document.getElementById('addColumnindex').value;
	if(index){
		var spreadsheet = Globals.Instance.spreadsheet;
		var json = spreadsheet.json;

		var columns = json.length > 0 ? json[0].length : 1;
		if(json.length > 0 && index > json.length -1){
			alert("index value cannot be greater than rows length");
		}else{
			for(var i=0;i<json.length;i++){
				json[i].splice(index,0,"");
			}			

			spreadsheet.json = json;
			spreadsheet.xSize += 1;
		    spreadsheet.resetDom();
		    spreadsheet.domUpdate();
		    spreadsheet.storeData();
		}
		
	}else{
		alert("Please enter a verticle index position");
	}
}

function deleteColumn(){
	var index = document.getElementById('addColumnindex').value;
	if(index){
		var spreadsheet = Globals.Instance.spreadsheet;
		var json = spreadsheet.json;

		var columns = json.length > 0 ? json[0].length : 1;
		if(json.length > 0 && index > json.length -1){
			alert("index value cannot be greater than rows length");
		}else{
			for(var i=0;i<json.length;i++){
				json[i].splice(index,1);
			}			

			spreadsheet.json = json;
			spreadsheet.xSize -= 1;
		    spreadsheet.resetDom();
		    spreadsheet.domUpdate();
		    spreadsheet.storeData();
		}
	}else{
		alert("Please enter a verticle index position");
	}
}

function createNew_Sheet(){
	var spreadsheet = Globals.Instance.spreadsheet;
    spreadsheet.name = "newFile";
    spreadsheet.xSize = 1;
    spreadsheet.ySize = 1;
    spreadsheet.json = [[""]];
    spreadsheet.resetDom();
    spreadsheet.domUpdate();
    spreadsheet.storeData();
}

function buttonSave_Clicked(){
    var spreadsheet = Globals.Instance.spreadsheet;
     
    var spreadsheetSerialized = Serializer.serialize(spreadsheet);
    FileHelper.saveTextAsFile(spreadsheetSerialized, spreadsheet.name);
}


/****************************************
				Serializer
****************************************/
function Serializer(){
    // static class
}
Serializer.deserialize = function(stringToDeserialize){
    var spreadsheetAsObject = JSON.parse(stringToDeserialize);

    var spreadsheetName = spreadsheetAsObject.name;
    var cellRowsAsStringArrays = spreadsheetAsObject.cellRows;

    var spreadsheet = new Spreadsheet
    (
        spreadsheetName,
        cellRowsAsStringArrays
    );

    return spreadsheet;
}
 
Serializer.serialize = function(spreadsheet){
    var spreadsheetAsObject = 
    {
        "name" : spreadsheet.name,
        "cellRows" : spreadsheet.json
    }

    var spreadsheetAsJSON = JSON.stringify(spreadsheetAsObject);

    return spreadsheetAsJSON;
}

/****************************************
				File Helper
****************************************/
function FileHelper(){
    // static class
}

FileHelper.loadFileAsText = function(fileToLoad, callback){
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) 
    {
        var textFromFileLoaded = fileLoadedEvent.target.result;
        callback(fileToLoad.name, textFromFileLoaded);
    };
    fileReader.readAsText(fileToLoad);
}
  
FileHelper.saveTextAsFile = function(textToSave, fileNameToSaveAs){
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.href = textToSaveAsURL;
    downloadLink.click();
}


main();