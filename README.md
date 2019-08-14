# GUILoader
XML GUILoader for BabylonJS

**Demo**
https://null0924.github.io/GUILoader/

A library which loads BabylonJS GUI's from XML. It parses XML layouts into BabylonJS GUI elements and makes it possible to create layouts 
in an easy and structured way.

**GUI LOADER Class**

Download the GUILoader.js and include it in your project. 

then initialize the library like the following : 

```
var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
var GuiLoader = new GUILoader();
GuiLoader.loadLayout("layouts/testgui.xml", advancedTexture, null)
```
The GuiLoader might be used as part of a javascript class or function. In order for the class to correctly map observables with the class methods, it is necessary to provide the class object in the constructor. This would be how the GuiLoader would be initialized inside a class.


```
var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
var GuiLoader = new GUILoader(this);
GuiLoader.loadLayout("layouts/testgui.xml", advancedTexture, null)
```

This is what is needed to initialize and load a layout. The third parameter in the loadLayout function, is a callback which is called
once the layout has been parsed. in this moment it is possible to retrieve elements and add events to them. This would be an example
of how it would be called.

```
GuiLoader.loadLayout("layouts/testgui.xml", advancedTexture, function () {
    GuiLoader.getNodeById("helloButton").onPointerClickObservable.add(clickEvent);
});
```

After the layout has been loaded there is a couple of functions which can be used to manipulate the loaded elements. 

```
GuiLoader.getNodeById("helloButton") // Gets a node by ID. Similar to how DOM elements are retrieved.
GuiLoader.getNodes() // Gets all parsed nodes. 

```

**XML LAYOUTS**

The structure for an XML layout should be pretty straightforward. This is what a simple XML layout would look like 

```
<?xml version="1.0"?>
<root>
    <Rectangle verticalAlignment="Control.HORIZONTAL_ALIGNMENT_TOP" background="yellow" id="firstContainer" width=".8" name="firstContainer" height=".4" color = "Orange"  > 
        <Button id = "imageButton" width = "0.2" background="red" height = "0.3" name = "imageButton"> 
                <Image id="image" source="assets/icon.png" width = "1" height = "1" name="image" stretch = "Image.STRETCH_FILL" horizontalAlignment="Control.HORIZONTAL_ALIGNMENT_LEFT"  /> 
        </Button>  
    </Rectangle> 
</root>
```

The Controls names in the layouts follow rigorously the names in the BABYLON.GUI library. The same stands for the attributes as well. The
only usecase when this differs, is in the `Grid` element. This is what a Grid element looks like in the layout.

```
<Grid id="grid" name="grid" top="50px" background="black" height="200px" width="200px" >
        <Row height = "0.5" >
            <Column width = "0.2"> 
            </Column>
            <Column width = "0.5"> 
                <Rectangle id="1rect" thickness= "0" name="1rect" background = "green" ></Rectangle>
            </Column>
        </Row>
        <Row height = "0.5">
            <Column> 
            </Column>
            <Column> 
                <Rectangle id="2rect" thickness= "0" name="2rect" background = "red" ></Rectangle>
            </Column>
        </Row>
</Grid> 

```

The `Row` and `Column` are different from the normal way of doing them in BABYLON.GUI. The columns definitions are added in the first row. 
It is important to add all the columns in the first row as all the subsequent rows will have the same number of columns. 

After the first row, it is possible to add less columns. However, more is not permissable. The `width` and `height` attributes for Rows and Columns are mandatory. The isPixel attribute is mandatory if the width and height is in Pixels. 

**Implemented Observables**

The following are the current implemented observables for Controls :

```
onPointerClickObservable
onPointerMoveObservable
onPointerUpObservable
onPointerOutObservable
onClipboardObservable
onPointerDownObservable
onPointerEnterObservable
```
