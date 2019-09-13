# GUILoader
XML GUILoader for BabylonJS


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

**Dynamic Attributes**

It is possible to add dynamic attributes to your XML layouts. These attributes can either be class attributes or global variables. The following is how to call a global variable.

```
<?xml version="1.0"?>

<root>
    <Rectangle verticalAlignment="Control.HORIZONTAL_ALIGNMENT_TOP" background="blue" id="popupContainer" width=".8" name="firstContainer" height=".4" color = "Orange"  > 
        <InputText id="inputText1" width="{{textWidth}}" maxWidth = "0.3"  height = "40px" color = "white"/> 
        <Button id = "helloButton"   width = "0.2" verticalAlignment="Control.VERTICAL_ALIGNMENT_BOTTOM" height = "0.2" name = "helloButton" background="green" onPointerUpObservable = "storeUsernameEvent" > 
            <TextBlock  text = "Store Input" color = "white" /> 
        </Button>
    </Rectangle> 
</root>

```

By wrapping the attributes value with `{{}}`, they get the value of the class attributes or global variables with that name. 

**Array and Objects iterations from XML**

It is also possible to iterate a structure like an Array or Object directly from XML. This would be handy for example in the case we may need to fill a StackPanel from a source. Even though the most natural usecase would be a stackpanel, this can be used whenever we need to repeat a specific xml block by filling in values from An Array or an Object.

Let's suppose we have the following object in your javascript :

```
var objTexts = {
        first: {
            name: "john",
            surname: "smith"
        },
        second: {
            name: "ben",
            surname: "Stiller"
        },
       };
```
Let's also suppose the following list retains the users of your application and you may want to show them listed in the GUI. This would be possible JS side but this would mean copying the control over and over again. GUILoader makes it much more easier and cleaner directly from XML. This would be how you iterate the aforementioned structure :

 ```
  <StackPanel background="#ffffff" width = "300px" top="100px" left="200px" id = "panel" dataSource="text in {objTexts}"> 
        <Container  width="1" height="40px" >
            <TextBlock  height = "1"  text = "{{text.name}}" color = "red" resizeToFit="true" fontSize = "24"/>  
            <TextBlock  left="50px" height = "1"  text = "{{text.surname}}" color = "black" resizeToFit="true" fontSize = "24"/>  
        </Container>
   </StackPanel>
 ```

The source is associated to the StackPanel by using the dataSource attribute. The dataSource attribute should always have 3 values in it, the variable name, the keyword "in" and structure name. For an object structure the name must be wrapped in curly brackets like the example above. For an array structure the name can be wrapped up in normal brackets but it is not mandatory. When the dataSource is an array it can be written as `dataSource="text in [objTexts]` or simply `dataSource="text in objTexts"`

The variable part of the dataSource attribute is how you access the source values. Notice in the above example the section `text = "{{text.surname}}"` is how you set a value from the source to your XML. 

**Implemented Observables**

All the Observables should be working and functional. Please do a bug report if they do not work. 
