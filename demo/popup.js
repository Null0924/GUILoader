function Popup(advancedTexture) {

    this.guiLoader = new GUILoader(this);
    this.loaded = false;
    this.textWidth = "50px";
    var _this = this;
    
    this.storeUsernameEvent = function() {
        console.log("event");
        console.log(_this.guiLoader.getNodeById("inputText1").text);
        _this.guiLoader.getNodeById("inputText1").text = "";
        _this.guiLoader.getNodeById("popupContainer").isVisible = false;
    }

    this.load = function() {
        if(!_this.loaded) {
            this.guiLoader.loadLayout("layouts/popup.xml", advancedTexture, function() {
                _this.loaded = true;
            });
        } else {
            _this.guiLoader.getNodeById("popupContainer").isVisible = true;
        }
    }

    

}