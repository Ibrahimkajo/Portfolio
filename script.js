// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const character = document.getElementById('character');
    character.classList.add('bee-moving');           // start bobbing immediately
    character.style.setProperty('--direction', '1'); // face right by default
    
    //character.classList.add('bee-moving')
    const pixelMap = document.getElementById('pixel-map');
    
    // Initial character position (center)
    let posX = 263;    // Same as #pipe-end-2 left
    let posY = 252;  // Same as #pipe-end-2 top

    // Mario sprite animation
    let marioFrame = 0;
    const marioFrameWidth = 78;
    const marioFrameOffsetYRight = -448; // row for walking right
    const marioFrameOffsetYLeft = -576;  // adjust based on sprite row for left
    const marioIdleOffsetX = -30;        // standing still
    const marioIdleOffsetY = -448;       // idle facing right
    let marioLastFrameTime = 0;
    const marioFrameDelay = 300;         // adjust for animation speed
    const leftFrames = [0, 2, 1];
    const rightFrames = [1, 2, 3]; // assuming index 0 is idle
    let showPipeCollisionFrame = false;
    let pipeCollisionStartTime = 0;
    const pipeCollisionDuration = 800; // milliseconds
    let isOnTopOfPipe = false;
    let iscollidingWithPipe = false;
    let isFalling = false;
    let isOnGround = true;
    let jumpCooldownUntil = 0;
    let controlsEnabled = false;
    let isExitingPipe = true;
    let showFlowerFall = false;
    let flowerFallStartTime = 0;
    let flowerFallingActive = false;

    exitPipeAnimation();    

    function exitPipeAnimation() {
        const targetY = 152; // Y position just above the pipe
        const speed = 2;

        function animateExit() {
            if (posY > targetY) {
                posY -= speed;
                character.style.top = posY + 'px';
                requestAnimationFrame(animateExit);
            } else {
                isExitingPipe = false;
                controlsEnabled = true;
                isOnTopOfPipe = true;
                isOnGround = false;
            }
        }

        animateExit();
    }  


    const coinContainer = document.getElementById('coin-background');
    const numberOfCoins = 15; // You can adjust this

    for (let i = 0; i < numberOfCoins; i++) {
        const coin = document.createElement('img');
        coin.src = 'images/mario-coin.gif'; // Replace with your path
        coin.classList.add('coin');
        coin.style.left = `${Math.random() * 100}vw`;
        coin.style.top = `${Math.random() * 100}vh`;
        coin.style.animationDelay = `${Math.random() * 5}s`;
        coinContainer.appendChild(coin);
    }

    const aboutSettings = document.querySelectorAll('.about-setting');
    const returnButton = document.getElementById('back-btn'); // You must give your button this ID

    let activeAboutIndex = 0;

    const settingOptions = [
    ['Ibrahim Kajo', 'Kajo Ibrahim', 'I.K.', 'Dr. Kajo', 'I.Kajo', 'Kajo.I'],
    ['CIAD Planet', 'Earth', 'Somewhere in France', 'Belfort-Montbéliard', 'Under a pixelated sky'],
    ['COMPUTER VISION','ELECTRICAL & ELECTRONICS','EE','DEEP PIXEL THINKING'],
    ['UTP','UNIVERSITI TEKNOLOGI PETRONAS'],
    ['MECHATRONICS','MECHANICAL & ELECTRICAL', 'ELECTRICAL & MECHANICAL'],
    ['TISHREEN UNIVERSITY','LATTAKIA UNIVERSITY'],
    ['ASSISTANT PROFESSOR','MAITRE DE CONFERENCE','MCF','Lecturer in the Pixel Realm'],
    ['UTBM','Université de technologie..','de Belfort Montbéliard','UTBM Pixelverse'],
    ['English', 'French', 'Arabic', 'Fluent in Python','bit of German syntax errors'],
    ['VIDEO GAMES','SWIMMING','Pixel-perfect perfectionism'],
    ['Born in pixels, raised in code', 'Trained in retro realms', 'Forever debugging']
    ];

    function updateHighlight() {
    aboutSettings.forEach((el, i) => {
        el.classList.toggle('active-setting', i === activeAboutIndex);
    });

    // Handle Return button highlight
    if (activeAboutIndex === aboutSettings.length) {
        returnButton.classList.add('active-setting');
    } else {
        returnButton.classList.remove('active-setting');
    }
    }

    function updateValue(dir) {
    if (activeAboutIndex >= settingOptions.length) return; // Skip if "Return" is selected
    const values = settingOptions[activeAboutIndex];
    const valueEl = aboutSettings[activeAboutIndex].querySelector('.value');
    const currentValue = valueEl.textContent;
    let index = values.indexOf(currentValue);
    index = dir === 'left'
        ? (index - 1 + values.length) % values.length
        : (index + 1) % values.length;
    valueEl.textContent = values[index];
    }

    document.addEventListener('keydown', (e) => {
    const aboutBox = document.getElementById('about-expanded');
    if (aboutBox.style.display === 'block' || aboutBox.style.display === 'flex') {
        if (e.key === 'ArrowDown') {
        activeAboutIndex = (activeAboutIndex + 1) % (aboutSettings.length + 1); // +1 for return
        updateHighlight();
        } else if (e.key === 'ArrowUp') {
        activeAboutIndex = (activeAboutIndex - 1 + aboutSettings.length + 1) % (aboutSettings.length + 1);
        updateHighlight();
        } else if (e.key === 'ArrowLeft') {
        updateValue('left');
        } else if (e.key === 'ArrowRight') {
        updateValue('right');
        } else if (e.key === 'Enter' && activeAboutIndex === aboutSettings.length) {
        returnButton.click(); // Trigger return action
        }
    }
    });

    updateHighlight(); // Initialize
       
    let publications = [];

    async function loadAndDisplayPublications() {
        const res = await fetch('texts/publication.txt');
        const text = await res.text();

        const entries = text.split('@').filter(Boolean);
        const publications = [];

        entries.forEach((entry, index) => {
            const titleMatch = entry.match(/title=\{(.+?)\}/s);
            const authorMatch = entry.match(/author=\{(.+?)\}/s);
            const journalMatch = entry.match(/journal=\{(.+?)\}/s);
            const booktitleMatch = entry.match(/booktitle=\{(.+?)\}/s); // fallback
            const yearMatch = entry.match(/year=\{(.+?)\}/s);
            const doiMatch = entry.match(/DOI=\{(.+?)\}/s);

            const title = titleMatch ? titleMatch[1] : '';
            const authors = authorMatch ? authorMatch[1] : '';
            const venue = journalMatch ? journalMatch[1] : (booktitleMatch ? booktitleMatch[1] : '');
            const year = yearMatch ? yearMatch[1] : '';
            const doi = doiMatch ? doiMatch[1] : '';

            publications.push({
                title,
                authors,
                venue,
                year,
                doi,
            });
        });

        animatePublications(publications);
    }

    function animatePublications(publications) {
        const container = document.getElementById('publication-container');
        container.innerHTML = '';
        let currentIndex = 0;

        function typePublication(pub) {
            const div = document.createElement('div');
            div.classList.add('publication-entry');
            container.appendChild(div);

            // HTML-formatted content
            const htmlText =
                `<span style="color:#FFD700;">${currentIndex + 1}. ${pub.title}</span><br>` +
                `<span style="color:#87CEEB;">${pub.authors}</span><br>` +
                `<span style="color:#90EE90;">${pub.venue}, ${pub.year}</span><br>`;

            // Split into tokens: either HTML tags or characters
            const tokens = htmlText.match(/(<[^>]+>|[^<])/g);
            let i = 0;
            let displayed = '';

            function typeChar() {
                if (i < tokens.length) {
                    displayed += tokens[i];
                    div.innerHTML = displayed;
                    container.scrollTop = container.scrollHeight;
                    i++;
                    setTimeout(typeChar, 1);
                } else {
                    if (pub.doi) {
                        const doiLink = document.createElement('a');
                        doiLink.href = `https://doi.org/${pub.doi}`;
                        doiLink.target = '_blank';
                        doiLink.textContent = 'View DOI';
                        doiLink.classList.add('retro-doi-button');
                        const doiWrapper = document.createElement('div');
                        doiWrapper.style.marginTop = '4px';  // reduced top margin
                        doiWrapper.appendChild(doiLink);
                        div.appendChild(doiWrapper);
                    }

                    currentIndex++;
                    if (currentIndex < publications.length) {
                        setTimeout(() => typePublication(publications[currentIndex]), 25);
                    } else {
                        document.getElementById('back-skills-btn').style.display = 'block';
                    }
                }
            }

            typeChar();
        }


        if (publications.length > 0) {
            typePublication(publications[0]);
        }
    }
    

    

    let moveX = 0; // Track horizontal movement direction
    let moveY = 0;
    let lastDirection = 'right';
    const speed = 5;
    let gamePaused = false; 
    const buzzAudio = document.getElementById('buzz-sfx');
    buzzAudio.volume = 0.03; // adjust as needed
    let lastBuzzTime = 0;
    const buzzDelay = 300; // milliseconds between buzzes
    let isJumping = false;
    let jumpStartTime = 0;
    const jumpDuration = 600; // in ms
    let initialJumpY = posY;


    
    // Keyboard state
    const keys = {
        ArrowLeft: false,
        Space: false,
        ArrowRight: false
    };
    
    // Keyboard listeners
    document.addEventListener('keydown', function(e) {
        if (gamePaused) return; //
        if (e.key in keys) {
            keys[e.key] = true;
            e.preventDefault(); // Prevent default scrolling
        }
    });
    
    document.addEventListener('keyup', function(e) {
        if (gamePaused) return; //
        if (e.key in keys) {
            keys[e.key] = false;
        }
    });

    document.addEventListener("keydown", e => {
        if (e.code === "ArrowLeft") keys.ArrowLeft = true;
        if (e.code === "ArrowRight") keys.ArrowRight = true;
        if (e.code === "Space") keys.Space = true;
    });
    
    document.addEventListener("keyup", e => {
        if (e.code === "ArrowLeft") keys.ArrowLeft = false;
        if (e.code === "ArrowRight") keys.ArrowRight = false;
        if (e.code === "Space") keys.Space = false;
    });
    
    // Game loop
    function update() {

        if (gamePaused) {
            requestAnimationFrame(update);
            return;
        }
    
        const popup = document.getElementById('retro-popup');
        moveX = 0;
        moveY = 0;
    
        if (popup.style.display !== 'flex') {
            const now = Date.now();

            if (keys.Space && !isJumping && !isExitingPipe && !iscollidingWithPipe && Date.now() > jumpCooldownUntil) {
                isJumping = true;
                jumpStartTime = now;
                initialJumpY = posY; // Save Y position before jump
                initialJumpX = posX; // 🆕 Track X at jump start

                // 🔊 Play jump sound ONCE at start of jump
                const jumpAudio = document.getElementById('jump-sfx');
                jumpAudio.volume = 0.10;
                jumpAudio.currentTime = 0;
                jumpAudio.play().catch(() => {});
            }
            
            if (isJumping && !isExitingPipe) {
                const offsetY = lastDirection === 'right' ? marioFrameOffsetYRight : marioFrameOffsetYLeft;
                const offsetX = marioIdleOffsetX - 4 * marioFrameWidth;
                character.style.backgroundPosition = `${offsetX + 11}px ${offsetY}px`;
            
                const t = (now - jumpStartTime) / jumpDuration;
                const jumpHeight = 100;
            
                // By default — vertical
                let yOffset = -4 * jumpHeight * t * (1 - t);
                posY = initialJumpY + yOffset;
            
                // Check for curved jump condition
                if (keys.ArrowRight || keys.ArrowLeft) {
                    const jumpDistance = 60;
                    const xOffset = keys.ArrowRight
                        ? t * jumpDistance
                        : -t * jumpDistance;
            
                    posX = initialJumpX + xOffset;
                }
            
                if (now - jumpStartTime > jumpDuration) {
                    isJumping = false;
                    posY = initialJumpY;
            
                    if (keys.ArrowRight || keys.ArrowLeft) {
                        const jumpDistance = 60;
                        posX = initialJumpX + (keys.ArrowRight ? jumpDistance : -jumpDistance);
                    } else {
                        posX = initialJumpX;
                    }
                }
            }
            
            

            if (showPipeCollisionFrame) {
                const now = Date.now();
                if (now - pipeCollisionStartTime < pipeCollisionDuration) {
                    const offsetY = lastDirection === 'right' ? marioFrameOffsetYRight : marioFrameOffsetYLeft;
                    let offsetX;
            
                    if (lastDirection === 'right') {
                        offsetX = marioIdleOffsetX - 5 * marioFrameWidth; // right collision
                    } else {
                        offsetX = marioIdleOffsetX - 5 * marioFrameWidth; // left collision (after jump)
                    }
            
                    character.style.backgroundPosition = `${offsetX + 11}px ${offsetY}px`;
            
                    moveX = 0;
                    moveY = 0;
                } else {
                    showPipeCollisionFrame = false;
                    iscollidingWithPipe = false;
                }
            
                requestAnimationFrame(update);
                return;
            }

            // First show the falling frame (once)
            if (showFlowerFall) {
                const now = Date.now();
                buzzAudio.pause();

                // Play crash sound
                const crashAudio = document.getElementById('death-sfx');
                crashAudio.currentTime = 0;
                crashAudio.volume = 0.2;
                crashAudio.play().catch(() => {});

                if (!flowerFallingActive) {
                    flowerFallingActive = true;

                    // Always same row as right-facing
                    const fallOffsetY = marioFrameOffsetYRight;
                    const fallOffsetX = marioIdleOffsetX - 6 * (marioFrameWidth);
                    const enlargedWidth = marioFrameWidth + 15; // add 10px
                    character.style.width = `${enlargedWidth}px`;
                    character.style.backgroundPosition = `${fallOffsetX+10}px ${fallOffsetY}px`;

                    moveX = 0; // stop movement
                    moveY = 0;

                    // Wait 1s, then start blinking
                    setTimeout(() => {
                        let blinkCount = 0;
                        const blinkInterval = setInterval(() => {
                            character.style.visibility = 
                                character.style.visibility === "hidden" ? "visible" : "hidden";
                            blinkCount++;
                            if (blinkCount >= 6) { // 3 full blinks
                                clearInterval(blinkInterval);
                                character.style.visibility = "hidden"; // hide completely

                                // Show Game Over window
                                showGameOverWindow();

                                // Restart after short delay
                                setTimeout(() => {
                                    location.reload(); // reload page
                                }, 1500);
                            }
                        }, 200); // blink speed
                    }, 1000);
                }
                flowerFallingActive = false;
                return; // stop update loop during animation
            }


    
        
            // Movement and animation
            if (!isJumping && !isExitingPipe) {
                
                if (keys.ArrowRight) {
                    moveX += speed;
                    lastDirection = 'right';
                    if (now - marioLastFrameTime > marioFrameDelay) {
                        marioFrame = (marioFrame + 1) % rightFrames.length;
                        marioLastFrameTime = now;
                    }
                    const frameIndex = rightFrames[marioFrame];
                    const offsetX = marioIdleOffsetX - frameIndex * marioFrameWidth;
                    const offsetY = marioFrameOffsetYRight;
                    character.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
                
                } else if (keys.ArrowLeft) {
                    moveX -= speed;
                    lastDirection = 'left';
                    if (now - marioLastFrameTime > marioFrameDelay) {
                        marioFrame = (marioFrame + 1) % leftFrames.length;
                        marioLastFrameTime = now;
                    }
                    const frameIndex = leftFrames[marioFrame];
                    const offsetX = marioIdleOffsetX - frameIndex * 0.95*marioFrameWidth;
                    const offsetY = marioFrameOffsetYLeft;
                    character.style.backgroundPosition = `${offsetX+8}px ${offsetY+4}px`;
                
                } else {
                    marioFrame = 0; // reset for clean next animation cycle
                    const offsetX = marioIdleOffsetX - (
                        lastDirection === 'right' ? 0 : 3 * marioFrameWidth
                    );
                    const offsetY = lastDirection === 'right' ? marioFrameOffsetYRight : marioFrameOffsetYLeft;
                    character.style.backgroundPosition = `${offsetX+8}px ${offsetY+3}px`;
                }
            }

            if (keys.ArrowUp) moveY -= speed;
            if (keys.ArrowDown) moveY += speed;
    
            // Boundaries
            posX = Math.max(0, Math.min(pixelMap.offsetWidth - 32, posX + moveX));
            posY = Math.max(0, Math.min(pixelMap.offsetHeight - 32, posY + moveY));

            if (posY == 250) isOnGround = true;
    
            // Update position
            character.style.left = posX + 'px';
            character.style.top = posY + 'px';
    
            
            
    
            // Buzz logic (keep if you want to play sound on move)
            if (moveX !== 0 || moveY !== 0) {
                if (now - lastBuzzTime > buzzDelay) {
                    buzzAudio.currentTime = 0;
                    buzzAudio.play().catch(() => {});
                    lastBuzzTime = now;
                }
            } else {
                buzzAudio.pause();
                buzzAudio.currentTime = 0;
            }
    
            // Collision check
            checkSectionCollisions();
            if (!flowerFallingActive){
                checkFlowerCollision();
            }
            if (!isOnTopOfPipe && !isFalling && !isExitingPipe && !flowerFallingActive) {
                checkPipeCollision();
            }
            // Only check for falling if not jumping
            if (!isJumping && !isFalling && !isOnGround) {
                checkIfShouldFall();
            }

        }
    
        requestAnimationFrame(update);
    }
    

    function showGameOverWindow() {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = "gameOverOverlay";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";
        overlay.style.fontFamily = "'Press Start 2P', monospace"; // retro font
        overlay.style.color = "#ff0000";
        overlay.style.textAlign = "center";

        // Main title
        const title = document.createElement("div");
        title.style.fontSize = "32px";
        title.textContent = "GAME OVER";

        // Subtext
        const subtext = document.createElement("div");
        subtext.style.fontSize = "18px";
        subtext.style.marginTop = "10px";
        subtext.style.color = "#ffffff";
        subtext.textContent = "TRY AGAIN";

        // Append to overlay
        overlay.appendChild(title);
        overlay.appendChild(subtext);
        document.body.appendChild(overlay);
    }

   
    // Check if character reaches a section marker
    let currentSection = null;
    let focusedButton = 'confirm-btn';

    function checkSectionCollisions() {
        document.querySelectorAll('.section-marker').forEach(marker => {
            const markerRect = marker.getBoundingClientRect();
            const charRect   = character.getBoundingClientRect();

            const overlap =
                charRect.right  > markerRect.left  &&
                charRect.left   < markerRect.right &&
                charRect.bottom > markerRect.top   &&
                charRect.top    < markerRect.bottom;

            if (overlap) {
                if (currentSection !== marker.id) {
                    currentSection = marker.id;

                    // Stop buzz sound
                    buzzAudio.pause();
                    buzzAudio.currentTime = 0;

                    // Play collision sound
                    const collisionAudio = document.getElementById('collision-sfx');
                    collisionAudio.currentTime = 0;
                    collisionAudio.volume = 0.10;
                    collisionAudio.play().catch(() => {});
                    
                    showRetroPopup(marker);

                    /* ---- choose ONE direction to push ---- */
                    const pushLeft  = Math.abs(charRect.right  - markerRect.left);
                    const pushRight = Math.abs(markerRect.right - charRect.left);
                    const pushUp    = Math.abs(charRect.bottom - markerRect.top);
                    const pushDown  = Math.abs(markerRect.bottom - charRect.top);

                    const offset = 3;                      // small gap
                    const minPush = Math.min(pushLeft, pushRight, pushUp, pushDown);

                    if      (minPush === pushLeft)  posX -= (pushLeft  + offset);
                    else if (minPush === pushRight) posX += (pushRight + offset);
                    else if (minPush === pushUp)    posY -= (pushUp    + offset);
                    else                            posY += (pushDown  + offset);

                    /* clamp to map bounds */
                    posX = Math.max(0, Math.min(pixelMap.offsetWidth  - 32, posX));
                    posY = Math.max(0, Math.min(pixelMap.offsetHeight - 32, posY));

                    /* apply immediately */
                    character.style.left = posX + 'px';
                    character.style.top  = posY + 'px';
                }
            } else if (currentSection === marker.id) {
                currentSection = null;
            }
        });
    }

    function checkFlowerCollision() {
        const flower = document.querySelector('.mario-flower');
        const flowerRect = flower.getBoundingClientRect();
        const marioRect = character.getBoundingClientRect();

        if (
            marioRect.right > flowerRect.left &&
            marioRect.left < flowerRect.right &&
            marioRect.bottom > flowerRect.top &&
            marioRect.top < flowerRect.bottom
        ) {
            // Trigger flower fall animation
            showFlowerFall = true;
            flowerFallStartTime = Date.now();
        }
    }

    function checkPipeCollision() {

        const pipes = [
            document.getElementById('pipe-end-1'),
            document.getElementById('pipe-end-2'),
            document.getElementById('pipe-flower'),
            document.getElementById('pipe-end-3')
        ];

        pipes.forEach(pipe => {
            const pipeRect = pipe.getBoundingClientRect();
            const charRect = character.getBoundingClientRect();

            const overlap = (
                charRect.right > pipeRect.left &&
                charRect.left < pipeRect.right &&
                charRect.bottom > pipeRect.top &&
                charRect.top < pipeRect.bottom
            );

            if (overlap) {
                const tolerance = 6; // pixels
                const charBottom = charRect.bottom;
                const pipeTop = pipeRect.top;

                // NEW: Calculate horizontal overlap
                const overlapWidth = Math.min(charRect.right, pipeRect.right) - Math.max(charRect.left, pipeRect.left);
                const requiredHorizontalOverlap = character.offsetWidth * 0.4; // Require 50% of Mario's width over the pipe

                // Check if Mario is landing on top
                if (
                    charBottom >= pipeTop - tolerance &&
                    charBottom <= pipeTop + tolerance &&
                    overlapWidth >= requiredHorizontalOverlap // NEW condition
                ) {
                    isOnTopOfPipe = true;
                    jumpCooldownUntil = Date.now() + 300;

                    // Snap Mario perfectly to pipe top
                    const pipeTopRelativeToMap = pipe.offsetTop;
                    posY = pipeTopRelativeToMap - character.offsetHeight+5;

                    character.style.top = posY + 'px';

                    // Cancel jump (if needed)
                    isJumping = false;
                    isOnGround = false;

                    return; // ✅ Exit early — skip normal collision
                } else {
                    isOnTopOfPipe = false;
                }

                // [✴️] Only run pipe pushback animation if Mario is NOT jumping or standing on pipe
                if (!isJumping && !isOnTopOfPipe) {
                    // Show animation + push
                    showPipeCollisionFrame = true;
                    iscollidingWithPipe = true;
                    pipeCollisionStartTime = Date.now();
                    buzzAudio.pause();
                    buzzAudio.currentTime = 0;

                    // Push Mario away from pipe (same as before)
                    const pushLeft  = Math.abs(charRect.right  - pipeRect.left);
                    const pushRight = Math.abs(pipeRect.right - charRect.left);
                    const pushUp    = Math.abs(charRect.bottom - pipeRect.top);
                    const pushDown  = Math.abs(pipeRect.bottom - charRect.top);
                    const offset = 4;
                    const minPush = Math.min(pushLeft, pushRight, pushUp, pushDown);

                    if (minPush === pushLeft) {
                        posX -= (pushLeft + offset);
                    } else if (minPush === pushRight) {
                        posX += (pushRight + offset);
                    } else if (minPush === pushUp) {
                        posY -= (pushUp + offset);
                    } else {
                        posY += (pushDown + offset);
                    }

                    // Clamp
                    posX = Math.max(0, Math.min(pixelMap.offsetWidth - 32, posX));
                    posY = Math.max(0, Math.min(pixelMap.offsetHeight - 32, posY));
                    character.style.left = posX + 'px';
                    character.style.top = posY + 'px';

                    // Play crash sound
                    const crashAudio = document.getElementById('crash-sfx');
                    crashAudio.currentTime = 0;
                    crashAudio.volume = 0.2;
                    crashAudio.play().catch(() => {});
                }
            }
        });
    
    }

    function checkIfShouldFall() {
        const marioBottom = posY + character.offsetHeight;

        // Check if Mario is directly above ANY support (pipe or ground)
        let supported = false;

        document.querySelectorAll('.mario-pipe, .mario-ground').forEach((el) => {
            const rect = el.getBoundingClientRect();
            const charRect = character.getBoundingClientRect();

            const isHorizontallyAligned = (
            charRect.right > rect.left &&
            charRect.left < rect.right
            );

            const isRightAbove = (
            Math.abs(charRect.bottom - rect.top) <= 5
            );

            if (isHorizontallyAligned && isRightAbove) {
            supported = true;
            }
        });

        if (!supported) {
            isFalling = true;
            startFalling();
        }
    }

    function startFalling() {
        const fallInterval = setInterval(() => {
            posY += 5; // Fall speed

            // Clamp to bottom
            if (posY > pixelMap.offsetHeight - character.offsetHeight) {
            posY = pixelMap.offsetHeight - character.offsetHeight;
            clearInterval(fallInterval);
            isFalling = false;
            isOnTopOfPipe = false;
            return;
            }

            character.style.top = posY + 'px';

            // Check if landed on something (pipe or ground)
            const charRect = character.getBoundingClientRect();
            let landed = false;

            document.querySelectorAll('.mario-pipe, .mario-ground').forEach((el) => {
            const rect = el.getBoundingClientRect();

            const isHorizontallyAligned = (
                charRect.right > rect.left &&
                charRect.left < rect.right
            );

            const isLandingOnTop = (
                Math.abs(charRect.bottom - rect.top) <= 4
            );

            if (isHorizontallyAligned && isLandingOnTop) {
                // Snap to surface
                posY = el.offsetTop - character.offsetHeight;
                character.style.top = posY + 'px';

                clearInterval(fallInterval);
                isFalling = false;

                // Update pipe flag
                isOnTopOfPipe = el.classList.contains('mario-pipe');
                landed = true;
            }
            });

            if (landed) return;
        },12);
    }



    //ddfd
