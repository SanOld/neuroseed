window.onload = function () {



var screen_widget = (function(){
    function Widget (options){

        var buttons = options.hasOwnProperty("buttons") ? options["buttons"] : [];
        var fonts = options.hasOwnProperty("fonts") ? options["fonts"] : [];
        var speed = options.hasOwnProperty("active_link") ? options["active_link"].speed : 10;
        var background = options.hasOwnProperty("active_link") ? options["active_link"].background : "#000";

        speed = speed/100;

        var canvas;
        var ctx = null;

        var canvasOffsetX;
        var canvasOffsetY;
        var scene;

        var height = 1;
        var width = 1.5;
        var relation = 1;

        var rightButtons = [];
        var leftButtons = [];
        var tempLinksL = [];
        var tempLinksR = [];
        var nodes = [];
        var nodesRight = [];
        var messageBox;
        var OFFSET_X;
        var BUTTONS = [];
        var activeButton;

        var linksState = false;

        var ourCOLORS = {
            LASER_LEMON: "#FFFB6A",
            AQUAMARIN: "#7EFDB6",
            CYAN: "#00FFFF",
            BACKGROUND: "#000",
            NODE: "#fff",
            WHITE: "#eee",
            LINES_WIDTH: 1
        };

        var coord_x = [4.5, 2.85, 2.4, 2.4, 2.4, 2.4, 2.85, 4.5,
                       4.5, 2.85, 2.4, 2.4, 2.4, 2.4, 2.85, 4.5];
        var coord_y = [50, 140, 230, 320, 410, 500, 590, 680,
                       50, 140, 230, 320, 410, 500, 590, 680];
        if(buttons.length > 0){
            buttons.forEach(function(elem, i){
                elem.x = coord_x[i];
                elem.y = coord_y[i];
                BUTTONS.push(elem);
            })
        }

        var coordinatesNodes = {
            x: [],
            y: []
        };

        function init() {

            render();

            scene = new Scene();

            if (canvas && canvas.getContext) {

                ctx = canvas.getContext('2d');
                canvas.width = document.documentElement.clientWidth;
                canvas.height = document.documentElement.clientHeight;
                canvas.style.position = "fixed";
                canvas.style.top = 0;
                canvas.style.left = 0;

                canvasOffsetX = canvas.getBoundingClientRect().left;
                canvasOffsetY = canvas.getBoundingClientRect().top;

                var relation_h = canvas.height/height;
                var relation_w = canvas.width/width;

                relation = relation_h < relation_w ? relation_h : relation_w;
                var stepY = relation / (BUTTONS.length/2+1);
                var stepX = stepY * 0.8;

                height = height * relation;
                width = width * relation;

                OFFSET_X = canvas.width / 2;

                var hexagon = new Hexagon(
                    0 + OFFSET_X,
                    height / 2,//(BUTTONS[4].y + BUTTONS[3].y)
                    stepX * 1.2
                );

                coordinatesNodes.x = [
                    [0, 0.7, 2.4, 3.85],
                    [0, 0.7, 2.3, 4.1],
                    [hexagon.hexagonVertices[3].x, hexagon.hexagonVertices[2].x, 2.15, 4.1],
                    [hexagon.hexagonVertices[2].x, 2.1, 3.6, 4.6],
                    [hexagon.hexagonVertices[1].x, 2.1, 3.6, 4.6],
                    [hexagon.hexagonVertices[6].x, hexagon.hexagonVertices[1].x, 2.2, 3.8],
                    [hexagon.hexagonVertices[6].x, 0.7, 2.4, 3.6],
                    [hexagon.hexagonVertices[6].x, hexagon.hexagonVertices[6].x, 0, 1.4]
                ];
                coordinatesNodes.y = [
                    [2.8, 3, 2.3, 2.2],
                    [2.8, 3, 3, 3.15],
                    [hexagon.hexagonVertices[3].y, hexagon.hexagonVertices[2].y, 3.5, 3.15],
                    [hexagon.hexagonVertices[2].y, 4.4, 4.5, 4.2],
                    [hexagon.hexagonVertices[1].y, 4.4, 4.5, 4.8],
                    [hexagon.hexagonVertices[6].y, hexagon.hexagonVertices[1].y, 5.2, 5.6],
                    [hexagon.hexagonVertices[6].y, 5.95, 6, 6.6],
                    [hexagon.hexagonVertices[6].y, hexagon.hexagonVertices[6].y, 6.25, 6.85],
                ];

                //nodes
                for(var i = 0; i < coordinatesNodes.x.length; i++){
                    nodes[i] = [];
                    nodesRight[i] = [];

                    for(var j = 0; j < coordinatesNodes.x[i].length; j++){
                        if(isEqualCoordinatesOfHexagon( coordinatesNodes.x[i][j],
                                                        coordinatesNodes.y[i][j])){
                            nodes[i][j] = new Node(
                                coordinatesNodes.x[i][j],
                                coordinatesNodes.y[i][j]);
                            nodesRight[i][j] = new Node(
                                -coordinatesNodes.x[i][j] + OFFSET_X * 2,
                                coordinatesNodes.y[i][j]);

                            nodes[i][j].radius = 0;
                            nodesRight[i][j].radius = 0;
                        } else {
                            
                            nodes[i][j] = new Node(
                                stepX * coordinatesNodes.x[i][j] + OFFSET_X,
                                stepY * coordinatesNodes.y[i][j]);
                            nodesRight[i][j] = new Node(
                                stepX * -coordinatesNodes.x[i][j] + OFFSET_X,
                                stepY * coordinatesNodes.y[i][j]);
                        }
                    }
                }

                function isEqualCoordinatesOfHexagon(x, y){
                    var self = this;

                    self.x = x;
                    self.y = y;

                    if(hexagon.hexagonVertices.some(eq)){
                        //alert("lol");
                        return true;
                    }

                    function eq(element){
                        return self.x == element.x && self.y == element.y;
                    }
                }
                
                //buttons
                for (var i = 0, k = 1; i < BUTTONS.length/2; i++, k++) {

                    rightButtons[i] = new Button(   relation / BUTTONS[i].x * 1.2 + OFFSET_X,
                                                    stepY * (k),
                                                    BUTTONS[i].image,
                                                    BUTTONS[i].title,
                                                    BUTTONS[i].message,
                                                    1);
                }
                for (var i = BUTTONS.length/2, k = 1; i < BUTTONS.length; i++, k++) {

                    leftButtons[i - BUTTONS.length/2] = new Button(     relation / -BUTTONS[i].x * 1.2 + OFFSET_X,
                                                                        stepY *(k),
                                                                        BUTTONS[i].image,
                                                                        BUTTONS[i].title,
                                                                        BUTTONS[i].message,
                                                                        0);

                }

                var toLinks = [
                    [ nodes[0][0], nodes[0][1] ], 
                    [ nodes[0][0], nodes[0][2] ], 
                    [ nodes[0][1], nodes[0][2] ],
                    [ nodes[0][2], nodes[0][3] ],
                    [ nodes[0][2], rightButtons[0] ],
                    [ nodes[0][3], rightButtons[1] ],

                    [ nodes[1][0], nodes[1][1] ], 
                    [ nodes[1][1], nodes[1][2] ],
                    [ nodes[1][2], nodes[1][3] ],
                    [ nodes[1][2], nodes[0][2] ],
                    [ nodes[1][2], nodes[0][3] ],
                    [ nodes[1][3], nodes[0][3] ],
                    [ nodes[1][3], rightButtons[2] ],

                    [ nodes[2][0], nodes[2][1] ], 
                    [ nodes[2][0], nodes[1][1] ], 
                    [ nodes[2][1], nodes[2][2] ],
                    [ nodes[2][2], nodes[2][3] ],
                    [ nodes[2][2], nodes[1][1] ],
                    [ nodes[2][2], nodes[1][2] ],
                    [ nodes[2][3], rightButtons[2] ],

                    [ nodes[3][0], nodes[3][1] ], 
                    [ nodes[3][1], nodes[3][2] ],
                    [ nodes[3][1], nodes[2][2] ],
                    [ nodes[3][1], nodes[2][3] ],
                    [ nodes[3][2], nodes[3][3] ],
                    [ nodes[3][2], nodes[2][3] ],
                    [ nodes[3][3], nodes[2][3] ],
                    [ nodes[3][3], rightButtons[3] ],

                    [ nodes[4][0], nodes[4][1] ], 
                    [ nodes[4][1], nodes[4][2] ],
                    [ nodes[4][2], nodes[4][3] ],
                    [ nodes[4][3], nodes[3][3] ],
                    [ nodes[4][3], rightButtons[4] ],

                    [ nodes[5][0], nodes[5][1] ], 
                    [ nodes[5][1], nodes[5][2] ],
                    [ nodes[5][2], nodes[5][3] ],
                    [ nodes[5][2], nodes[4][1] ],
                    [ nodes[5][3], nodes[4][1] ],
                    [ nodes[5][3], nodes[4][2] ],
                    [ nodes[5][3], nodes[4][3] ],
                    [ nodes[5][3], rightButtons[5] ],

                    [ nodes[6][0], nodes[6][1] ], 
                    [ nodes[6][1], nodes[6][2] ],
                    [ nodes[6][2], nodes[6][3] ],
                    [ nodes[6][2], nodes[5][0] ],
                    [ nodes[6][2], nodes[5][2] ],
                    [ nodes[6][2], nodes[5][3] ],
                    [ nodes[6][3], nodes[5][3] ],
                    [ nodes[6][3], rightButtons[6] ],

                    [ nodes[7][0], nodes[7][1] ], 
                    [ nodes[7][1], nodes[7][2] ],
                    [ nodes[7][2], nodes[7][3] ],
                    [ nodes[7][2], nodes[6][1] ],
                    [ nodes[7][3], nodes[6][1] ],
                    [ nodes[7][3], nodes[6][2] ],
                    [ nodes[7][3], nodes[6][3] ],
                    [ nodes[7][3], rightButtons[7] ],

//                    [ nodes[6][2], nodes[7][3] ]
                ];

                var toLinksLeft = [
                    [ nodesRight[0][0], nodesRight[0][1] ], 
                    [ nodesRight[0][0], nodesRight[0][2] ], 
                    [ nodesRight[0][1], nodesRight[0][2] ],
                    [ nodesRight[0][2], nodesRight[0][3] ],
                    [ nodesRight[0][2], leftButtons[0] ],
                    [ nodesRight[0][3], leftButtons[1] ],

                    [ nodesRight[1][0], nodesRight[1][1] ], 
                    [ nodesRight[1][1], nodesRight[1][2] ],
                    [ nodesRight[1][2], nodesRight[1][3] ],
                    [ nodesRight[1][2], nodesRight[0][2] ],
                    [ nodesRight[1][2], nodesRight[0][3] ],
                    [ nodesRight[1][3], nodesRight[0][3] ],
                    [ nodesRight[1][3], leftButtons[2] ],

                    [ nodesRight[2][0], nodesRight[2][1] ], 
                    [ nodesRight[2][0], nodesRight[1][1] ], 
                    [ nodesRight[2][1], nodesRight[2][2] ],
                    [ nodesRight[2][2], nodesRight[2][3] ],
                    [ nodesRight[2][2], nodesRight[1][1] ],
                    [ nodesRight[2][2], nodesRight[1][2] ],
                    [ nodesRight[2][3], leftButtons[2] ],

                    [ nodesRight[3][0], nodesRight[3][1] ], 
                    [ nodesRight[3][1], nodesRight[3][2] ],
                    [ nodesRight[3][1], nodesRight[2][2] ],
                    [ nodesRight[3][1], nodesRight[2][3] ],
                    [ nodesRight[3][2], nodesRight[3][3] ],
                    [ nodesRight[3][2], nodesRight[2][3] ],
                    [ nodesRight[3][3], nodesRight[2][3] ],
                    [ nodesRight[3][3], leftButtons[3] ],

                    [ nodesRight[4][0], nodesRight[4][1] ], 
                    [ nodesRight[4][1], nodesRight[4][2] ],
                    [ nodesRight[4][2], nodesRight[4][3] ],
                    [ nodesRight[4][3], nodesRight[3][3] ],
                    [ nodesRight[4][3], leftButtons[4] ],

                    [ nodesRight[5][0], nodesRight[5][1] ], 
                    [ nodesRight[5][1], nodesRight[5][2] ],
                    [ nodesRight[5][2], nodesRight[5][3] ],
                    [ nodesRight[5][2], nodesRight[4][1] ],
                    [ nodesRight[5][3], nodesRight[4][1] ],
                    [ nodesRight[5][3], nodesRight[4][2] ],
                    [ nodesRight[5][3], nodesRight[4][3] ],
                    [ nodesRight[5][3], leftButtons[5] ],

                    [ nodesRight[6][0], nodesRight[6][1] ], 
                    [ nodesRight[6][1], nodesRight[6][2] ],
                    [ nodesRight[6][2], nodesRight[6][3] ],
                    [ nodesRight[6][2], nodesRight[5][0] ],
                    [ nodesRight[6][2], nodesRight[5][2] ],
                    [ nodesRight[6][2], nodesRight[5][3] ],
                    [ nodesRight[6][3], nodesRight[5][3] ],
                    [ nodesRight[6][3], leftButtons[6] ],

                    [ nodesRight[7][0], nodesRight[7][1] ], 
                    [ nodesRight[7][1], nodesRight[7][2] ],
                    [ nodesRight[7][2], nodesRight[7][3] ],
                    [ nodesRight[7][2], nodesRight[6][1] ],
                    [ nodesRight[7][3], nodesRight[6][1] ],
                    [ nodesRight[7][3], nodesRight[6][2] ],
                    [ nodesRight[7][3], nodesRight[6][3] ],
                    [ nodesRight[7][3], leftButtons[7] ],

//                    [ nodesRight[6][2], nodesRight[7][3] ]
                ];
                //links
                tempLinksR[0] = [];
                tempLinksL[0] = [];
                for(var i = 0; i < toLinks.length; i++){
                    tempLinksR[0][i] = new Link (
                        toLinks[i][0].x,
                        toLinks[i][0].y,
                        toLinks[i][1].x,
                        toLinks[i][1].y,
                        toLinks[i][1]
                    );

                    tempLinksL[0][i] = new Link (
                        toLinksLeft[i][0].x,
                        toLinksLeft[i][0].y,
                        toLinksLeft[i][1].x,
                        toLinksLeft[i][1].y,
                        toLinksLeft[i][1]
                    );

                    if( i == 26){
                        continue;
                    }
                    connect(toLinks[i][0], toLinks[i][1]);
                    connect(toLinksLeft[i][0], toLinksLeft[i][1]);


                    if(i == toLinks.length - 1){
                        connect(toLinks[i-2][1], toLinks[i][0]);
                        connect(toLinksLeft[i-2][1], toLinksLeft[i][0]);
                    }

                }

                var controls1 = new SelectControls(rightButtons, nodes, canvas, messageBox);
                var controls2 = new SelectControls(leftButtons, nodes, canvas, messageBox);

                draw();
            }

        }

        function draw() {

            ctx.fillStyle = ourCOLORS.BACKGROUND;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            scene.children.forEach( function(draw_priority){
                draw_priority.forEach(function(el){
                    el.draw();
                })
            /*ctx.globalAlpha = 0.1;
            ctx.drawImage(tz, 68, 0, canvas.width - 140, canvas.height);
            ctx.globalAlpha = 1.0;*/

            })
            var timer = setTimeout(draw,50);
        }

        function Scene(){
            var self = this;
            this.children = [];

            this.add = function(obj){
                self.children[obj.draw_priority] ? '' : self.children[obj.draw_priority] = [];
                self.children[obj.draw_priority].push(obj);
            };

            this.remove = function(obj){
                var index = self.children[obj.draw_priority].indexOf(obj);
                index != -1 ? self.children[obj.draw_priority].splice(index, 1) : '';
            }

            this.update = function(){
                scene.children.reverse().forEach( function(draw_priority){
                    draw_priority.forEach(function(el){
                        el.update();
                    })
                })

                scene.children.reverse();
            }
        }

        function Button(x, y, imgsrc, buttonTitle, message, type) {
            var self = this;
            this.type = type;
            this.did = false;

            this.isHover = false;
            this.isActive = false;

            this.x = x;
            this.y = y;

            this.radius = relation / 25;

            this.img = new Image();

            this.img.addEventListener("load", function() {
                var k =  self.img.height / self.img.width >= 1 ?  2 * self.radius / self.img.height : 2 * self.radius / self.img.width;
                self.img.height *= k * 0.8;
                self.img.width *= k * 0.8;
                self.isImageLoad = true;
              }, false);

            this.img.src = imgsrc;

            this.title = buttonTitle.toUpperCase();
            this.message = message;

            this.messageBox = null;

            this.draw_priority = 2;

            this.gradient = ctx.createLinearGradient(this.x - this.radius,
                    this.y - this.radius,
                    this.x + this.radius,
                    this.y + this.radius);
            this.gradient.addColorStop("0", ourCOLORS.CYAN);
            this.gradient.addColorStop("1", ourCOLORS.LASER_LEMON);

            this.wrapButtonText = function( text, marginLeft, marginTop, maxWidth, lineHeight) {
                var words = text.split(" ");
                var countWords = words.length;
                var line = "";
                
                for (var n = 0; n < countWords; n++) {
                    var testLine = line + words[n] + " ";
                    var testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth) {
                        ctx.fillText(line, marginLeft, marginTop - relation / 130);
                        line = words[n] + " ";
                        marginTop += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, marginLeft, marginTop);
        }

            scene.add(this);
        }
        Button.prototype.hover = function () {

            if (!this.messageBox) {

                this.isHover = this.isActive = true;
                activeButton = this;
                this.messageBox = new Box(
                                        0 + OFFSET_X - (width / 7.1),
                                        height / 2 - (height / 6),
                                        width / 3.55,
                                        height / 3,
                                        this.message);
            }

            scene.update();

        };
        Button.prototype.out = function () {

            var self = this;

            if (this.messageBox) {

                this.messageBox.isActive = false;

                setTimeout(function () {
                    if (!self.isHover && self.messageBox) {

                        scene.remove(self.messageBox);

                        if (scene.children[self.messageBox.draw_priority].length == 0){
                            linksState = false;
                        }

                        self.messageBox = null;
                    }
                }, 2000);
            }

            if(this.isHover){
                activeButton = null;
                this.isHover = this.isActive = false;
            }
            scene.update();
        };
        Button.prototype.draw = function () {

            ctx.fillStyle = ourCOLORS.BACKGROUND;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fill();

            if (this.isHover) {
                ctx.strokeStyle = this.gradient;
                ctx.lineWidth = ourCOLORS.LINES_WIDTH + 0.5;
            } else {
                ctx.lineWidth = ourCOLORS.LINES_WIDTH;
                ctx.strokeStyle = ourCOLORS.WHITE;
            }
            ctx.stroke();

            if(this.isImageLoad){
                ctx.drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2, this.img.width, this.img.height );
            }

            ctx.beginPath();
            ctx.fillStyle = ourCOLORS.WHITE;
            ctx.textBaseline = "middle";
            var fontSize = relation / 80;
            ctx.font = fonts.button_label.size + " button_label";
            if (this.type) {
                ctx.textAlign = "left";
                this.wrapButtonText(this.title, this.x + 1.5 * this.radius, this.y, relation / 6, relation / 50);

            } else {
                ctx.textAlign = "right";
                this.wrapButtonText(this.title, this.x - 1.5 * this.radius, this.y, relation / 6, relation / 50);

            }

        };
        Button.prototype.nodesOffset = function () {
            var x = randomBetween(this.x - 150, this.x - 100);
            var y = randomBetween(this.y - 10, this.y + 10);

            return {x: x, y: y};
        };

        Button.prototype.update = function () {

        };

        function Link(x, y, x2, y2, pointSecond) {

            this.isActive = false;
            this.pointS = pointSecond;
            this.coordinateXOfMoveGradient = 0;
            this.need = 1;

            this.x = x;
            this.y = y;

            this.x2 = x2;
            this.y2 = y2;
            this.lineWidth = ourCOLORS.LINES_WIDTH;

            this.unactive_gradient = ctx.createLinearGradient(0, BUTTONS[0].y, 0, BUTTONS[7].y);
            this.unactive_gradient.addColorStop("0", ourCOLORS.CYAN);
            this.unactive_gradient.addColorStop("0.5", ourCOLORS.AQUAMARIN);
            this.unactive_gradient.addColorStop("1", ourCOLORS.LASER_LEMON);

            this.draw_priority = 0;

            scene.add(this);
        };
        Link.prototype.draw = function () {

            if( activeButton ){

                this.need > speed ? this.need -= speed : this.need = 0;

                this.active_gradient = ctx.createLinearGradient(this.coordinateXOfMoveGradient - this.need + OFFSET_X, activeButton.y, activeButton.x, activeButton.y);
                this.active_gradient.addColorStop(this.need, background);
                this.active_gradient.addColorStop(this.need + 0.03, ourCOLORS.CYAN);
                this.active_gradient.addColorStop("1", ourCOLORS.LASER_LEMON);
               
            }
            if (this.isActive) {
                ctx.strokeStyle = this.active_gradient;
                ctx.lineWidth = ourCOLORS.LINES_WIDTH / 2 + 0.5;
            } else { 
                ctx.lineWidth = this.lineWidth;
                if(linksState){
                    ctx.strokeStyle = ourCOLORS.WHITE;
                    this.lineWidth = ourCOLORS.LINES_WIDTH / 2;
                } else {
                    this.lineWidth = ourCOLORS.LINES_WIDTH;
                    ctx.strokeStyle = this.unactive_gradient;//ourCOLORS.WHITE;
                }
            }

            ctx.beginPath();
            ctx.moveTo(this.x2, this.y2);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        };
        Link.prototype.update = function () {

            if(!this.isActive){
                this.need = 1;
            }

            this.isActive = this.pointS.isActive;

            this.coordinateXOfMoveGradient = 0;



            if(this.isActive) {
                linksState = true;
            }
        };

        function Node(x, y) {

            this.isActive = false;
            this.connections = [];

            this.x = x;
            this.y = y;
            this.radius = relation / 165;

            this.draw_priority = 1;

            scene.add(this);
        }
        Node.prototype.update = function() {
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i].isActive && activeButton) {
                    this.isActive = true;
                    return;
                } else {
                    this.isActive = false;
                } 
            }
        };
        Node.prototype.draw = function () {

            ctx.fillStyle = ourCOLORS.NODE;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fill();

        };

        function Box(x, y, width, height, message) {

            this.x = x;
            this.y = y;
            this.w = width;
            this.h = height;

            this.isDraw = false;
            this.isActive = true;

            this.message = message;

            this.gradient = ctx.createLinearGradient(this.x,
                    this.y + this.h / 2,
                    this.x + this.w,
                    this.y + this.h / 2);

            this.gradient.addColorStop("0", ourCOLORS.CYAN);
            this.gradient.addColorStop("0.5", ourCOLORS.AQUAMARIN);
            this.gradient.addColorStop("1", ourCOLORS.LASER_LEMON);

            this.draw_priority = 4;

            scene.add(this);
        }
        Box.prototype.draw = function () {

            ctx.fillStyle = ourCOLORS.BACKGROUND;
            ctx.fillRect(this.x, this.y, this.w, this.h);

            if (this.isActive) {
                ctx.strokeStyle = this.gradient;
            } else {
                ctx.strokeStyle = ourCOLORS.WHITE;

            }
            ctx.lineWidth = ourCOLORS.LINES_WIDTH * 2;
            ctx.strokeRect(this.x, this.y, this.w, this.h);

            ctx.fillStyle = ourCOLORS.WHITE;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.font = fonts.window_title.size + " window_title";

            //ctx.fillText(this.message.title, this.x + this.w / 2, this.y + relation / 36);
            wrapText(this.message.title, this.x + this.w / 2, this.y + relation / 25, this.w, relation / 30);
            var boxTitleWidth = ctx.measureText(this.message.title).width;

            ctx.font = fonts.window_text.size + " window_text";
            ctx.textAlign = "left";
            if(boxTitleWidth < this.w){
                wrapText(this.message.text, this.x + this.w / 20, this.y + relation / 20 + relation / 30, this.w - this.w / 20, relation / 36);
            } else {
                wrapText(this.message.text, this.x + this.w / 20, this.y + relation / 20 + relation / 15, this.w - this.w / 20, relation / 36);                
            }
        };
        Box.prototype.update = function () {

        };

        function Hexagon(x, y, hexagonSize){
            this.hexagonSize = hexagonSize;
            this.triangleSize = hexagonSize - relation / 40;
            this.x = x;
            this.y = y;

            this.hexagonVertices = [];
            this.triangleVertices = [];

            for (var i = 1; i < 7; i++) {
                this.hexagonVertices[i] = {
                    x: this.x + this.hexagonSize * Math.sin(i * 2 * Math.PI / 6),
                    y: this.y + this.hexagonSize * Math.cos(i * 2 * Math.PI / 6)
                }
            }

            this.triangleGradient = ctx.createLinearGradient(this.x,
                    this.hexagonVertices[4].y,
                    this.x,
                    this.hexagonVertices[6].y);

            this.triangleGradient.addColorStop("0", ourCOLORS.CYAN);
            this.triangleGradient.addColorStop("0.5", ourCOLORS.AQUAMARIN);
            this.triangleGradient.addColorStop("1", ourCOLORS.LASER_LEMON);

            this.draw_priority = 3;

            scene.add(this);
        }
        Hexagon.prototype.draw = function() {
            ctx.beginPath();
            ctx.moveTo(this.x + this.hexagonSize * Math.sin(0), this.y + this.hexagonSize * Math.cos(0));

            for (var i = 1; i < 7; i++) {
                this.hexagonVertices[i] = {
                    x: this.x + this.hexagonSize * Math.sin(i * 2 * Math.PI / 6),
                    y: this.y + this.hexagonSize * Math.cos(i * 2 * Math.PI / 6)
                }

                ctx.lineTo(
                    this.hexagonVertices[i].x,
                    this.hexagonVertices[i].y
                );
            }

            ctx.fillStyle = ourCOLORS.BACKGROUND;
            ctx.fill();

            ctx.strokeStyle = ourCOLORS.WHITE;
            ctx.lineWidth = ourCOLORS.LINES_WIDTH;
            ctx.stroke();

            ctx.beginPath();

            ctx.moveTo(this.x + this.triangleSize * Math.sin(0), this.y - this.triangleSize * Math.cos(0));

            for (var i = 1; i < 7; i++) {
                this.triangleVertices[i] = {
                    x: this.x - this.triangleSize * Math.sin(i * 2 * Math.PI / 3),
                    y: this.y - this.triangleSize * Math.cos(i * 2 * Math.PI / 3)
                }

                ctx.lineTo(
                    this.triangleVertices[i].x,
                    this.triangleVertices[i].y
                );
            }
            ctx.fillStyle = ourCOLORS.BACKGROUND;
            ctx.fill();

            ctx.moveTo(this.hexagonVertices[5].x, this.hexagonVertices[5].y);
            ctx.lineTo(this.triangleVertices[1].x, this.triangleVertices[1].y);
            ctx.lineTo(this.hexagonVertices[6].x, this.hexagonVertices[6].y);
            ctx.lineTo(this.triangleVertices[2].x, this.triangleVertices[2].y);
            ctx.lineTo(this.hexagonVertices[1].x, this.hexagonVertices[1].y);
            ctx.moveTo(this.hexagonVertices[4].x, this.hexagonVertices[4].y);
            ctx.lineTo(this.triangleVertices[3].x, this.triangleVertices[3].y);
            ctx.lineTo(this.hexagonVertices[2].x, this.hexagonVertices[2].y);
            ctx.moveTo(this.hexagonVertices[3].x, this.hexagonVertices[3].y);
            ctx.lineTo(this.triangleVertices[3].x, this.triangleVertices[3].y);
            ctx.strokeStyle = ourCOLORS.WHITE;
            ctx.lineWidth = ourCOLORS.LINES_WIDTH / 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.hexagonVertices[4].x + ourCOLORS.LINES_WIDTH * 4, this.hexagonVertices[4].y + ourCOLORS.LINES_WIDTH * 4);
            ctx.lineTo(this.hexagonVertices[2].x - ourCOLORS.LINES_WIDTH * 4, this.hexagonVertices[2].y + ourCOLORS.LINES_WIDTH * 4);
            ctx.lineTo(this.hexagonVertices[6].x, this.hexagonVertices[6].y - ourCOLORS.LINES_WIDTH * 4);
            ctx.closePath();
            ctx.strokeStyle = this.triangleGradient;
            ctx.lineWidth = ourCOLORS.LINES_WIDTH * 2;
            ctx.lineCap = "butt";

            ctx.stroke();

            ctx.fillStyle = ourCOLORS.WHITE;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            var fontSize = relation / 33;
            ctx.font = fonts.logo.size + " logo";

            ctx.fillText("NS", this.x, this.y);
        };
        Hexagon.prototype.update = function() {
            // body...
        };

        function wrapText( text, marginLeft, marginTop, maxWidth, lineHeight) {
                var words = text.split(" ");
                var countWords = words.length;
                var line = "";
                
                for (var n = 0; n < countWords; n++) {
                    var testLine = line + words[n] + " ";
                    var testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth) {
                        ctx.fillText(line, marginLeft, marginTop);
                        line = words[n] + " ";
                        marginTop += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, marginLeft, marginTop);
        }

        function randomBetween(first, second) {

            if (first < second) {
                var f = first;
                var s = second;
            } else if (second > first) {
                var f = second;
                var s = first;
            } else {
                return 0;
            }

            return Math.floor(Math.random() * (s - f + 1) + f);
        }

        function connect(object, connection) {
            object.connections.push(connection);
        };

        function SelectControls( objects, nodes, element, messageBox){

            var element = element;
            var objects = objects || [];

            function activate(obj, element) {
                element.addEventListener('mousemove', onDocumentMouseMove, false);
            }

            function deactivate() {
                element.removeEventListener('mousemove', onDocumentMouseMove, false);
            }

            function onDocumentMouseMove(event) {

                var canvasClickX = event.clientX - canvasOffsetX;
                var canvasClickY = event.clientY - canvasOffsetY;

                objects.forEach(function (item, i, arr) {

                    if (Math.pow(canvasClickX - objects[i].x, 2) + Math.pow(canvasClickY - objects[i].y, 2) < Math.pow(objects[i].radius, 2)) {
                        objects[i].hover();
                    } else {
                        objects[i].out();
                    }
                });
            }
           activate( objects, element);
        }

        function render() {
            canvas = document.createElement( 'canvas' );
            document.body.appendChild(canvas);
            //Стили
            var style = document.createElement( 'style' );
            style.innerHTML = style2();
            document.body.appendChild(style);
        }
        function style2(){
            var style =
            "body {\
                margin: 0;\
                padding: 0;\
            }\
            @font-face {\
             font-family: button_label; \
             src: url(" + fonts.button_label.font + "); \
            }\
            @font-face {\
             font-family: window_text; \
             src: url(" + fonts.window_text.font + "); \
            }\
            @font-face {\
             font-family: logo; \
             src: url(" + fonts.logo.font + "); \
            }\
            @font-face {\
             font-family: window_title; \
             src: url(" + fonts.window_title.font + "); \
            }";

            return style;
        }
        this.init = init;

    };
    // Возвращаем класс виджета
    return Widget;
})();

