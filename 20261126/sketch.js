
let characterSprite;
let walkSprite;
let magicSprite;
let magicEffectSprite;
let bgImage;

// 角色2設定
let character2StopSprite;
let character2ActionSprite;
let character2X;
let character2IsActive = false;
let character2StartFrame = 0;

const character2StopFrames = 8;
const character2ActionFrames = 12;

// 角色1狀態
let characterX;
let isWalking = false;
let facingDirection = 1;
let isCasting = false;
let magicStartFrame = 0;
let magicDirection = 1;
let spaceIsDown = false;
let activeEffects = [];

// 背景攝影機
let cameraX = 0;
let backgroundWidth = 0;
let worldWidth = 0;

const backgroundCount = 3;

// 動畫影格設定
const frameCountInSprite = 10;
const frameWidth = 139.5;
const frameHeight = 196;

const walkFrameCount = 9;
const walkFrameWidth = 1246 / 9;
const walkFrameHeight = 198;

const magicFrameCount = 4;
const magicFrameWidth = 1039 / 4;
const magicFrameHeight = 146;

const effectFrameCount = 5;
const effectFrameWidth = 740 / 5;
const effectFrameHeight = 19;

const framesPerStep = 8;

// ==================================
// 載入圖片
// ==================================

function preload() {
  bgImage = loadImage("bg/bg1.png");

  // 角色2圖片
  character2StopSprite = loadImage("2/stop/stop.png");
  character2ActionSprite = loadImage("2/action/aaction.png");

  // 角色1圖片
  characterSprite = loadImage("1/stop/stop.png");
  walkSprite = loadImage("1/walk/walk.png");
  magicSprite = loadImage("1/magic/magic.png");

  magicEffectSprite = loadImage(
    "1/magic_effect/magic_effect.png"
  );
}

// ==================================
// 初始化
// ==================================

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  frameRate(60);

  backgroundWidth = width;
  worldWidth = backgroundWidth * backgroundCount;

  // 角色2位於最左邊背景中央
  character2X = backgroundWidth / 2;

  // 初始顯示中間背景
  cameraX = backgroundWidth;

  // 角色1位於畫面2/3
  characterX = cameraX + width * 2 / 3;
}

// ==================================
// 主程式
// ==================================

function draw() {
  updateMovement();
  updateCamera();

  drawBackground();
  drawCharacter2();
  drawCharacter();
  drawMagicEffects();
}

// ==================================
// 角色1移動
// ==================================

function updateMovement() {
  const movingRight = keyIsDown(RIGHT_ARROW);
  const movingLeft = keyIsDown(LEFT_ARROW);

  isWalking = movingRight !== movingLeft;

  const movementStep = constrain(
    width * 0.004,
    2,
    8
  );

  const currentFrameWidth = isCasting
    ? magicFrameWidth
    : isWalking
    ? walkFrameWidth
    : frameWidth;

  const currentFrameHeight = isCasting
    ? magicFrameHeight
    : isWalking
    ? walkFrameHeight
    : frameHeight;

  // 角色高度固定為畫布1/3
  const characterHeight = height / 3;

  const characterWidth =
    currentFrameWidth *
    (characterHeight / currentFrameHeight);

  // 向右移動
  if (movingRight && !movingLeft) {
    facingDirection = 1;
    characterX += movementStep;
  }

  // 向左移動
  if (movingLeft && !movingRight) {
    facingDirection = -1;
    characterX -= movementStep;
  }

  // 限制角色不能離開地圖
  characterX = constrain(
    characterX,
    characterWidth / 2,
    max(characterWidth / 2, worldWidth - characterWidth / 2)
  );
}

// ==================================
// 攝影機跟隨角色
// ==================================

function updateCamera() {
  const anchorX = width * 2 / 3;

  const targetCameraX = characterX - anchorX;

  cameraX = constrain(
    targetCameraX,
    0,
    worldWidth - width
  );
}

// ==================================
// 繪製三張背景
// ==================================

function drawBackground() {
  push();

  imageMode(CORNER);

  for (let i = 0; i < backgroundCount; i++) {
    const bgX = i * backgroundWidth - cameraX;

    image(
      bgImage,
      bgX,
      0,
      backgroundWidth,
      height
    );
  }

  pop();
}

