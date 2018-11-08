var rpt = document.getElementById('repeater');
var field = document.getElementById('field');
var gamecont =document.getElementById('gamecont'); 
var MAX_SIZE = 50;
var MAX_MINES = 999;
var to = {
    '1': '1',
    '2': '1.5',
    '3': '2'
}
var classes = {
    '*': 'bomb',
    '0': 'n0',
    '1': 'n1',
    '2': 'n2',
    '3': 'n3',
    '4': 'n4',
    '5': 'n5',
    '6': 'n6',
    '7': 'n7',
    '8': 'n8',
    '9': 'n9'
};
    (function () {

        window.addEventListener("resize", resizeThrottler, false);

        var resizeTimeout;

        function resizeThrottler() {
            // ignore resize events as long as an actualResizeHandler execution is in the queue
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(function () {
                    resizeTimeout = null;
                    actualResizeHandler();

                    // The actualResizeHandler will execute at a rate of 15fps
                }, 100);
            }
        }

        function actualResizeHandler() {
            // handle the resize event
            resetBackground();
        }

    }());


var currentScale = 1;
var currentDiff = 'B';
var currentAlign = 'C';

var data = {
    'B': [9,9,10],
    'I':[16,16,40],
    'E':[30,16,99],
}

function removeElementsByClass(className) {
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
function addElement(cls, clsname, id) {
    var newDiv = document.createElement("div");
    newDiv.setAttribute('class', cls);
    if (id) {
        newDiv.setAttribute('id', id);
    }
    if (clsname) {
        newDiv.className += ' ' + clsname;
    }
    field.appendChild(newDiv);
    return newDiv;
}

function resetBackground() {
    removeElementsByClass('repeatb');
    setbackground();
}

var minesweeper = function (x, y, mines) {
    this.width = Math.min(MAX_SIZE,x);
    this.height =  Math.min(MAX_SIZE,y);
    this.mines = Math.min(MAX_MINES,mines);
    this.removedWidth = x - 6;
    this.totalWidth = (x - 6) * 16 + 116;
    this.removeFaceWidth = 98;
    this.totalH = 62 + y * 16;
    this.arr = [];
    this.flagged = {};
    this.arrc = [];
    this.gameOver = false;
    this.fvisit = [];
    this.neg = [];
    this.openBoxCount = 0;
    this.startTime = Date.now();
    this.time = 0;
    this.timer =null;
    this.time_h = null;
    this.time_t = null;
    this.time_o = null;

    this.addFace = function () {
        var del = this.totalWidth - 98;
        var ret = addElement('face', null, 'faceid');
        var mleft = Math.floor((this.totalWidth - 98 - 26 - 12) / 2);
        ret.style.marginLeft = ret.style.marginRight = mleft + 'px';
        ret.style.height = '26px';
    }
    this.createRow = function (col) {
        addElement('bdc');
        // add sq
        var sq = null;
        for (var i = 0; i < this.width; i++) {
            sq = addElement('sq', 'blank');
            sq.id = '' + col + '_' + (i + 1);
        }
        addElement('bdc');
    }
    this.createBorders = function () {
        addElement('bd-cr');
        for (var i = 0; i < this.width; i++) {
            addElement('bd-nm');
        }
        addElement('bd-crr');
        addElement('bd-l_long');
        var padded = '' +pad(this.mines,3);
        var output = [];
        for (var i = 0, len = padded.length; i < len; i += 1) {
            output.push(+padded.charAt(i));
        }
        addElement('t' + output[0], 't', 'm_h');
        addElement('t'+ output[1], 't', 'm_t');
        addElement('t'+ output[2], 't', 'm_o');

        this.addFace();
        gamecont.style.width = this.totalWidth + 'px';
        field.style.height = this.totalH + "px";
        field.style.width = this.totalWidth + "px";
        addElement('t0', 't', 'c_h');
        addElement('t0', 't', 'c_t');
        addElement('t0', 't', 'c_o');
        addElement('bd-l_long');
        addElement('bjointl');
        for (var i = 0; i < this.width; i++) {
            addElement('btb');
        }
        addElement('bjointr');
        for (var i = 0; i < this.height; i++) {
            this.createRow(i + 1);
        }
        addElement('bbl');
        for (var i = 0; i < this.width; i++) {
            addElement('bd-nm');
        }
        addElement('bbr');

    };
    this.initArr = function () {
        for (var j = 0; j < this.height; j++) {
            this.arr[j] = new Array(this.width);
            for (var i = 0; i < this.width; i++) {}
        }
    }
    this.addMines = function () {
        var mines = this.mines;
        var minesPlaced = 0;
        while (minesPlaced < mines) {
            var x = Math.floor(Math.random() * this.width);
            var y = Math.floor(Math.random() * this.height);
            if (this.arr[y][x] != '*') {
                this.arr[y][x] = '*';
                minesPlaced++;
            }
        }
    }
    this.showWinner = function(){
        var face = document.getElementById('faceid');
        face.className = 'facew';
        this.gameOver = true;
        var time = Date.now() - this.startTime;
        console.log('dt:'+ time/1000);
        if(this.timer){
            clearInterval( this.timer);
            this.timer= null;
        }
    };
    this.initgame = function () {
        var index = 0;
        var innerIndex = -1;
        this.initArr();
        this.addMines();
        var nearIndex = new Array(8);
        var minesCount = 0;
        var row = 0;
        var col = 0;
        for (var j = 0; j < this.height; j++) {
            for (var i = 0; i < this.width; i++) {
                index = j * this.width + i;
                if (this.arr[j][i] == "*") {
                    continue;
                }
                nearIndex[1] = index - this.width;
                nearIndex[0] = nearIndex[1] - 1;
                nearIndex[2] = nearIndex[1] + 1;
                nearIndex[3] = index - 1;
                nearIndex[4] = index + 1;
                nearIndex[6] = index + this.width;
                nearIndex[5] = nearIndex[6] - 1;
                nearIndex[7] = nearIndex[6] + 1;
                this.arr[j][i] = 0;
                for (var k = 0; k < nearIndex.length; k++) {
                    innerIndex = nearIndex[k];
                    row = Math.floor(innerIndex / this.width);
                    col = innerIndex % this.width;
                    if(Math.abs(row - j)>1 || Math.abs(col - i)>1 || innerIndex<0){
                        continue;
                    }
                    if (row>=0 && col>=0 && row<this.height && col<this.width && this.arr[row][col] == "*") {
                        minesCount++;
                    }
                }
                this.arr[j][i] = minesCount;         
                minesCount = 0;
            }
        }
        this.arrc = this.arr.slice();
    };

    this.showGame = function () {
        var id = '';
        var el = null;
        var className = '';
        for (var j = 0; j < this.height; j++) {
            for (var i = 0; i < this.width; i++) {       
                id = (j + 1) + '_' + (i + 1);
                el = document.getElementById(id);
                className = classes['' + this.arr[j][i]];  
                el.className += ' ' + className;
            }
        }
    };
    this.faceo = function(){
        if( this.gameOver){
            return;
        }
        var face = document.getElementById('faceid');
        face.classList.remove('face');
        face.classList.remove('facew');
        face.classList.add('faceo');
    }
    this.openBox = function(value,el,row,col){
        // if(!this.arrc[row][col]){
        //     return;
        // }
        var classname = classes[''+value];
        if(el.classList.contains('blank')){
            this.openBoxCount++;
        }
        el.classList.remove('blank');
        el.classList.add(''+ classname);
        var total = this.width*this.height;
        var del = total - this.openBoxCount;
        if(del== this.mines){
            console.log('winner');
           this.showWinner();
        }
      //  this.arrc[row][col] = null;
    };

    this.openMine = function(value,el){
        var classname = classes[''+value];
        el.classList.remove('blank');
        el.classList.add(''+ classname);
    }
    this.deadfn  = function(){
        var face = document.getElementById('faceid');
        face.className ='faced';
    };
    this.openNearMine = function(row,col,index){
        if(this.neg.indexOf(index)>=0){
            return;
        }
        this.neg.push(index);
        var val = this.arr[row][col];
        var el = document.getElementById('' +  (row+1) + '_' + (col+1) );
        this.openBox(val,el,row,col)
    }
    this.flood = function  (index,row,col){
        var innerIndex = 0;
        var nearIndex = new Array(8);
        nearIndex[1] = index - this.width;
        nearIndex[0] = nearIndex[1] - 1;
        nearIndex[2] = nearIndex[1] + 1;
        nearIndex[3] = index - 1;
        nearIndex[4] = index + 1;
        nearIndex[6] = index + this.width;
        nearIndex[5] = nearIndex[6] - 1;
        nearIndex[7] = nearIndex[6] + 1;
        if(this.fvisit.indexOf(index)>=0 || row>=this.width || row<0 ||  col<0 ||col>=this.height){
          return;
        }
        for(var i=0;i<nearIndex.length;i++){
            var __row = Math.floor( nearIndex[i] / this.width);
            var __col =  nearIndex[i] % this.width;
            if(__row>=0 && __row<this.height && __col>=0 && __col<this.width && Math.abs(__row - row)<=1 && Math.abs(__col - col)<=1){
                if(this.arr[__row][__col]== '*'){
                   return;
                }
                this.openNearMine(__row,__col,nearIndex[i]);
               
            }
        }
        this.fvisit.push(index);
        var val = this.arr[row][col];
        var class_ = classes[''+val];
       var el = document.getElementById('' +  (row+1) + '_' + (col+1) );
       if(el.classList.contains('blank')){
        this.openBoxCount++;
    }
       el.classList.remove('blank');
       el.classList.add(''+ class_);
       

        for(var i=0;i<nearIndex.length;i++){
            innerIndex = nearIndex[i];
            var _row = Math.floor(innerIndex / this.width);
            var _col = innerIndex % this.width;
            if(Math.abs(_row - row)<=1 && Math.abs(_col - col)<=1){
                this.flood(innerIndex,_row,_col)
            }
        }

    }
    this.timerActive = function(){
        this.time++;
        if(this.time<10){
            this.time_o.className = 't t' + this.time;
            this.time_h.className = 't0 t';
            this.time_t.className = 't0 t';
        }else if(this.time<99){
            var t1 = (''+ this.time)[0];
            var t2 = (''+ this.time)[1];
            this.time_o.className = 't t' + t2;
            this.time_h.className = 't t';
            this.time_t.className = 't t' + t1;
        }else if(this.time<1000){
            var t1 = (''+ this.time)[0];
            var t2 = (''+ this.time)[1];
            var t3 = (''+ this.time)[2];
            this.time_o.className = 't t' + t3;
            this.time_h.className = 't t' + t1;
            this.time_t.className = 't t' + t2;
        }

    }
    this.startTimer = function(){
        var self = this;
        if(this.timer==null){
            this.timer = setInterval(function(){
                self.timerActive();
            },1000);
        }
    };
    this.clicked = function(el,event){
        console.log(event.button);
        if(this.dead || event.button!==0){
            return;
        }
        console.log('c');
        var id =el.id;
        var item =(''+ id).split('_');
        var row = +item[0];
        var col = +item[1];
        var value = this.arr[row-1][col-1];
        var   index = (row-1) * this.width + (col-1);
        if(this.flagged[index]){
            return;
        }
        this.startTimer();
        if(value == '*'){
          this.dead = true;
          if(this.timer){
              clearInterval( this.timer);
              this.timer= null;
          }
          this.deadfn();
          this.openMine(value,el);
        }else if(value == '0'){
             index = (row-1) * this.width + (col-1);
            this.fvisit = [];
            this.flood(index,row-1,col-1);
        }else{
            var   index = (row-1) * this.width + (col-1);
            this.openBox(value,el,row,col);
            this.faceo();
        }
      
    };
    this.clickedUp = function(el){
        if(this.dead || this.gameOver){
            return;
        }
        var face = document.getElementById('faceid');
        face.classList.remove('faceo');
        face.classList.add('face');
    };
    this.faceClicked = function(el){
        el.classList.remove('face');
        el.classList.remove('faced');
        el.classList.add('facep');
    }
    this.rclicked = function(el){
        console.log('x');
        if(this.dead){
            return;
        }
        var id =el.id;
        var item =(''+ id).split('_');
        var row = +item[0];
        var col = +item[1];
        var value = this.arr[row-1][col-1];
        var   index = (row-1) * this.width + (col-1);
        if(this.flagged[''+ index]){
            el.classList.remove('fl');
            el.classList.add()
            delete this.flagged[''+ index];
        }else{
            this.flagged[''+ index] = 1;
        }
        return false;
    }
    this.addEvents = function  (){
        var self = this;
        this.time_h = document.getElementById('c_h');
        this.time_t = document.getElementById('c_t');
        this.time_o = document.getElementById('c_o');
        var _id = document.getElementById('faceid');
        _id.addEventListener('mousedown', function(){
            self.faceClicked(this); 
         }, false);
         _id.addEventListener('mouseup', function(){
            faceClickedUp(this); 
         }, false);

        var classname = document.getElementsByClassName("sq");
        for (var i = 0; i < classname.length; i++) {
            classname[i].addEventListener('mousedown', function(event){
               self.clicked(this,event); 
            }, false);
            classname[i].addEventListener('mouseup', function(){
                self.clickedUp(this); 
             }, false);
            classname[i].addEventListener('contextmenu', function(event){
                 self.rclicked(this); 
                 event.preventDefault();
                 return false;

             }, false);
        }
    };
    this.createField = function () {
        this.createBorders();
        this.initgame();
        this.addEvents();
      //   this.showGame();
    };
    this.createField();
};
var game = null;
function  faceClickedUp(el){
    var doc = document.getElementById('field');
    el.classList.remove('facep');
    el.classList.add('face');
    doc.innerHTML = "";
     game = null;
     this.openBoxCount = 0;
     this.neg = [];
     this.gameOver= false;
     this.dead = false;
     this.startTime = Date.now();
     var diff = currentDiff || 'B';
     var currAlign = currentAlign || 'C';
     var currentScale_ =  currentScale || '1';
     console.log(currentAlign);
     game =createGameWithDiff(diff,currentScale_,currAlign);
     console.log('created game');
     console.log(game);
   
};
function alignGame(a){
    if(a=='L'){
        gamecont.style.marginLeft = '75px';
    }else if(a=='R'){
        gamecont.style.marginLeft = null;
        gamecont.style.marginRight = '0px';
    }else if(a=='C'){
        gamecont.style.marginRight = null;
        gamecont.style.marginLeft = null;

    }
};
function createGameWithDiff(v,s,a){
    field.innerHTML = "";
    if(v=='B'){    
        game = new minesweeper(9,9,10);
    }else if(v=='I'){
        game = new minesweeper(16,16,40);
    }else if(v=='E'){
        game = new minesweeper(30,16,99);
    }
    else if(v=='custom'){
        var xs =  window.store.get('cx') || 20;
        var ys = window.store.get('cy') || 20;
        var mines = window.store.get('mines') || 20;
        game = new minesweeper(xs,ys,mines);
    }
    gamecont.style.width = game.totalWidth*to[''+ s] + 'px';
    gamecont.style.height = game.totalH*to[''+ s] + 'px';
    var scale = 'scale(' + to[''+ s] + ')';
    field.style.transform = scale; 
    a = a|| 'C';
    alignGame(a);
    return game;
}

function radioChange(myRadio) {

    var v = myRadio.value;
    var to = {
        '1': '1',
        '2': '1.5',
        '3': '2'
    }
   
    if(v == '1' || v== '2'|| v=='3'){  
    var oldZoomVal = currentScale;
        currentScale = v;
        var scale = 'scale(' + to[''+ v] + ')';
        field.style.transform = scale; 
        window.store.set('zoom',v);
        if(game && oldZoomVal!== currentScale){
            var nw = game.totalWidth* (+to[''+ currentScale]);
            var hh = parseInt(field.style.height)* (+to[''+ currentScale]);
            gamecont.style.height = hh + 'px';
          gamecont.style.width = nw + 'px';
            console.log('diff scale:' + hh);
        }
        else if(!game){
            console.log('no tgame');
        }
    }
    else if(v=='B' || v=='I' || v== 'E' || v=='custom'){
        game = null;
        var _currentAlign = currentAlign || 'C';
        currentDiff = v;
        currentScale = currentScale || '1';
        window.store.set('diff',v);
        createGameWithDiff(currentDiff,currentScale,_currentAlign);
    }
   
    else if(v=='C' || v=='L' || v=='R' && game){
        window.store.set('align',v);
        currentAlign = v;
            alignGame(v);
    }
    console.log(v);
}


function setbackground() {
    var rpt = document.getElementById('repeater');

    var ww = window.innerWidth;
    var wh = window.innerHeight;
    var imgSize = 64;
    var imgCount_x = Math.ceil(ww / imgSize);
    var imgCount_y = Math.ceil(wh / imgSize);
    var pos = [0, 0];
    var div = null;
    for (var x = 0; x < imgCount_x; x++) {
        pos[0] = 64 * x;
        for (var y = 0; y < imgCount_y; y++) {
            pos[1] = 64 * y;
            div = document.createElement("div");
            div.setAttribute('class', 'repeatb');
            div.style.left = pos[0] + "px";
            div.style.top = pos[1] + "px";
            rpt.appendChild(div);
        }
    }
};

setbackground();






window.store = {
    localStoreSupport: function () {
      try {
        return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
        return false;
      }
    },
    set: function (name, value, days) {
      var expires;
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }
      if (this.localStoreSupport()) {
        localStorage.setItem(name, value);
      } else {
        document.cookie = name + "=" + value + expires + "; path=/";
      }
    },
    get: function (name) {
      if (this.localStoreSupport()) {
        var ret = localStorage.getItem(name);
        //console.log(typeof ret);
        switch (ret) {
          case 'true':
            return true;
          case 'false':
            return false;
          default:
            return ret;
        }
      } else {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        var ret2;
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) {
            ret2 = c.substring(nameEQ.length, c.length);
            switch (ret2) {
              case 'true':
                return true;
              case 'false':
                return false;
              default:
                return ret2;
            }
          }
        }
        return null;
      }
    },
    del: function (name) {
      if (this.localStoreSupport()) {
        localStorage.removeItem(name);
      } else {
        this.set(name, "", -1);
      }
    }
  };

  (function getLocalData(){
    var diff =  window.store.get('diff');
      var zoom = window.store.get('zoom');
      var align = window.store.get('align');
      currentScale = '1';
      currentDiff = 'B';
      currentAlign = 'C';
      if(diff && (diff == 'B' || diff== 'I' || diff=='E') ){
          currentDiff = diff;
      }
      if(zoom && (zoom == '1' || zoom== '2' || zoom=='3') ){
          currentScale = zoom;
      }
      if(align && (align=='C' || align=='L' || align=='R')){
          currentAlign = align;
      }
      createGameWithDiff(currentDiff,currentScale,currentAlign);
  })();
