  // RequestAnimFrame: a browser API for getting smooth animations
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
				return window.setTimeout(callback, 1000 / 60);
			};
	})();

	window.cancelRequestAnimFrame = ( function() {
		return window.cancelAnimationFrame          ||
			window.webkitCancelRequestAnimationFrame    ||
			window.mozCancelRequestAnimationFrame       ||
			window.oCancelRequestAnimationFrame     ||
			window.msCancelRequestAnimationFrame        ||
			clearTimeout
	} )();


	// Initialize canvas and required variables
	var canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"), // Create canvas context			
		W = 600, // Canvas's width
		H = 500, // Canvas's height
		X = (window.innerWidth - W)/2, // X starting coordinate
		Y = (window.innerHeight - H)/2, // Y starting coordinate
		particles = [], // Array containing particles
		ball = {}, // Ball object
		paddles = [2], // Array containing two paddles
		mouse = {}, // Mouse object to store it's current position
		points = 0, // Varialbe to store points
		count = 0,
		lavel = 0,
		fps = 60, // Max FPS (frames per second)
		startBtn = {}, // Start button object
		restartBtn = {}, // Restart button object
		over = 0, // flag varialbe, cahnged when the game is over
		init, // variable to initialize animation
		paddleHit,
		highscore = 99,
		paused = -1,
		imgEmb = document.getElementById("embarrasing"),
		imgNic = document.getElementById("nicetry"),
		imgTro = document.getElementById("trophy");


	// Add mousemove and mousedown events to the canvas
	canvas.addEventListener("mousemove", trackPosition, true);
	canvas.addEventListener("mousedown", btnClick, true);

	addEventListener("keyup", keyupListener, true);


	// Initialise the collision sound
	collision = document.getElementById("collide");
	crash = document.getElementById("crash");

	// Set the canvas's height and width to full screen
	canvas.width = W;
	canvas.height = H;

	// Function to paint canvas
	function paintCanvas() {
		ctx.fillStyle = "#58FA82";
		ctx.fillRect(0, 0, W, H);
	}

	// Function for creating paddles
	function Paddle(pos) {
		// Height and width
		this.h = 30;
		this.w = 150;

		// Paddle's position
		this.x = (W - this.w)/2;
		this.y = (pos == "top") ? 0 : H - this.h;

	}

	// Push two new paddles into the paddles[] array
	paddles.push(new Paddle("bottom"));
	paddles.push(new Paddle("top"));

	// Ball object
	ball = {
		x: 50,
		y: 50,
		r: 10,
		from: "white",
		to: "green",
		vx: 0,
		vy: 0,

		// Function for drawing ball on canvas
		draw: function() {
			var grd = ctx.createRadialGradient(this.x,this.y,3,this.x,this.y,this.r);
			grd.addColorStop(0,this.from);
			grd.addColorStop(1,this.to);

			// Fill with gradient
			ctx.fillStyle = grd;
			ctx.beginPath();
			ctx.fillStyle = this.c;
			ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
			ctx.fill();
		}
	};


	// Start Button object
	startBtn = {
		w: 100,
		h: 50,
		x: W/2 - 50,
		y: H/2 - 25,

		draw: function() {
			ctx.strokeStyle = "white";
			ctx.lineWidth = "2";
			ctx.strokeRect(this.x, this.y, this.w, this.h);

			ctx.font = "18px Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStlye = "white";
			ctx.fillText("Start", W/2, H/2 );
		}
	};

	// Pause Button object
	pauseBtn = {
		w: 100,
		h: 50,
		x: W/2 - 50,
		y: H/2 - 25,

		draw: function() {
			ctx.strokeStyle = "white";
			ctx.lineWidth = "2";
			ctx.strokeRect(this.x, this.y, this.w, this.h);

			ctx.font = "18px Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStlye = "white";
			ctx.fillText("Resume", W/2, H/2 );
		}
	};

	// Restart Button object
	restartBtn = {
		w: 100,
		h: 50,
		x: W/2 - 50,
		y: H/2 - 50,

		draw: function() {
			ctx.strokeStyle = "white";
			ctx.lineWidth = "2";
			ctx.strokeRect(this.x, this.y, this.w, this.h);

			ctx.font = "18px Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStlye = "white";
			ctx.fillText("Restart", W/2, H/2 - 25 );
		}
	};

	// Draw everything on canvas
	function draw() {
		paintCanvas();		
		for(var i = 0; i < paddles.length; i++) {
			p = paddles[i];

			ctx.fillStyle = "#088A08";
			ctx.fillRect(p.x, p.y, p.w, p.h);
		}

		ball.draw();
		update();
	}

	// Function to increase speed after every 5 points
	function increaseSpd() {
		if(count % 5 == 0) {
			if(Math.abs(ball.vx) < 15) {
				ball.vx += (ball.vx < 0) ? -1 : 1;
				ball.vy += (ball.vy < 0) ? -2 : 2;
				++ level;
				document.getElementById("curLevel").innerHTML = level;
			}
		}
	}

	// Track the position of mouse cursor
	function trackPosition(e) {
		mouse.x = e.pageX - X;
		mouse.y = e.pageY - Y;
	}

	// Function to update positions, score and everything.
	// Basically, the main game logic is defined here
	function update() {

		// Update scores
		updateScore();

		// Move the paddles on mouse move
		if(mouse.x && mouse.y) {

				paddles[1].x = mouse.x - paddles[1].w/2;
				if(paddles[1].x < 0)
					paddles[1].x = 0;
				if((paddles[1].x + paddles[1].w) > W)
					paddles[1].x = W - paddles[1].w

		}
		//alert(1 + ":" + ball.x + "," + ball.y);
		// Move the ball
		ball.x += ball.vx;
		ball.y += ball.vy;
		//alert(2 + ":" + ball.x + "," + ball.y);



		if(ball.vy < 0){

			if((ball.y - ball.r) <= paddles[2].h){
				if(ball.x + ball.r > W - paddles[2].w/2){
						paddles[2].x = W - paddles[2].w;
				}else if(ball.x - ball.r < paddles[2].w/2){
					paddles[2].x = 0;
				}else{
					paddles[2].x = ball.x - (paddles[2].w/2);
				}
			}
		}else{

			if(ball.y > (H/2)){
				ball.to = "yellow";
				if(ball.y > (0.75 * H)){
					ball.to = "red";
				}
			}
		}

		// Collision with paddles
		p1 = paddles[1];
		p2 = paddles[2];


		// If the ball strikes with paddles,
		// invert the y-velocity vector of ball,
		// increment the points, play the collision sound,
		// save collisions position so that sparks can be
		// emitted from that position, set the flag variable,

		if(collides(ball, p1)) {
			collideAction(ball, p1);
		} else if(collides(ball, p2)) {
			collideAction(ball, p2);
		}	else {
			// Collide with walls, If the ball hits the top/bottom,
			// walls, run gameOver() function
			if(ball.y + ball.r >= H) {
				ball.y = H - ball.r;
				gameOver();
			}

			else if(ball.y <= 0) {
				ball.y = ball.r;
				gameOver();
			}

			// If ball strikes the vertical walls, invert the
			// x-velocity vector of ball
			if(ball.x + ball.r >= W) {
				ball.vx = -ball.vx;
				ball.x = W - ball.r;
			}	else if(ball.x - ball.r <= 0) {
				ball.vx = -ball.vx;
				ball.x = ball.r;
			}
		}
	}

	//Function to check collision between ball and one of
	//the paddles
	function collides(b, p) {
		if(b.x + ball.r >= p.x && b.x - b.r <= p.x + p.w) {
			//if(b.y >= (p.y - p.h) && p.y > 0){
			if(b.y >= (p.y - b.r) && p.y > 0){
				paddleHit = 1;
				return true;
			}else if(b.y <= p.h && p.y == 0) {
				paddleHit = 2;
				return true;
			}

			else return false;
		}
	}

	//Do this when collides == true
	function collideAction(ball, p) {
		ball.vy = -ball.vy;
		ball.to = "green";
		if(paddleHit == 1) {
			ball.y = p.y - ball.r;
			paddles[2].x = (W - paddles[2].w)/2;

			count++;
			points+=level;
			increaseSpd();


		}

		else if(paddleHit == 2) {
			ball.y = p.h + ball.r;

		}


		if(collision) {
				collision.currentTime = 0;
				collision.play();
		}
	}


	// Function for updating score
	function updateScore() {
		ctx.fillStlye = "white";
		ctx.font = "16px Arial, sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Score: " + points, 20, 20 );
	}

	// Function to run when the game overs
	function gameOver() {
		ctx.fillStlye = "white";
		ctx.font = "20px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		var message;
		var localHighScore;

		if (typeof(Storage) != "undefined") {
			localHighScore = localStorage.getItem("highscore");			
		}

		if(localHighScore != null){			
			localHighScore = parseInt(localHighScore);
			if(localHighScore > highscore){
				highscore = localHighScore;
			}
		}

		if(points > highscore){
			
			if (typeof(Storage) != "undefined") {
				localStorage.setItem("highscore", points);				
			}
			highscore = points;
			ctx.drawImage(imgTro, (W - 150)/2, 40);
			message = "New high score: " + points;
		} else if(points >= 50) {
			ctx.drawImage(imgNic, (W - 150)/2, 40);
			message = "Current High score - " + highscore + " Your score: " + points;			
		} else {
			ctx.drawImage(imgEmb, (W - 150)/2, 40);
			message = "Current High score - " + highscore + " Your score: " + points;
		}
		
		ctx.fillText("Game Over - " + message + " points!", W/2, H/2 + 25 );

		// Stop the Animation
		cancelRequestAnimFrame(init);

		// Set the over flag
		over = 1;
		if(crash) {
				crash.currentTime = 0;
				crash.play();
		}
		paused = -1;
		// Show the restart button
		restartBtn.draw();
	}

	// Function for running the whole animation
	function animloop() {
		init = requestAnimFrame(animloop);
		draw();
	}

	// Function to execute at startup
	function startScreen() {
		draw();
		startBtn.draw();
	}

	// On button click (Restart and start and resume)
	function btnClick(e) {

		// Variables for storing mouse position on click
		var mx = e.pageX - X,
				my = e.pageY - Y;

		// Click start button
		if(mx >= startBtn.x && mx <= startBtn.x + startBtn.w) {
			level = parseInt(document.getElementById("level").value);
			document.getElementById("curLevel").innerHTML = level;
			ball.vx = level;
			ball.vy = ball.vx * 2;
			paused = false;
			animloop();			
			// Delete the start button after clicking it
			startBtn = {};
		}

		// Click Resume button
		if(paused && mx >= pauseBtn.x && mx <= pauseBtn.x + pauseBtn.w) {
			paused = false;
			animloop();
		}

		// If the game is over, and the restart button is clicked
		if(over == 1) {
			if(mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) {
				if(crash) {
					crash.pause();
				}

				ball.x = 50;
				ball.y = 50;
				points = 0;
				count = 0;
				level = parseInt(document.getElementById("level").value);
				document.getElementById("curLevel").innerHTML = level;
				ball.to = "green";
				paddles[2].x = (W - paddles[2].w)/2;
				ball.vx = level;
				ball.vy = ball.vx * 2;
				paused = false;
				animloop();

				over = 0;
			}
		}
	}

	function keyupListener(event){		
		if (event.keyCode == 32 && paused != -1){
			if(!paused){

				if(collide) {
					collide.pause();
				}
				pauseBtn.draw();
				cancelRequestAnimFrame(init);
				paused = true;				

			}else{
				paused = false;
				animloop();				
			}
		}
	}

	// Show the start screen
	startScreen();