// ==================================
// 繪製角色1
// ==================================

function drawCharacter() {
  const targetCharacterHeight = height / 3;

  // 施法結束判斷
  if (
    isCasting &&
    frameCount - magicStartFrame >=
    magicFrameCount * framesPerStep
  ) {
    isCasting = false;

    const baseWidth =
      frameWidth *
      (targetCharacterHeight / frameHeight);

    activeEffects.push({
      x: characterX +
        magicDirection * baseWidth / 2,

      y: height -
        targetCharacterHeight * 0.58,

      direction: magicDirection
    });
  }

  // 選擇動畫
  const activeSprite = isCasting
    ? magicSprite
    : isWalking
    ? walkSprite
    : characterSprite;

  const activeFrameCount = isCasting
    ? magicFrameCount
    : isWalking
    ? walkFrameCount
    : frameCountInSprite;

  const activeFrameWidth = isCasting
    ? magicFrameWidth
    : isWalking
    ? walkFrameWidth
    : frameWidth;

  const activeFrameHeight = isCasting
    ? magicFrameHeight
    : isWalking
    ? walkFrameHeight
    : frameHeight;

  // 保持原始圖片比例
  const characterScale =
    targetCharacterHeight / activeFrameHeight;

  const activeWidth =
    activeFrameWidth * characterScale;

  const activeHeight =
    targetCharacterHeight;

  // 計算動畫影格
  const elapsedMagicFrames =
    frameCount - magicStartFrame;

  const frameIndex = isCasting
    ? min(
        magicFrameCount - 1,
        floor(elapsedMagicFrames / framesPerStep)
      )
    : floor(frameCount / framesPerStep) %
      activeFrameCount;

  const sourceX =
    frameIndex * activeFrameWidth;

  // 角色螢幕位置
  const screenX = characterX - cameraX;

  // 底部對齊畫布
  const characterY =
    height - activeHeight / 2;

  push();

  translate(screenX, characterY);

  // 左右翻轉
  scale(
    isCasting ? magicDirection : facingDirection,
    1
  );

  image(
    activeSprite,
    0,
    0,
    activeWidth,
    activeHeight,
    sourceX,
    0,
    activeFrameWidth,
    activeFrameHeight
  );

  pop();
}

// ==================================
// 魔法特效
// ==================================

function drawMagicEffects() {
  const targetCharacterHeight = height / 3;

  const effectScale =
    targetCharacterHeight / frameHeight;

  const effectWidth =
    effectFrameWidth * effectScale;

  const effectHeight =
    effectFrameHeight * effectScale;

  const effectSpeed = max(
    6,
    width * 0.008
  );

  for (
    let i = activeEffects.length - 1;
    i >= 0;
    i--
  ) {
    const effect = activeEffects[i];

    effect.x += effect.direction * effectSpeed;

    if (effect.x > worldWidth || effect.x < 0) {
      activeEffects.splice(i, 1);
      continue;
    }

    const screenX = effect.x - cameraX;

    const effectFrameIndex =
      floor(frameCount / framesPerStep) %
      effectFrameCount;

    push();

    translate(screenX, effect.y);

    scale(effect.direction, 1);

    image(
      magicEffectSprite,
      0,
      0,
      effectWidth,
      effectHeight,
      effectFrameIndex * effectFrameWidth,
      0,
      effectFrameWidth,
      effectFrameHeight
    );

    pop();
  }
}

// ==================================
// 鍵盤按下
// ==================================

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    facingDirection = 1;
    return false;
  }

  if (keyCode === LEFT_ARROW) {
    facingDirection = -1;
    return false;
  }

  // 空白鍵施放魔法
  if (keyCode === 32) {
    if (!spaceIsDown && !isCasting) {
      isCasting = true;
      magicStartFrame = frameCount;
      magicDirection = facingDirection;
    }

    spaceIsDown = true;
    return false;
  }
}

// ==================================
// 鍵盤放開
// ==================================

function keyReleased() {
  if (keyCode === 32) {
    spaceIsDown = false;
  }
}

