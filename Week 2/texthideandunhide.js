function myFunction() {
    var x = document.getElementById("bulb");
    var y = document.getElementById("demo");

    if (x.src.match("pic_bulboff")) {
        x.src = "img/pic_bulbon.gif";

    } else {
        x.src = "img/pic_bulboff.gif";
    }
    
    if (y.style.display === "none") {
        y.style.display = "block";

    } else {
        y.style.display = "none";
    }

}

