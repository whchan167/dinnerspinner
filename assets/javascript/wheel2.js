var myFColors = ['#b9a998', '#103787', '#46c304', '#f27c0d', '#f3131b', '#0673e6'];
var mySColors = ['#bFbFbF', '#3F3FbF', '#7FfF3F', '#fF7F3F', '#fF3F3F', '#3F7FfF'];
var myTColors=  ['#f3131b', '#f27c0d', '#f3131b', '#103787', '#46c3d4', '#fbd90c'];

var nbrWedges = 24;
var iRadius=80;
var oRadius=275;
var INITVA = 0.17;
var DAMPING = 0.985;
var MAGNET = .0125;
var rotation = 0;
var angularVelocity = 0;
var bgImg;
var wedges = [];
var crankImg;
var curSlot = -1;
var lastSlot = -1;
var slowTrigger = false;
var slowTriggerStart;
var starTiles;
var starHeight = 18;
var drinkNames = /(bar|bars|tavern|drink|drinks|beer|pub|saloon)/i;
var isDrinking = myQuery != '' && myQuery.search(drinkNames) > 0;
var clickSnd = null;
var isLoaded = false;
var isDragging = false;

function myconsolelog(msg) {
    // console.log(msg);
}

function preload() {
    bgImg = loadImage(isDrinking? "assets/hub_bg_bar.png" : "assets/hub_bg.png");
    crankImg = loadImage("assets/crank1.png");
    starTiles = loadImage("assets/startiles.png");
    if (!isMute) {
      try {
        clickSnd = loadSound(["assets/click3.mp3","assets/click3.ogg"]);
      } catch (err) {
        clickSnd = null;
        isMute = true;
      }
    }
    $("#wheeler").html('');
}

var cannedWedges = [{nom:'SKIP LUNCH', fColor:'#000', sColor:'#444', tColor:'#FFF', special:true, tScale:1.0},
                    {nom:'SPIN AGAIN!', fColor:'#FF0', sColor:'#FF0', tColor:'#000', special:true, tScale:1.0},
                    {nom:'INVITE ONE MORE', fColor:'#000', sColor:'#444', tColor:'#FFF', special:true, tScale:0.8},
                    {nom:'SPIN AGAIN!', fColor:'#FF0', sColor:'#FF0', tColor:'#000', special:true, tScale:1.0},
                    {nom:'VENDING MACHINE!', fColor:'#FF0', sColor:'#FF0', tColor:'#000', special:true, tScale:0.8}];

function preloadWedges() {
  preloadStrings = ["Burgers","Boring Salad","비빔밥 Bimbimbap","Taco Truck","Chinese",
                    "Indian Buffet","Hipster Food Truck","That Hole-in-the-wall","Drive-thru","Brew-pub",
                    "Ice Cream?","Thai Food","Delicatessen","Sub shop","Pizza",
                    "Ramen","Fish + Chips + Beer","Sushi","Phở","50's Diner",
                    "BBQ Joint","Panini","Food Court","Shawarma"]
  wedges = [];
  var wi = 0;
  for (var i = 0, l = preloadStrings.length; i < l; i++ ) {
     var cIdx = i % myFColors.length;
     tScale = 1;
     var nom = preloadStrings[i];
     var wd = textWidth(nom);
     var labelWid = (oRadius-iRadius)-18;
     if (wd > labelWid) {
        tScale = labelWid/wd;
     }

     wedges.push({nom:preloadStrings[i], fColor:myFColors[cIdx], 
                 sColor:mySColors[cIdx], tColor:myTColors[cIdx], special:true, tScale:tScale});
     if (i % 5 == 0) {
       wedges.push(cannedWedges[wi]);
       wi += 1;
     }
  }
}

function loadWedges(wheelData) {
  var businesses = wheelData['businesses'];
  nbrBiz = Math.min(25,businesses.length);
  wedges = [];
  var wi = 0;
  for (var i = 0, l = nbrBiz; i < l; i++ ) {
    var cIdx = i % myFColors.length;
    var biz = businesses[i];

    tScale = 1;
    var wd = textWidth(biz['name']);
    var labelWid = (oRadius-iRadius)-18;
    if (wd > labelWid) {
        tScale = labelWid/wd;
    }
    var nom = biz['name'];

    wedges.push({'nom':nom,fColor:myFColors[cIdx], 
                 sColor:mySColors[cIdx], tColor:myTColors[cIdx], 
                 address:biz.location.display_address[0],
                 reviews:biz.review_count,
                 rating:biz.rating,
                 rec:biz,
                 url:biz.url,
                 special:false, tScale:tScale});
    if (i % 5 == 0) {
      wedges.push(cannedWedges[wi]);
      wi += 1;
    }
  }
  isLoaded = true;
}

function doQuery() {
  var url = 'yelpProxyJSON.php?zip=' + myZip + '&query=' + myQuery + '&radius=' + myRadius;
  if (myLat != '' && myLon != '') {
    url += '&lat=' + myLat + '&lon=' + myLon;
  }
  $.ajax({
    dataType:"json",
    url:url,
    error: function(jqXHR, textStatus, errorThrown) {
        myconsolelog("JSON Error: " + textStatus);
    },
    success: function(data) {
        myconsolelog("Success...");
        loadWedges(data);
        startCranking(INITVA);
        myconsolelog("Started cranking");
    }
  });
}

function startCranking(initVA) 
{
    slowTrigger = false;
    angularVelocity = initVA;
    rotation = random(TWO_PI);
    curSlot = -1;
}