// ==================================
// 視窗大小改變
// ==================================

function windowResized() {
  const oldWorldWidth = worldWidth;

  const characterProgress =
    oldWorldWidth > 0
      ? characterX / oldWorldWidth
      : 0.5;

  resizeCanvas(windowWidth, windowHeight);

  backgroundWidth = width;
  worldWidth = backgroundWidth * backgroundCount;

  // 重新設定角色2位置
  character2X = backgroundWidth / 2;

  characterX = constrain(
    characterProgress * worldWidth,
    0,
    worldWidth
  );

  updateCamera();

  activeEffects = [];
}

// ==================================
// 角色2動畫及互動功能
// ==================================

function drawCharacter2() {

  // 角色2高度為畫布1/3
  const targetHeight = height / 3;

  // 計算角色1與角色2的距離
  const distance = abs(characterX - character2X);

  // 判斷角色1是否接近角色2
  const near = distance <= targetHeight * 1.2;

  // 切換動畫時重新播放
  if (near !== character2IsActive) {
    character2IsActive = near;
    character2StartFrame = frameCount;
  }

  // 接近時播放action，遠離時播放stop
  const sprite = near
    ? character2ActionSprite
    : character2StopSprite;

  // 接近時12張影格，遠離時8張影格
  const count = near
    ? character2ActionFrames
    : character2StopFrames;

  // 自動取得圖片尺寸
  const sourceWidth = sprite.width / count;
  const sourceHeight = sprite.height;

  // 循環播放動畫
  const index = floor(
    (frameCount - character2StartFrame) / framesPerStep
  ) % count;

  // 依照圖片原始比例縮放
  const targetWidth =
    sourceWidth * targetHeight / sourceHeight;

  // 角色1在左側時，角色2向左轉
  // 角色1在右側時，角色2向右轉
  const direction = characterX < character2X
    ? -1
    : 1;

  push();

  imageMode(CENTER);

  // 角色2固定於背景中的位置
  translate(
    character2X - cameraX,
    height - targetHeight / 2
  );

  // 控制角色2左右轉向
  scale(direction, 1);

  // 顯示角色2動畫
  image(
    sprite,
    0,
    0,
    targetWidth,
    targetHeight,
    index * sourceWidth,
    0,
    sourceWidth,
    sourceHeight
  );

  pop();
}

// ========================================
// 數學闖關系統與特殊動畫
// ========================================

let quizVisible = false;
let quizCompleted = false;
let questionText = "";
let correctAnswer = 0;
let answerOptions = [];
let answerButtons = [];

let resultType = "";
let resultStartTime = 0;

let fireworks = [];
let lastFireworkTime = 0;
let hitDirection = 1;

let correctCount = 0;
let wrongCount = 0;

const resultDuration = 3000;

// 保留原本的程式功能
const originalDraw = draw;
const originalUpdateMovement = updateMovement;
const originalDrawCharacter = drawCharacter;
const originalKeyPressed = keyPressed;

// ========================================
// 更新主畫面
// ========================================

draw = function () {

  originalDraw();

  updateQuiz();

  if (quizVisible) {
    drawQuizPanel();
  }

  if (resultType === "correct") {
    drawFireworks();
    drawPowerAura();
    drawResultMessage("答對了！技能釋放！", true);
  }

  if (resultType === "wrong") {
    drawLightning();
    drawResultMessage(
      "答錯了！受到閃電攻擊！",
      false
    );
  }

  drawScore();
};

// ========================================
// 作答期間暫停角色移動
// ========================================

updateMovement = function () {

  if (quizVisible || resultType !== "") {
    isWalking = false;
    return;
  }

  originalUpdateMovement();
};

// ========================================
// 防止作答時使用其他技能
// ========================================

keyPressed = function () {

  if (quizVisible || resultType !== "") {
    return false;
  }

  return originalKeyPressed();
};

// ========================================
// 判斷角色距離與題目狀態
// ========================================

