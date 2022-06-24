function betShow() {
    document.getElementById("overlay-bet").style.display = "block";
  }
  
  function betHide() {
    document.getElementById("overlay-bet").style.display = "none";
  }

  function looseShow() {
    document.getElementById("overlay-loose").style.display = "block";
  }
  
  function looseHide() {
    document.getElementById("overlay-loose").style.display = "none";
  }
 
  function winShow() {
    document.getElementById("overlay-win").style.display = "block";
  }
  
  function winHide() {
    document.getElementById("overlay-win").style.display = "none";
  }

  function hideAllOverlays(){
    betHide();
    looseHide();
    winHide();
  }

