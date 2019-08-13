var GUILoader = /** @class */ (function () {
    function GUILoader() {
        this._nodes = {};
        this._this = this;
        this._nodeTypes = {
            element: 1,
            attribute: 2,
            text: 3
        };
        this._objectAttributes = {
            "textHorizontalAlignment": 1,
            "textVerticalAlignment": 2,
            "horizontalAlignment": 3,
            "verticalAlignment": 4,
            "stretch": 5,
        };
        this._events = {
            "onPointerClickObservable": 1,
            "onPointerMoveObservable": 2,
            "onPointerUpObservable": 3,
            "onPointerOutObservable": 4,
            "onClipboardObservable": 5,
            "onPointerDownObservable": 6,
            "onPointerEnterObservable": 7
        };
    }
    GUILoader.prototype._xmlResponse = function (xml, rootNode, onLoadCallback) {
        if (!xml.responseXML) {
            throw "GUILoader Exception : XML file is malformed or corrupted.";
        }
        var xmlDoc = xml.responseXML.documentElement;
        this._parseXml(xmlDoc.firstChild, rootNode);
        onLoadCallback();
    };
    GUILoader.prototype._createGuiElement = function (node) {
        try {
            var NewGUINode = eval("BABYLON.GUI." + node.nodeName);
            var guiNode = new NewGUINode();
            for (var i = 0; i < node.attributes.length; i++) {
                if (this._events[node.attributes[i].name]) {
                    guiNode[node.attributes[i].name].add(eval(node.attributes[i].value));
                    continue;
                }
                if (!this._objectAttributes[node.attributes[i].name]) {
                    guiNode[node.attributes[i].name] = node.attributes[i].value;
                }
                else {
                    guiNode[node.attributes[i].name] = eval("BABYLON.GUI." + node.attributes[i].value);
                }
            }
            if (!node.attributes.getNamedItem("id")) {
                this._nodes[node.nodeName + Object.keys(this._nodes).length + "_gen"] = guiNode;
                return guiNode;
            }
            if (!this._nodes[node.attributes.getNamedItem("id").nodeValue]) {
                this._nodes[node.attributes.getNamedItem("id").nodeValue] = guiNode;
            }
            else {
                throw "GUILoader Exception : Duplicate ID, every element should have an unique ID attribute";
            }
            return guiNode;
        }
        catch (e) {
            throw "GUILoader Exception : Error parsing Control " + node.nodeName + ".";
        }
    };
    GUILoader.prototype._parseGrid = function (node, guiNode, parent) {
        var width;
        var height;
        var columns;
        var rows = node.childNodes;
        var cells;
        var isPixel = false;
        var cellNode;
        var rowNumber = -1;
        var columnNumber = -1;
        var totalColumnsNumber = 0;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].nodeType != this._nodeTypes.element) {
                continue;
            }
            if (rows[i].nodeName != "Row") {
                throw "GUILoader Exception : Expecting Row node, received " + rows[i].nodeName;
            }
            rowNumber += 1;
            columns = rows[i].childNodes;
            if (!rows[i].attributes.getNamedItem("height")) {
                throw "GUILoader Exception : Height must be defined for grid rows";
            }
            height = eval(rows[i].attributes.getNamedItem("height").nodeValue);
            isPixel = rows[i].attributes.getNamedItem("isPixel") ? eval(rows[i].attributes.getNamedItem("isPixel").nodeValue) : false;
            guiNode.addRowDefinition(height, isPixel);
            for (var j = 0; j < columns.length; j++) {
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
                cells = columns[j].childNodes;
                for (var k = 0; k < cells.length; k++) {
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
    };
    GUILoader.prototype._parseElement = function (node, guiNode, parent) {
        if (node.firstChild) {
            this._parseXml(node.firstChild, guiNode);
        }
        if (node.nextSibling) {
            this._parseXml(node.nextSibling, parent);
        }
    };
    GUILoader.prototype._parseXml = function (node, parent) {
        if (node.nodeType != this._nodeTypes.element) {
            if (node.nextSibling) {
                this._parseXml(node.nextSibling, parent);
            }
            return;
        }
        var guiNode = this._createGuiElement(node);
        if (parent) {
            parent.addControl(guiNode);
        }
        if (node.nodeName == "Grid") {
            this._parseGrid(node, guiNode, parent);
        }
        else {
            this._parseElement(node, guiNode, parent);
        }
    };
    GUILoader.prototype.getNodeById = function (id) {
        return this._nodes[id];
    };
    GUILoader.prototype.getNodes = function () {
        return this._nodes;
    };
    GUILoader.prototype.loadLayout = function (xmlFile, rootNode, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                this._xmlResponse(xhttp, rootNode, callback);
            }
        }.bind(this);
        xhttp.open("GET", xmlFile, true);
        xhttp.send();
    };
    return GUILoader;
}());