function updateQuiz() {

  let distance = abs(characterX - character2X);

  let nearDistance = height / 3 * 1.2;

  // 特效持續三秒
  if (resultType !== "") {

    if (
      millis() - resultStartTime >= resultDuration
    ) {
      resultType = "";
      fireworks = [];
    }

    return;
  }

  // 接近角色2時顯示題目
  if (
    distance <= nearDistance &&
    !quizCompleted &&
    !quizVisible &&
    !isCasting
  ) {
    generateQuestion();
    quizVisible = true;
  }

  // 遠離角色2後可以再次挑戰
  if (distance > nearDistance) {

    quizCompleted = false;
    quizVisible = false;

  }
}

// ========================================
// 隨機產生數學加法題
// ========================================

function generateQuestion() {

  let number1 = floor(random(1, 21));
  let number2 = floor(random(1, 21));

  correctAnswer = number1 + number2;

  questionText =
    number1 + " + " + number2 + " = ?";

  answerOptions = [correctAnswer];

  // 產生三個不重複的錯誤選項
  while (answerOptions.length < 4) {

    let wrongAnswer =
      correctAnswer + floor(random(-10, 11));

    if (
      wrongAnswer >= 0 &&
      !answerOptions.includes(wrongAnswer)
    ) {
      answerOptions.push(wrongAnswer);
    }
  }

  // 隨機排列答案
  answerOptions = shuffle(answerOptions);
}

// ========================================
// 繪製數學選擇題方框
// ========================================

function drawQuizPanel() {

  push();

  rectMode(CORNER);
  textAlign(CENTER, CENTER);

  let panelW = width / 3;
  let panelH = height / 2;

  let panelX = (width - panelW) / 2;
  let panelY = height * 0.025;

  // 黃色半透明方框
  stroke(255, 215, 0);
  strokeWeight(3);

  fill(255, 240, 0, 90);

  rect(
    panelX,
    panelY,
    panelW,
    panelH,
    16
  );

  // 標題
  noStroke();
  fill(60, 40, 10);

  textStyle(BOLD);
  textSize(min(panelW * 0.065, panelH * 0.10));

  text(
    "數學魔法挑戰",
    width / 2,
    panelY + panelH * 0.12
  );

  // 數學題目
  textSize(min(panelW * 0.10, panelH * 0.15));

  text(
    questionText,
    width / 2,
    panelY + panelH * 0.29
  );

  // 按鈕設定
  answerButtons = [];

  let buttonW = panelW * 0.40;
  let buttonH = panelH * 0.17;

  let gapX = panelW * 0.06;
  let gapY = panelH * 0.05;

  let startX = panelX + panelW * 0.07;
  let startY = panelY + panelH * 0.43;

  for (let i = 0; i < 4; i++) {

    let col = i % 2;
    let row = floor(i / 2);

    let bx = startX +
      col * (buttonW + gapX);

    let by = startY +
      row * (buttonH + gapY);

    let hover =
      mouseX >= bx &&
      mouseX <= bx + buttonW &&
      mouseY >= by &&
      mouseY <= by + buttonH;

    // 滑鼠移過時改變顏色
    if (hover) {
      fill(255, 170, 30);
    } else {
      fill(255, 250, 210, 245);
    }

    stroke(150, 110, 20);
    strokeWeight(2);

    rect(bx, by, buttonW, buttonH, 12);

    noStroke();
    fill(40);

    textSize(min(buttonW * 0.26, buttonH * 0.55));

    text(
      answerOptions[i],
      bx + buttonW / 2,
      by + buttonH / 2
    );

    answerButtons.push({
      x: bx,
      y: by,
      w: buttonW,
      h: buttonH,
      value: answerOptions[i]
    });
  }

  fill(60, 40, 10);
  textStyle(NORMAL);

  textSize(min(panelW * 0.04, panelH * 0.055));

  text(
    "請選擇正確答案",
    width / 2,
    panelY + panelH * 0.94
  );

  pop();
}

// ========================================
// 滑鼠點擊答案
// ========================================

function mousePressed() {

  if (!quizVisible) {
    return;
  }

  for (let button of answerButtons) {

    if (
      mouseX >= button.x &&
      mouseX <= button.x + button.w &&
      mouseY >= button.y &&
      mouseY <= button.y + button.h
    ) {

      checkAnswer(button.value);

      return false;
    }
  }
}