function setup() {
  var mycanvas = createCanvas(700, 700);
  mycanvas.parent('canvasContainer');
  smooth();

  textSize(24);

  preloadWedges();

  frameRate(24);
  if (!isMute)
    clickSnd.setVolume(.3);
  if (myZip != '')
      doQuery();
}

function doPhysics() {
  var nbrWedges = wedges.length;
  var wedgeAngle = 2*PI/nbrWedges;
  curSlot = (nbrWedges-Math.floor((rotation+wedgeAngle/2)/wedgeAngle)) % nbrWedges;
  rotation += angularVelocity;

  if (rotation > TWO_PI)
    rotation -= TWO_PI;

  var da = TWO_PI-curSlot*wedgeAngle;
  var delta = da - rotation;
  if (delta > PI)
    delta -= TWO_PI;
  if (delta < -PI)
    delta += TWO_PI;
  if (!isDragging) {
    angularVelocity += delta*MAGNET;
    angularVelocity *= DAMPING;
  }
  if (curSlot != lastSlot) {
    if (!isMute) {
      clickSnd.playMode('sustain');
      clickSnd.play();
    }
    lastSlot = curSlot;
  }
}

function drawWheel() {
  var nbrWedges = wedges.length;
  var wedgeAngle = 2*PI/nbrWedges;
  var tAngle = -wedgeAngle/2;
  var bAngle = wedgeAngle/2;
  var textCenterX = (iRadius+oRadius)/2;
  textAlign(CENTER,CENTER);
  textSize(24);

  if (!slowTrigger && angularVelocity < .001) {
    slowTrigger = true;
    slowTriggerStart = millis();    
  }

  for (var i = 0; i < nbrWedges; ++i) {
    var biz = wedges[i];
    if (i == curSlot) {
        fill('#FFF');
        stroke('#FFF');
    } else {
        fill(biz.fColor);
        stroke(biz.sColor);
    }
    push();
        rotate(wedgeAngle*i);
        strokeWeight(4);
        beginShape();
        vertex(cos(tAngle)*iRadius,sin(tAngle)*iRadius);
        vertex(cos(tAngle)*oRadius,sin(tAngle)*oRadius);
        vertex(cos(bAngle)*oRadius,sin(bAngle)*oRadius);
        vertex(cos(bAngle)*iRadius,sin(bAngle)*iRadius);
        endShape(CLOSE);
        strokeWeight(1);
        var tScale = biz.tScale;
        if (i == curSlot) {
            fill('#000');
            if (slowTrigger) {
                tScale += (sin(millis()*.002) * 0.2) * constrain(map(millis()-slowTriggerStart,0,2000,0,1),0,1);
            }
        } else {
            fill(biz.tColor);
            stroke(biz.tColor);
        }
        push();
            translate(textCenterX,0);
            scale(tScale);
            text(biz.nom,0,0);
        pop();
        rotate(bAngle);
        image(crankImg, oRadius,-crankImg.height/2);
    pop();
  }
}

var lastVelocity;

function mouseDragged() {
    newVelocity = atan2(mouseY-height/2,mouseX-width/2) - atan2(pmouseY-height/2,pmouseX-width/2);
    if (!isDragging) {
      isDragging = true;
      lastVelocity = newVelocity;
      slowTrigger = false;
    }
    angularVelocity = (newVelocity + lastVelocity)/2;
}

function mouseClicked() {
    if (mouseX < 200 && mouseY < 200 && curSlot >=0 && 'url' in wedges[curSlot]) {
        window.open(wedges[curSlot].url);
    }
}

function mouseReleased() {
  isDragging = false;
  slowTrigger = false;
}

function touchMoved() {
    newVelocity = atan2(touchY-height/2,touchX-width/2) - atan2(ptouchY-height/2,ptouchX-width/2);
    if (!isDragging) {
      isDragging = true;
      lastVelocity = newVelocity;
      slowTrigger = false;
    }
    angularVelocity = (newVelocity + lastVelocity)/2;
}

function touchEnded() {
    if (touchX < 200 && touchY < 200 && curSlot >=0 && 'url' in wedges[curSlot]) {
        window.open(wedges[curSlot].url);
    }
    isDragging = false;
    slowTrigger = false;
}

function draw() {
  // draw stuff here
  background(255);
  push();
    translate(width/2, height/2);
    image(bgImg,-bgImg.width/2, -bgImg.height/2);
    push();
      rotate(rotation);
      drawWheel();
    pop();
  pop();

  if (curSlot >= 0) {
    push();
    var topMargin = 40;
    var lineHeight = 22;
    translate(width/2-340,0);
    fill('#071f9e');
    noStroke();
    textAlign(LEFT,BASELINE);
    textStyle(BOLD);
    text(wedges[curSlot].nom,0,topMargin);
    textStyle(NORMAL);
    textSize(18)
    if (!wedges[curSlot].special) {
        text(wedges[curSlot].address,0,topMargin+lineHeight*1);
        var py = int(wedges[curSlot].rating*starHeight*2);
        copy(starTiles, 0, py, starHeight*5, starHeight, 0, topMargin+lineHeight*2-14, starHeight*5, starHeight);
        text(wedges[curSlot].reviews + " reviews",0,topMargin+lineHeight*3);
        text("(more...)",0,topMargin+lineHeight*4);
    }
    fill('#6dd0fd');
    // !! this stuff should go elsewhere....
    textAlign(RIGHT,BASELINE);
        text("Grab the wheel",680,topMargin);
        text("and give it",680,topMargin+lineHeight*1);
        text("a spin!",680,topMargin+lineHeight*2);
    pop();

  }
  doPhysics();
}