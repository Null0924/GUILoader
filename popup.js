function Popup(advancedTexture) {

    this.guiLoader = new GUILoader(this);
    
    var _this = this;
    
    this.storeUsernameEvent = function() {
        console.log("event");
        _this.guiLoader.getNodeById("popupContainer").dispose();
    }

    this.guiLoader.loadLayout("layouts/popup.xml", advancedTexture, null);

}