// ========================================
// 判斷答案
// ========================================

function checkAnswer(answer) {

  quizVisible = false;
  quizCompleted = true;

  resultStartTime = millis();

  if (answer === correctAnswer) {

    correctCount++;

    resultType = "correct";

    // 煙火初始化
    fireworks = [];

    createFirework(
      width * 0.5,
      height * 0.3
    );

    lastFireworkTime = millis();

    // 角色1面向角色2
    facingDirection =
      character2X < characterX ? -1 : 1;

    // 自動發動原本的魔法技能
    isCasting = true;

    magicStartFrame = frameCount;

    magicDirection = facingDirection;

  } else {

    wrongCount++;

    resultType = "wrong";

    isCasting = false;

    // 朝遠離角色2的方向擊飛
    hitDirection =
      characterX >= character2X ? 1 : -1;
  }
}

// ========================================
// 答對特效：產生彩色煙火
// ========================================

function createFirework(x, y) {

  let colors = [
    [255, 70, 70],
    [255, 220, 60],
    [80, 220, 255],
    [180, 80, 255],
    [100, 255, 150],
    [255, 130, 210]
  ];

  let fireworkColor = random(colors);

  for (let i = 0; i < 75; i++) {

    let angle = random(TWO_PI);
    let speed = random(2, 9);

    fireworks.push({

      x: x,
      y: y,

      vx: cos(angle) * speed,
      vy: sin(angle) * speed,

      life: 255,

      color: fireworkColor,

      size: random(2, 5)

    });
  }
}

// ========================================
// 煙火動畫
// ========================================