var options = {
    buttons: [
            {title: "NEUROMORPHIC COMPUTING", message:{title: "NEUROMORPHIC COMPUTING", text: "Текст отображаемый во всплывающем окне"}, image: "./img/БАБОЧКА/NS - Icons - Neuromorphic Computer.svg"},
            {title: "THOUGHT CONTROLLED GAMING", message:{title: "THOUGHT CONTROLLED GAMING", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Thought Controlled Gaming.svg"},
            {title: "PATTERN RECOGNITION", message:{title: "PATTERN RECOGNITION", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Patern Recognition.svg"},
            {title: "MACHINE LEARNING", message:{title: "MACHINE LEARNING", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Mashine Learning.svg"},
            {title: "CHATBOTS", message:{title: "CHATBOTS", text: "Текст отображаемый во всплывающем окне"}, image: "./img/БАБОЧКА/NS - Icons - Chatbots.svg"},
            {title: "REAL TIME UNIVERSAL TRANSLATION", message:{title: "REAL TIME UNIVERSAL TRANSLATION", text: "Текст отображаемый во всплывающем окне"}, image: "./img/БАБОЧКА/NS - Icons - Real Time.svg"},
            {title: "NEXT GEN CLOUD ROBOTICS", message:{title: "NEXT GEN CLOUD ROBOTICS", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Next Gen Cloud.svg"},
            {title: "VIRTUAL COMPANIONS", message:{title: "VIRTUAL COMPANIONS", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Virtual Companions.svg"},

            {title: "COGNITIVE CYBER SECURITY", message:{title: "COGNITIVE CYBER SECURITY", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Cyber Security.svg"},
            {title: "AUTONOMOUS SURGICAL ROBOTICS", message:{title: "AUTONOMOUS SURGICAL ROBOTICS", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Neurosurgery.svg"},
            {title: "DEEP LEARNING", message:{title: "DEEP LEARNING", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Deep Learning.svg"},
            {title: "AUTONOMOUS SYSTEMS", message:{title: "AUTONOMOUS SYSTEMS", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Autonomous Systems.svg"},
            {title: "NEURAL NETWORKS", message:{title: "NEURAL NETWORKS", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Neural Network.svg"},
            {title: "ROBOTIC PERSONAL ASSISTANTS", message:{title: "ROBOTIC PERSONAL ASSISTANTS", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Robotic Personal Assistants.svg"},
            {title: "NATURAL LANGUAGE PROCESSING", message:{title: "NATURAL LANGUAGE PROCESSING", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Natural Lenguage Procesing.svg"},
            {title: "REAL TIME EMOTION ANALYTICS", message:{title: "REAL TIME EMOTION ANALYTICS", text: ""}, image: "./img/БАБОЧКА/NS - Icons - Rial Time Emotion Analisator.svg"}
        ],
    fonts: {
        button_label: {font:"./fonts/NEUROSEED/Play/Play-Regular.ttf", size: "100%"},
        window_title: {font:"./fonts/NEUROSEED/Play/Play-Regular.ttf", size: "20pt"},
        logo: {font:"./fonts/NEUROSEED/Play/Play-Regular.ttf", size: "30pt"},
        window_text: {font:"./fonts/NEUROSEED/Exo_2/Exo2-Italic.ttf", size: "14pt"},
    },
    active_link: {
        speed: 3,
        background: "#777"
    }
}

var widget = new screen_widget(options);

widget.init();

};