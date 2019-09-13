class GUILoader {
    private _nodes: any = {};

    private _nodeTypes: any = {
        element: 1,
        attribute: 2,
        text: 3
    };
    
    private _isLoaded : boolean = false;

    private _objectAttributes: any = {
        "textHorizontalAlignment": 1,
        "textVerticalAlignment": 2,
        "horizontalAlignment": 3,
        "verticalAlignment": 4,
        "stretch": 5,
    };

    private _events: any = {
        "onPointerClickObservable": 1,
        "onPointerMoveObservable": 2,
        "onPointerUpObservable": 3,
        "onPointerOutObservable": 4,
        "onClipboardObservable": 5,
        "onPointerDownObservable": 6,
        "onPointerEnterObservable": 7
    };

    private _parentClass: any;

    constructor(parentClass = null) {
        if (parentClass) {
            this._parentClass = parentClass;
        }
    }

    private _xmlResponse(xml: any, rootNode: any, onLoadCallback: any): void {
        if (!xml.responseXML) {
            throw "GUILoader Exception : XML file is malformed or corrupted.";
        }

        let xmlDoc = xml.responseXML.documentElement;
        this._parseXml(xmlDoc.firstChild, rootNode);
        this._isLoaded = true;
        if (onLoadCallback) {
            onLoadCallback();
        }
    }

    private _createGuiElement(node: any): any {

        try {
            let NewGUINode = eval("BABYLON.GUI." + node.nodeName);

            let guiNode = new NewGUINode();

            for (let i = 0; i < node.attributes.length; i++) {

                if (node.attributes[i].name.toLowerCase().includes("dataSource")) {
                    continue;
                }

                if (node.attributes[i].name.toLowerCase().includes("observable") || this._events[node.attributes[i].name]) {
                    if (this._parentClass) {
                        guiNode[node.attributes[i].name].add(this._parentClass[node.attributes[i].value]);
                    } else {
                        guiNode[node.attributes[i].name].add(eval(node.attributes[i].value));
                    }
                    continue;
                }

                if (node.attributes[i].value.startsWith("{{") && node.attributes[i].value.endsWith("}}")) {
                    if (this._parentClass) {
                        let value = node.attributes[i].value.substring(2, node.attributes[i].value.length - 2);
                        value = value.split(".");
                        let element = this._parentClass;
                        for (let i = 0; i < value.length; i++) {
                            element = element[value[i]];
                        }
                        guiNode[node.attributes[i].name] = element;
                    } else {
                        guiNode[node.attributes[i].name] = eval(node.attributes[i].value.substring(2, node.attributes[i].value.length - 2));
                    }

                } else if (!this._objectAttributes[node.attributes[i].name]) {
                    if (node.attributes[i].value == "true" || node.attributes[i].value == "false") {
                        guiNode[node.attributes[i].name] = (node.attributes[i].value == 'true')
                    } else {
                        guiNode[node.attributes[i].name] = !isNaN(Number(node.attributes[i].value)) ? Number(node.attributes[i].value) : node.attributes[i].value;
                    }
                }  else {
                    guiNode[node.attributes[i].name] = eval("BABYLON.GUI." + node.attributes[i].value);
                }
                
            }

            if (!node.attributes.getNamedItem("id")) {
                this._nodes[node.nodeName + Object.keys(this._nodes).length + "_gen"] = guiNode;
                return guiNode;
            }

            if (!this._nodes[node.attributes.getNamedItem("id").nodeValue]) {
                this._nodes[node.attributes.getNamedItem("id").nodeValue] = guiNode;
            } else {
                throw "GUILoader Exception : Duplicate ID, every element should have an unique ID attribute";
            }
            return guiNode;

        } catch (e) {
            throw "GUILoader Exception : Error parsing Control " + node.nodeName + "," + e + ".";
        }
    }

    private _parseGrid(node: any, guiNode: any, parent: any): void {
        let width;
        let height;
        let columns;
        let rows = node.children;
        let cells;
        let isPixel = false;
        let cellNode;
        let rowNumber = -1;
        let columnNumber = -1;
        let totalColumnsNumber = 0;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].nodeType != this._nodeTypes.element) {
                continue;
            }
            if (rows[i].nodeName != "Row") {
                throw "GUILoader Exception : Expecting Row node, received " + rows[i].nodeName;
            }
            rowNumber += 1;
            columns = rows[i].children;

            if (!rows[i].attributes.getNamedItem("height")) {
                throw "GUILoader Exception : Height must be defined for grid rows";
            }
            height = eval(rows[i].attributes.getNamedItem("height").nodeValue);
            isPixel = rows[i].attributes.getNamedItem("isPixel") ? eval(rows[i].attributes.getNamedItem("isPixel").nodeValue) : false;
            guiNode.addRowDefinition(height, isPixel);

            for (let j = 0; j < columns.length; j++) {
                if (columns[j].nodeType != this._nodeTypes.element) {
                    continue;
                }
                if (columns[j].nodeName != "Column") {
                    throw "GUILoader Exception : Expecting Column node, received " + columns[j].nodeName;
                }
                columnNumber += 1;
                if (rowNumber > 0 && columnNumber > totalColumnsNumber) {
                    throw "GUILoader Exception : In the Grid element, the number of columns is defined in the first row, do not add more columns in the subsequent rows.";
                }

                if (rowNumber == 0) {
                    if (!columns[j].attributes.getNamedItem("width")) {
                        throw "GUILoader Exception : Width must be defined for all the grid columns in the first row";
                    }
                    width = eval(columns[j].attributes.getNamedItem("width").nodeValue);
                    isPixel = columns[j].attributes.getNamedItem("isPixel") ? eval(columns[j].attributes.getNamedItem("isPixel").nodeValue) : false;
                    guiNode.addColumnDefinition(width, isPixel);
                }

                cells = columns[j].children;

                for (let k = 0; k < cells.length; k++) {
                    if (cells[k].nodeType != this._nodeTypes.element) {
                        continue;
                    }
                    cellNode = this._createGuiElement(cells[k]);
                    guiNode.addControl(cellNode, rowNumber, columnNumber);
                    if (cells[k].firstChild) {
                        this._parseXml(cells[k].firstChild, cellNode);
                    }
                }
            }
            if (rowNumber == 0) {
                totalColumnsNumber = columnNumber;
            }
            columnNumber = -1;
        }

        if (node.nextSibling) {
            this._parseXml(node.nextSibling, parent);
        }
    }

    private _parseElement(node: any, guiNode: any, parent: any): void {

        if (node.firstChild) {
            this._parseXml(node.firstChild, guiNode);
        }

        if (node.nextSibling) {
            this._parseXml(node.nextSibling, parent);
        }
    }

    private _prepareSourceElement(node: any, guiNode: any, variable: string, source: any, iterator: any) : void {
        if(this._parentClass) {
            this._parentClass[variable] = source[iterator];
        } else {
            window[variable] = source[iterator];
        }

        if (node.firstChild) {
            this._parseXml(node.firstChild, guiNode, true);
        }
    }

    private _parseElementsFromSource(node: any, guiNode: any, parent: any): void {
        let dataSource = node.attributes.getNamedItem("dataSource").value;
        if(!dataSource.includes(" in ")) {
            throw "GUILoader Exception : Malformed XML, Data Source must include an in";
        } else {
            let isArray = true;
            let splittedSource = dataSource.split(" in ");
            if(splittedSource.length < 2) {
                throw "GUILoader Exception : Malformed XML, Data Source must an iterator and a source";
            }
            let source = splittedSource[1];
            if(source.startsWith("{") && source.endsWith("}")) {
                isArray = false;
            }
            
            if(!isArray || (source.startsWith("[") && source.endsWith("]"))) {
                source = source.substring(1, source.length - 1);
            } 
            
            if(this._parentClass) {
                source = this._parentClass[source];
            } else {
                source = eval(source);
            }

            if(isArray) {
                for(let i = 0; i < source.length; i++) {
                    this._prepareSourceElement(node, guiNode, splittedSource[0], source, i);
                }
            } else {
                for(let i in source) {
                    this._prepareSourceElement(node, guiNode, splittedSource[0], source, i);
                }
            }

            if (node.nextSibling) {
                this._parseXml(node.nextSibling, parent);
            }
        }
    }

    private _parseXml(node: any, parent: any, generated: boolean = false): void {

        if (node.nodeType != this._nodeTypes.element) {
            if (node.nextSibling) {
                this._parseXml(node.nextSibling, parent, generated);
            }
            return;
        }

        if(generated) {
            node.setAttribute("id", parent.id + parent._children.length + 1); 
        }
        
        let guiNode = this._createGuiElement(node);

        if (parent) {
            parent.addControl(guiNode);
        }

        if (node.nodeName == "Grid") {
            this._parseGrid(node, guiNode, parent);
        } else if(!node.attributes.getNamedItem("dataSource")){
            this._parseElement(node, guiNode, parent);
        } else {
            this._parseElementsFromSource(node, guiNode, parent);
        }
    }

    public isLoaded(): boolean {
        return this._isLoaded;
    }

    public getNodeById(id: string): any {
        return this._nodes[id];
    }

    public getNodes(): any {
        return this._nodes;
    }

    // public validateXML(txt: any) {
    //     // code for IE
    //     if (window.ActiveXObject) {
    //         let xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    //         xmlDoc.async = false;
    //         xmlDoc.loadXML(document.all(txt).value);

    //         if (xmlDoc.parseError.errorCode != 0) {
    //             txt = "Error Code: " + xmlDoc.parseError.errorCode + "\n";
    //             txt = txt + "Error Reason: " + xmlDoc.parseError.reason;
    //             txt = txt + "Error Line: " + xmlDoc.parseError.line;
    //             alert(txt);
    //         }
    //         else {
    //             alert("No errors found");
    //         }
    //     }
    //     // code for Mozilla, Firefox, Opera, etc.
    //     else if (document.implementation.createDocument) {
    //         var parser = new DOMParser();
    //         var text = document.getElementById(txt).value;
    //         var xmlDoc = parser.parseFromString(text, "text/xml");

    //         if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    //             checkErrorXML(xmlDoc.getElementsByTagName("parsererror")[0]);
    //             alert(xt)
    //         }
    //         else {
    //             alert("No errors found");
    //         }
    //     }
    //     else {
    //         alert('Your browser cannot handle XML validation');
    //     }
    // }

    public loadLayout(xmlFile : any, rootNode : any, callback : any): void {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            this._xmlResponse(xhttp, rootNode, callback);
        }
    }.bind(this);

    xhttp.open("GET", xmlFile, true);
    xhttp.send();
}
}