function drawFireworks() {

  push();

  // 每隔一段時間產生新的煙火
  if (millis() - lastFireworkTime > 250) {

    createFirework(
      random(width * 0.15, width * 0.85),
      random(height * 0.12, height * 0.50)
    );

    lastFireworkTime = millis();
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {

    let p = fireworks[i];

    p.x += p.vx;
    p.y += p.vy;

    p.vy += 0.035;

    p.vx *= 0.985;
    p.vy *= 0.985;

    p.life -= 4;

    // 煙火尾巴
    stroke(
      p.color[0],
      p.color[1],
      p.color[2],
      max(0, p.life)
    );

    strokeWeight(p.size);

    line(
      p.x,
      p.y,
      p.x - p.vx * 3,
      p.y - p.vy * 3
    );

    // 煙火中心亮點
    noStroke();

    fill(255, 255, 255, max(0, p.life));

    circle(p.x, p.y, p.size);

    if (p.life <= 0) {
      fireworks.splice(i, 1);
    }
  }

  pop();
}

// ========================================
// 答對特效：角色1能量光環
// ========================================

function drawPowerAura() {

  push();

  let x = characterX - cameraX;
  let y = height - height / 6;

  let size = height / 3;

  noFill();

  // 金色能量光圈
  for (let i = 0; i < 4; i++) {

    let pulse =
      (millis() / 8 + i * 35) % size;

    stroke(
      255,
      220,
      50,
      map(pulse, 0, size, 180, 0)
    );

    strokeWeight(3);

    ellipse(
      x,
      y,
      size * 0.45 + pulse,
      size * 0.75 + pulse
    );
  }

  // 角色周圍的魔法粒子
  noStroke();

  for (let i = 0; i < 20; i++) {

    let angle =
      millis() * 0.002 +
      i * TWO_PI / 20;

    let px =
      x + cos(angle) * size * 0.45;

    let py =
      y + sin(angle) * size * 0.55;

    fill(255, 215, 40, 190);

    circle(px, py, 5);
  }

  pop();
}

// ========================================
// 答錯特效：角色受傷位移
// ========================================

function getHitPose() {

  let t = constrain(
    (millis() - resultStartTime) / resultDuration,
    0,
    1
  );

  // 擊飛後於原地恢復
  let fly = constrain(t / 0.40, 0, 1);

  let recovery = 1 -
    constrain((t - 0.75) / 0.25, 0, 1);

  let offsetX =
    hitDirection * width * 0.07 *
    fly * recovery;

  let offsetY =
    -sin(fly * PI) * height * 0.15;

  let angle =
    hitDirection * PI / 2 *
    min(t * 3, 1) * recovery;

  let shake =
    t < 0.35
      ? sin(millis() * 0.04) * 6
      : 0;

  return {
    x: offsetX + shake,
    y: offsetY,
    angle: angle
  };
}

// ========================================
// 答錯特效：角色擊飛與倒地
// ========================================

drawCharacter = function () {

  if (resultType !== "wrong") {

    originalDrawCharacter();

    return;
  }

  let pose = getHitPose();

  let screenX = characterX - cameraX;

  let centerY = height - height / 6;

  push();

  // 向後擊飛並旋轉角色
  translate(
    screenX + pose.x,
    centerY + pose.y
  );

  rotate(pose.angle);

  translate(-screenX, -centerY);

  // 受傷色彩
  tint(255, 170, 170);

  originalDrawCharacter();

  noTint();

  pop();
};

// ========================================
// 答錯特效：閃電攻擊
// ========================================

function drawLightning() {

  push();

  let pose = getHitPose();

  let x =
    characterX - cameraX + pose.x;

  let y =
    height - height / 6 + pose.y;

  let t = constrain(
    (millis() - resultStartTime) / resultDuration,
    0,
    1
  );

  // 藍色受傷電流光環
  noFill();

  stroke(80, 160, 255, 100 * (1 - t));

  strokeWeight(10);

  ellipse(
    x,
    y,
    height * 0.23,
    height * 0.35
  );

  // 從天空劈向角色1
  for (let i = 0; i < 3; i++) {

    let points = [];

    points.push({
      x: x + random(-100, 100),
      y: 0
    });

    for (let j = 1; j < 12; j++) {

      points.push({
        x: x + random(-35, 35),
        y: y * j / 12
      });
    }

    points.push({
      x: x,
      y: y
    });

    // 閃電外層藍光
    stroke(80, 170, 255, 90);
    strokeWeight(9);

    beginShape();

    for (let point of points) {
      vertex(point.x, point.y);
    }

    endShape();

    // 閃電中心白光
    stroke(210, 245, 255, 200);
    strokeWeight(3);

    beginShape();

    for (let point of points) {
      vertex(point.x, point.y);
    }

    endShape();
  }

  // 角色身上的電流
  stroke(140, 210, 255, 180);
  strokeWeight(2);

  for (let i = 0; i < 8; i++) {

    let angle = random(TWO_PI);
    let radius = height * 0.10;

    let px = x + cos(angle) * radius;
    let py = y + sin(angle) * radius;

    line(
      px,
      py,
      px + random(-15, 15),
      py + random(-15, 15)
    );
  }

  pop();
}

// ========================================
// 答對、答錯提示文字
// ========================================

function drawResultMessage(message, correct) {

  push();

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  rectMode(CENTER);

  let boxW = width * 0.45;
  let boxH = height * 0.10;

  let x = width / 2;
  let y = height * 0.12;

  if (correct) {

    fill(30, 100, 60, 225);
    stroke(255, 220, 70);

  } else {

    fill(100, 20, 35, 225);
    stroke(100, 180, 255);
  }

  strokeWeight(3);

  rect(x, y, boxW, boxH, 15);

  noStroke();
  fill(255);

  textSize(min(width * 0.027, height * 0.05));

  text(message, x, y);

  pop();
}

// ========================================
// 左上角答題紀錄
// ========================================

function drawScore() {

  push();

  rectMode(CORNER);
  textAlign(LEFT, CENTER);

  let scoreSize = max(
    12,
    min(22, width * 0.016)
  );

  noStroke();

  fill(0, 0, 0, 170);

  rect(
    15,
    15,
    scoreSize * 8,
    scoreSize * 3.6,
    12
  );

  textSize(scoreSize);
  textStyle(BOLD);

  fill(110, 255, 150);

  text(
    "答對： " + correctCount,
    28,
    15 + scoreSize * 1.1
  );

  fill(255, 130, 130);

  text(
    "答錯： " + wrongCount,
    28,
    15 + scoreSize * 2.5
  );

  pop();
}
