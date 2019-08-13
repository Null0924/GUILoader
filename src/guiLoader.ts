class GUILoader {
    private _nodes: any = {};

    private _this :any = this;
    private _nodeTypes: any = {
        element: 1,
        attribute: 2,
        text: 3
    };

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

    constructor() {

    }

    private _xmlResponse(xml: any, rootNode: any, onLoadCallback: any): void {
        if (!xml.responseXML) {
            throw "GUILoader Exception : XML file is malformed or corrupted.";
        }

        let xmlDoc = xml.responseXML.documentElement;
        this._parseXml(xmlDoc.firstChild, rootNode);
        onLoadCallback();
    }

    private _createGuiElement(node: any): any {
        let NewGUINode = eval("BABYLON.GUI." + node.nodeName);

        let guiNode = new NewGUINode();

        for (let i = 0; i < node.attributes.length; i++) {
            
            if (this._events[node.attributes[i].name]) {
                guiNode[node.attributes[i].name].add(eval(node.attributes[i].value));
                continue;
            }

            if (!this._objectAttributes[node.attributes[i].name]) {
                guiNode[node.attributes[i].name] = node.attributes[i].value;
            } else {
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
    }

    private _parseGrid(node: any, guiNode: any, parent: any): void {
        let width;
        let height;
        let columns;
        let rows = node.childNodes;
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
            rowNumber += 1;
            columns = rows[i].childNodes;
            height = eval(rows[i].attributes.getNamedItem("height").nodeValue);
            isPixel = rows[i].attributes.getNamedItem("isPixel") ? eval(rows[i].attributes.getNamedItem("isPixel").nodeValue) : false;
            guiNode.addRowDefinition(height, isPixel);

            for (let j = 0; j < columns.length; j++) {
                if (columns[j].nodeType != this._nodeTypes.element) {
                    continue;
                }
                columnNumber += 1;
                if (rowNumber > 0 && columnNumber > totalColumnsNumber) {
                    throw "GUILoader Exception : In the Grid element, the number of columns is defined in the first row, do not add more columns in the subsequent rows.";
                }

                if (rowNumber == 0) {
                    width = eval(columns[j].attributes.getNamedItem("width").nodeValue);
                    isPixel = columns[j].attributes.getNamedItem("isPixel") ? eval(columns[j].attributes.getNamedItem("isPixel").nodeValue) : false;
                    guiNode.addColumnDefinition(width, isPixel);
                }

                cells = columns[j].childNodes;

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

    private _parseXml(node: any, parent: any): void {

        if (node.nodeType != this._nodeTypes.element) {
            if (node.nextSibling) {
                this._parseXml(node.nextSibling, parent);
            }
            return;
        }

        let guiNode = this._createGuiElement(node);

        if (parent) {
            parent.addControl(guiNode);
        }

        if (node.nodeName == "Grid") {
            this._parseGrid(node, guiNode, parent);
        } else {
            this._parseElement(node, guiNode, parent);
        }

    }

    public getNodeById(id: string): any {
        return this._nodes[id];
    }


    public getNodes(): any {
        return this._nodes;
    }

    public loadLayout(xmlFile, rootNode, callback): void {
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