// MODIFIED POPUP KEYBOARD HANDLING
    function showRetroPopup(marker) {
        const popup = document.getElementById('retro-popup');
        //const sectionName = document.getElementById('section-name');
        const sectionId = marker.id.replace('-marker', '');
        
        //sectionName.textContent = sectionId.toUpperCase();
        popup.style.display = 'flex';
        
        // Reset button focus to OK (top button)
        focusedButton = 'confirm-btn';
        updateButtonFocus();
        
        // Button click handlers
        document.getElementById('confirm-btn').onclick = confirmAction;
        document.getElementById('cancel-btn').onclick = cancelAction;
        
        // NEW KEYBOARD HANDLING FOR VERTICAL NAV
        function handlePopupKey(e) {
            switch(e.key) {
                case 'ArrowUp':
                    focusedButton = 'confirm-btn'; // Select top button
                    updateButtonFocus();
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    focusedButton = 'cancel-btn'; // Select bottom button
                    updateButtonFocus();
                    e.preventDefault();
                    break;
                case 'Enter':
                    // Execute current focused button action
                    if (focusedButton === 'confirm-btn') {
                        confirmAction();
                    } else {
                        cancelAction();
                    }
                    e.preventDefault();
                    break;
                case 'Escape':
                    cancelAction(); // ESC always cancels
                    e.preventDefault();
                    break;
            }
        }

        function confirmAction() {
            popup.style.display = 'none';

            if (sectionId === 'about') {
                showAboutExpanded();
            } else if (sectionId === 'skills') {
                showSkillsExpanded();
            } else if (sectionId === 'projects') {
                showProjectsExpanded();
            } else if (sectionId === 'credits') {
                blinkMarkerThenShowCredits();
            } else if (sectionId === 'contact')  {
                showContactExpanded();
            } else {
                showSection(sectionId);
                document.getElementById('game-container').style.display = 'none';
            }

            document.removeEventListener('keydown', handlePopupKey);
        }

        function cancelAction() {
            popup.style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';
            document.removeEventListener('keydown', handleAboutKey);
            currentSection = null;
        }
        
        document.addEventListener('keydown', handlePopupKey);
    }

    // MODIFIED ABOUT VIEW KEYBOARD CONTROLS
    function showAboutExpanded() {
        gamePaused = true; 
        const aboutExpanded = document.getElementById('about-expanded');
        const gameContainer = document.getElementById('game-container');
        const backBtn = document.getElementById('back-btn');

        
        // Hide game map and show about section
        gameContainer.style.display = 'none';
        aboutExpanded.style.display = 'flex';
        
        // Store the key handler so we can remove it later
        let aboutKeyHandler;
        
        // Auto-focus back button
        setTimeout(() => backBtn.focus(), 100);
        
        // Keyboard controls
        aboutKeyHandler = function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeAboutExpanded();
            }
        };
        
        // Mouse click handler
        backBtn.onclick = function() {
            closeAboutExpanded();
        };
        
        // Add keyboard listener
        document.addEventListener('keydown', aboutKeyHandler);
        
        function closeAboutExpanded() {
            // 1. First hide the about expanded view
            gamePaused = false; 
            aboutExpanded.style.display = 'none';
            
            // 2. Completely reset the popup state
            document.getElementById('retro-popup').style.display = 'none';
                       
            // 3. Show the main game map
            gameContainer.style.display = 'flex';
            
            // 4. Reset section tracking
            currentSection = null;
            
            // 5. Remove the keyboard listener
            document.removeEventListener('keydown', aboutKeyHandler);
            
            // 6. Remove any active sections
            document.querySelectorAll('section').forEach(sec => {
                sec.classList.remove('active');
            });
        }
    }

    function showSkillsExpanded() {
        gamePaused = true;
        const skillsExpanded = document.getElementById('skills-expanded');
        const gameContainer = document.getElementById('game-container');
        const backBtn = document.getElementById('back-skills-btn-1');

        

        gameContainer.style.display = 'none';
        skillsExpanded.style.display = 'flex';
        

        let skillsKeyHandler;

        setTimeout(() => backBtn.focus(), 100);

        skillsKeyHandler = function(e) {
            if ( e.key === 'Escape') {
                e.preventDefault();
                closeSkillsExpanded();
            }
        };

        backBtn.onclick = function() {
            closeSkillsExpanded();
        };

        document.addEventListener('keydown', skillsKeyHandler);

        function closeSkillsExpanded() {
            gamePaused = false;
            skillsExpanded.style.display = 'none';
            document.getElementById('retro-popup').style.display = 'none';
            gameContainer.style.display = 'flex';
            currentSection = null;
            document.removeEventListener('keydown', skillsKeyHandler);
            document.querySelectorAll('section').forEach(sec => {
                sec.classList.remove('active');
            });
        }
    }

    function showProjectsExpanded() {
        gamePaused = true;
        const projectsExpanded = document.getElementById('projects-expanded');
        const gameContainer = document.getElementById('game-container');
        const publicationContainer = document.getElementById('publication-container');
        const backBtn = document.getElementById('back-skills-btn');

        gameContainer.style.display = 'none';
        projectsExpanded.style.display = 'flex';
        publicationContainer.textContent = "";

        // 🔊 Play background music
        const background_music = document.getElementById('Publication-sfx');
        background_music.volume = 0.2;
        background_music.currentTime = 0;
        background_music.play().catch(() => {});

        // Animate health bar
        const healthFill = document.getElementById('health-fill');
        healthFill.style.width = '0';

        // Animate from 0% to 100% (17 publications)
        setTimeout(() => {
            healthFill.style.width = '80%';
        }, 100);

        loadAndDisplayPublications();
    

        let projectsKeyHandler;

        setTimeout(() => backBtn.focus(), 100);

        projectsKeyHandler = function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeProjectExpanded();
            }
        };

        backBtn.onclick = function() {
            closeProjectExpanded();
            backBtn.style.display = 'none';
        };

        document.addEventListener('keydown', projectsKeyHandler);

        function closeProjectExpanded() {
            gamePaused = false;
            projectsExpanded.style.display = 'none';
            document.getElementById('retro-popup').style.display = 'none';
            gameContainer.style.display = 'flex';
            background_music.pause();
            background_music.currentTime = 0;
            currentSection = null;
            document.removeEventListener('keydown', projectsKeyHandler);
            document.querySelectorAll('section').forEach(sec => {
                sec.classList.remove('active');
            });
        }
    }

    function showContactExpanded() {
        gamePaused = true;
        const contactExpanded = document.getElementById('contact-expanded');
        const gameContainer = document.getElementById('game-container');
        const backBtn = document.getElementById('back-btn-1');
        const pigeon = document.querySelector('.retro-pigeon');
        const pigeonSound = document.getElementById('pigeon-sfx');
        let hasFlown = false; // 🛡️ Prevent double trigger

        gameContainer.style.display = 'none';
        contactExpanded.style.display = 'flex';

        // 🕊️ Reset pigeon animation and sound
        pigeon.classList.remove('fly-away');
        pigeon.style.animation = 'none';
        pigeon.offsetHeight; // 💡 Force reflow to reset animation
        pigeon.style.animation = null;
        

        // Optional: remove inline animation if previously set
        // pigeon.style.removeProperty('animation');

        function triggerPigeonFly() {
            if (hasFlown) return; // 🔒 block if already flown
            hasFlown = true;
            pigeonSound.currentTime = 0;
            pigeonSound.play().catch(() => {});
            pigeon.classList.add('fly-away');
        }

        // ✅ Only set the timeout after the section is visible
        const flyTimeout = setTimeout(() => {
            triggerPigeonFly();
        }, 10000);

        // 🕊️ Allow manual trigger
        pigeon.onclick = () => triggerPigeonFly();

        setTimeout(() => backBtn.focus(), 100);

        let contactKeyHandler = function (e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeContactExpanded();
            }
        };

        backBtn.onclick = function () {
            closeContactExpanded();
        };

        document.addEventListener('keydown', contactKeyHandler);

        function closeContactExpanded() {
            gamePaused = false;
            contactExpanded.style.display = 'none';
            document.getElementById('retro-popup').style.display = 'none';
            gameContainer.style.display = 'flex';
            currentSection = null;
            document.removeEventListener('keydown', contactKeyHandler);
            document.querySelectorAll('section').forEach(sec => {
                sec.classList.remove('active');
            });

            // 🧼 Cleanup: stop sound and clear timeout
            pigeonSound.pause();
            pigeonSound.currentTime = 0;
            clearTimeout(flyTimeout);
        }
    }

    function blinkMarkerThenShowCredits() {
        const creditsMarker = document.getElementById('credits-marker');
        creditsMarker.style.opacity = '1'; 

        let blinkCount = 0;
        const maxBlinks = 6; // 3 full blinks
        const blinkIntervalMs = 200;

        creditsMarker.style.pointerEvents = 'none';

        const blinkInterval = setInterval(() => {
            creditsMarker.style.visibility = (creditsMarker.style.visibility === 'hidden') ? 'visible' : 'hidden';
            blinkCount++;

            if (blinkCount >= maxBlinks) {
                clearInterval(blinkInterval);
                creditsMarker.style.visibility = 'visible';  // ensure visible at the end
                creditsMarker.style.pointerEvents = 'auto';  // enable interaction

                // Now call your existing function to show the credits
                showCreditsExpanded();
            }
        }, blinkIntervalMs);
    }


    function showCreditsExpanded() {
        const creditsExpanded = document.getElementById('credits-expanded');
        const creditsList = document.getElementById('credits-list');
        const backBtn = document.getElementById('back-btn-credits');
        const gameContainer = document.getElementById('game-container');
        document.getElementById("pointer").style.display = "none";
        document.getElementById("pointer-text").style.display = "none";

        gamePaused = true;
        creditsExpanded.style.display = 'block';
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }

        // Clear previous contributors
        creditsList.innerHTML = '';

        // Contributors data
        const contributors = [
            { name: 'Me..................Developing', gif: 'images/funny-mario.gif' },
            { name: 'My wife................Concept', gif: 'images/funny-flower.gif'},
            { name: 'ChatGPT.....Debugging & Coding', gif: 'images/funny-mario-1.gif' }
        ];

        contributors.forEach(person => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '10px';

            const img = document.createElement('img');
            img.src = person.gif;
            img.alt = 'Mario';
            img.style.width = '64px';
            img.style.height = '64px';
            img.style.marginRight = '10px';

            const name = document.createElement('span');
            name.textContent = person.name;
            name.style.fontSize = '20px';

            row.appendChild(img);
            row.appendChild(name);
            creditsList.appendChild(row);
        });

        // Store the key handler so we can remove it later
        let creditsKeyHandler;

        // Auto-focus back button
        setTimeout(() => backBtn.focus(), 100);

        // Keyboard controls
        creditsKeyHandler = function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeCreditsExpanded();
            }
        };

        // Mouse click handler
        backBtn.onclick = function() {
            closeCreditsExpanded();
        };

        // Add keyboard listener
        document.addEventListener('keydown', creditsKeyHandler);

        function closeCreditsExpanded() {
            gamePaused = false;
            creditsExpanded.style.display = 'none';
            document.getElementById('retro-popup').style.display = 'none';
            gameContainer.style.display = 'flex';
            currentSection = null;
            document.removeEventListener('keydown', creditsKeyHandler);
            document.querySelectorAll('section').forEach(sec => {
                sec.classList.remove('active');
            });
        }
    }







    // SIMPLIFIED BUTTON FOCUS UPDATER
    function updateButtonFocus() {
        // Toggle active class based on focused button
        document.getElementById('confirm-btn').classList.toggle('active', focusedButton === 'confirm-btn');
        document.getElementById('cancel-btn').classList.toggle('active', focusedButton === 'cancel-btn');
    }

    function showSection(sectionId) {
        document.querySelectorAll('section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            section.scrollIntoView({ behavior: 'smooth' });
        }
        
        const marker = document.getElementById(`${sectionId}-marker`);
        if (marker) {
            marker.style.backgroundColor = 'rgba(255,255,0,0.5)';
            setTimeout(() => {
                marker.style.backgroundColor = 'rgba(0, 119, 181, 0.3)';
            }, 1000);
        }
    }    
    

    
    // Start the game
    update();
  
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

