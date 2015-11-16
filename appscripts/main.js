require(
   // Use this library to "fix" some annoying things about Raphel paper and graphical elements:
    //     a) paper.put(relement) - to put an Element created by paper back on a paper after it has been removed
    //     b) call element.addEventListener(...) instead of element.node.addEventListner(...)
    ["../jslibs/raphael.lonce"],  // include a custom-built library

    /* Veldas Lim A0113919A

    This game is a shooting game. Player has 20 seconds to shoot pumpkins. 
    Depending on the difficulty selected, pumpkins will move at a slower or faster rate.
    Left and right arrow keys are used to control the dot emitter.*/

    function () {

        alert("Oh no! Evil pumpkins have taken over the town! Eliminate the pumpkins by shooting candy at them and save Halloween! Use the control keys 'left' and 'right' to control.")

        // Grab the div where we will put our Raphael paper
        var centerDiv = document.getElementById("centerDiv");

        // Create the Raphael paper that we will use for drawing and creating graphical objects
        var paper = new Raphael(document.getElementById("mySVGCanvas"));

        // put the width and heigth of the canvas into variables for our own convenience
        var pWidth = paper.canvas.offsetWidth;
        var pHeight = paper.canvas.offsetHeight;
        console.log("pWidth is " + pWidth + ", and pHeight is " + pHeight);


        //---------------------------=--Sound effects---------------------------------

        var bgsound = new Audio("resources/Darksolace.wav");
        bgsound.loop = true;    
        bgsound.currentTime = 2;

        var hitsound = new Audio("resources/Laser.wav");

        //-----------------------=------Game start------------------------------------
        //Creating a start button with text 'Start'
        var startButton = paper.circle(pWidth/2, pHeight/2, 65);
        startButton.attr({
            fill: 'url(http://www.ilona-andrews.com/wp-content/uploads/2012/10/pumpkin_128.png)',
            stroke: 'none'
        });

        var startText = paper.text(pWidth/2, pHeight/2 + 5, 'START');
        startText.attr({
            'font-size': '25px',
            'font-weight': 'bold'
        });


        // Hide button for now, show it only when game is ready
        startButton.hide();
        startText.hide();

        // Add a counter to the game to keep score
        var score = 0;
        var scorenum = paper.text(850, 450, score);
        scorenum.attr({
            'fill': 'white',
            'font-size': 60,
            'font-family':'sunn',
            'text-anchor':'end'
        });

        // Hide score until start button is clicked
        scorenum.hide();

        var ready = function(){
            startButton.show();
            startText.show();
            return hideobjects;//Stop calling the hideobjects function when game restarts
        };


        var start = function (){
            //Alert box to make sure that player selects difficulty before starting the game
            if (diffselected === false) {
                alert('Select your difficulty level before starting the game.');
            } else {
                console.log("Game is starting");

                startButton.hide();
                startText.hide();

                //Start music when start button is clicked
                bgsound.play();
                //Show the score when start button is clicked
                scorenum.show();
                scorenum.attr({text:score}); 
                console.log("Score is " + score);
                
                //Only call the emitter and draw function when start button is clicked
                //Assign variable name to setInterval, makes it easier to clear it later
                drawtimer = setInterval(draw, 40); //Ideal interval that moves objects smoothly
                emittertimer = setInterval(emitter, 150); //Emit dots every 0.2 second
                rectemittertimer = setInterval(rectemitter, 2000); //Emit pumpkins every 2 seconds
                //Call function that creates the objects
                initdot();
                initrect();
                //End the game after 20 seconds
                setTimeout(endgame, 20000);
            }

        };

        //Start when start button is clicked
        startButton.node.addEventListener('click', start);

        //-------------------------------------Adding objects ---------------------------------

        //Creating an array of 15 rectangles. 
        var numRects = 15;
        // Initialize array to empty
        var rect = [];
        var t =0;

        // Create function to initialize pumpkins
        var initrect = function(){
            while(t<numRects){
                rect[t]=paper.rect(450, 10, 128, 128); 
                rect[t].attr({
                'fill': 'url(http://www.ilona-andrews.com/wp-content/uploads/2012/10/pumpkin_128.png)',
                'stroke': 'none',
                });

                //Location where pumpkins are created
                rect[t].xpos= 450;
                rect[t].ypos= 10;

                rect[t].xrate= pumpkinrate;
                
                console.log("Initializing pumpkin number " + t);
                t++;
            };
        };

        //Add a counter for the rectangle emitter
        var counting = 0;
        //Use an emitter function to emit pumpkins one at a time
        var rectemitter = function (){
            //Pumpkin is emitted at random x position
            rect[counting].xpos=Math.random()*pWidth; 
            rect[counting].ypos= 10;
            //Instead of a value, use a variable for pumpkin rate so that it is easier to call on it later
            rect[counting].xrate = pumpkinrate;
            counting++;
            console.log("Rect" + counting);
            //Use the modulus function to ensure that up to 10 pumpkins are being created
            counting = counting%15;
        };

        // Temporary distance variable used inside rect loop
        var dist; 

        //Create function that moves pumpkin and counts how many pumpkins have been hit
        var moverect = function(){   
            t=0;
            while(t<numRects){
                //To move pumpkin, increase x position of the pumpkin by pumpkin rate
                rect[t].xpos += rect[t].xrate;
                //New positiion of the pumpkin
                rect[t].attr({'x': rect[t].xpos, 'y': rect[t].ypos});

                //Dot loop is placed within moverect because both are interlinked
                i = 0;
                while(i<numDots){
                    //Use the distance function to calculate the distance between EACH pumpkin location and dot location
                    dist = distance(dot[i].xpos, dot[i].ypos, rect[t].xpos, rect[t].ypos);
                    //When distance between pumpkin and dot is less than 5, dot is considered to have hit the pumpkin
                    if (dist<5){
                        hitsound.play(); //Play hit sound
                        rect[t].xpos = 1200; //Remove the pumpkin by hiding it off centre
                        console.log("Hit.");
                        score++ //Add 1 to score
                        scorenum.attr({text:score}); //Display new score
                        console.log("You hit " + score + " pumpkins.");
                    }
                i++;
            }


        //Change direction of pumpkin if the pumpkin hits the border of box. Add "-100" to pWidth so that it will hit the border nicely.
            if (rect[t].xpos > pWidth -100) {rect[t].xrate = -rect[t].xrate };
            if (rect[t].xpos < 0) {rect[t].xrate = -rect[t].xrate };
    
            t++;

            }

        };


        //---------------------------------Shooting dots---------------------------------
        // Create array to hold 40 dots
        var numDots=40;
        var dot = [];
        var i=0;

        //Initializing dots
        var initdot = function(){
            while(i<numDots){
            dot[i]=paper.circle(pWidth/2, 500, 8); //Create dot at the bottom of the screen
            //Code from previous assignment to have multicoloured dots
            dot[i].colorString = "hsl(" + Math.random()+ ",1, .75)";
            dot[i].attr({
                'fill': dot[i].colorString,
                'stroke': 'none'
            })

            dot[i].xpos= pWidth/2;
            dot[i].ypos= 500;
            // Only y rate is required since dots are moving in upward direction
            dot[i].yrate= -10;
            i++;

            }
        };
        
        var counter = 0;

        //Create a variable for the emitter function
        var emitter = function (){
            dot[counter].xpos= emitterlocation; //Dots emit from this position
            dot[counter].ypos= 500; //bottom of the screen
            dot[counter].yrate= -10; //Negative for rate as dots move in an upward direction
            counter++ //So that you know which dot is which 1st dot, 2nd dot
            console.log("Dot" + counter);
            counter = counter%40;
        };

        //Creating draw function that moves both the dots and pumpkins
        var draw = function(){
            // Count and keep track of the number of times this function is called
            i=0;
            while(i<numDots){
                dot[i].ypos += dot[i].yrate;

                // Move the dot using 'state' variables
                dot[i].attr({'cx': dot[i].xpos, 'cy': dot[i].ypos});

                i++;
            }

            //Adding the function 'moverect' here so pumpkins move everytime 'draw' is called.
            moverect();
        };

        ready(); // Call the ready function to start game

        //---------------------------Setting the difficulty levels-------------------------
     
        var diffselected = false;

        // Use the getElementById method to retrieve the button by their unique id
        var easybutton = document.getElementById("Easy");
        var normalbutton = document.getElementById("Normal");
        var hardbutton = document.getElementById("Hard");

        //Don't move the pumpkins before they are defined
        //Create a variable for pumpkin rate
        //A variable makes it easier to substitute it for rect[t].rate, given that rect is an array


        easybutton.addEventListener('click',function(){
            diffselected = true; //Update button click
            pumpkinrate = 15; //rect[t].rate is updated to 10
            console.log("Easy selected.");
        });

        normalbutton.addEventListener('click',function(){
            diffselected = true;
            pumpkinrate = 20;
            console.log("Normal selected.");
        });

        hardbutton.addEventListener('click',function(){
            diffselected = true;
            pumpkinrate = 25;
            console.log("Hard selected.");
        });
        
    
        //-----------------------------------Key controls--------------------------------------
        
        //Create a variable for emitterlocation to substitute dot[i].xpos so that it is easier to call on
        var emitterlocation = pWidth/2;

        //Using keys to change the direction of the shooting dots when key is pressed.
        //37 is the code for the left key while 39 is the code for the right key.
        var keyCodes = { left: 37, right: 39 };
        var keys = [];
        //When key is pressed, update keys to true
        window.addEventListener('keydown', function(evt){
                console.log("Key down. Key code is " + evt.keyCodes)
                keys[evt.keyCode] = true;
            });

        window.addEventListener('keyup', function(evt) {
                keys[evt.keyCode] = false;
            });

        var movekeys = function(){
            if (keys[keyCodes.left]) {
                //Move the emitter to the left by 10 when left key is pressed.
                emitterlocation -= 10;
                console.log("Left key pressed.")

            } else if (keys[keyCodes.right]) {
                //Move the emitter to the right by 10 when right key is pressed.
                emitterlocation += 10;
                console.log("Right key pressed.")
            }

        };

        //Suitable interval to move keys smoothly
        setInterval(movekeys, 50);

        //------------------------------------------------------------------------------------
        // Using the distance function to calculate the distance between the dot and the rect coordinates 

        var distance=function(x1,y1,x2, y2){
            return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        };

        //--------------------------------------Ending game------------------------------------

        //Game ends after 20 seconds
        //The start button should reappear, objects and intervals clear, ready for another game to start

        //Create a variable to hide the objects offscreen
        var hideobjects = function(){
            t=0;
            while (t<numRects){
                rect[t].xpos = 1200;
                rect[t].ypos = 10;

                i = 0;
                while(i<numDots){
                    dot[i].xpos = pWidth/2;
                    dot[i].ypos = -1000;
                i++;
                }
            t++;
            }
        };


        var endgame = function(){
            hideobjects(); //Call on hideobjects variable when game ends to clear objects
            console.log("Hidden.")

            confirm("Congratulations! You hit " + score + " pumpkins in 20 seconds!");

            score = 0; //Resets score to 0
            scorenum.hide(); //Hide score again until 'Start' is clicked

            //Resets the 'setInterval' functions when timer ends
            clearInterval(drawtimer);
            clearInterval(emittertimer);
            clearInterval(rectemittertimer);
            console.log("Intervals cleared.")

            ready(); //Calls ready function, resets the game

            bgsound.pause(); //Pause the music when game ends

        }

});