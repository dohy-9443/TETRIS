// blocks 가져옴
import blocks from "./blocks.js";

// DOM
const playground = document.querySelector(".board > ul"); // 게임화면
const gameText = document.querySelector(".game-over");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-over button");
const total = document.querySelector(".total");
const spaceBtn = document.querySelector(".space");
const changeBtn = document.querySelector(".change");
const leftBtn = document.querySelector(".leftBtn");
const rightBtn = document.querySelector(".rightBtn");
const bottomBtn = document.querySelector(".bottomBtn");
const speed = document.querySelector(".speed");

// Setting
const gameRows = 20; // 세로 수
const gameCols = 10; // 가로 수

// 변수
let score = 0; // 점수
let duration = 700; // 떨어지는 속도
let downInterval; // 자동으로 떨어지게 만들 변수
let tempMovingItem; // 블럭을 담아놓을 변수

const movingItem = {
  type: "", // block타입(bar, square 등등)
  direction: 0, // 모양을 돌리는거
  top: 0, // 좌표기준
  left: 0, // 좌표기준
};

const board = () => {
  const li = document.createElement("li");
  // html 작성된 ul에 넣을 li
  const ul = document.createElement("ul");
  // 위 li 속에 넣을 ul

  for (let i = 0; i < gameCols; i++) {
    const metrix = document.createElement("li");
    // ul > li > ul > li
    ul.prepend(metrix);
  }
  li.prepend(ul);
  playground.prepend(li);
};

const start = () => {
  tempMovingItem = { ...movingItem };
  // 시작할 때 원본 블럭을 얕은 복사로 담아놓음
  // 움직일 때 원본 블럭이 같이 수정되면 안되기 때문
  for (let i = 0; i < gameRows; i++) {
    board();
  }
  generateNewBlock();
};

// 게임 시작
start();

// game board 끝

function renderBlocks(moveType = "") {
  // 구조 분해 할당으로 tempMovingItem을 선언
  const { type, direction, top, left } = tempMovingItem;

  // 첨 생성되면 얘만 움직일 수 있음 그래서 moving이라는
  // 클래스를 가지고 있는 애들을 다 찾아냄
  const movingBlocks = document.querySelectorAll(".moving");

  // 얘가 이동을 하면 이동한 흔적이 남게됨
  // 그걸 지워줄 거임
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving");
  });

  // 블럭 모양잡기
  /*
    tree: [
      [ [1, 0], [0, 1], [1, 1], [2, 1] ],
      [],
      [],
      [],
    ],
  */

  // 반복문을 돌릴 건데 forEach말고 some을 사용
  // forEach는 기존 for 문에서 break와 continue 키워드를 사용 못한다.
  // some은 사용법이 같지만 break까지 사용가능

  blocks[type][direction].some((block) => {
    // 블럭의 타입과 모양을 가지고 반복문을 돌림
    // 즉 예를들어 tree블럭의 기본 모양 이라는거

    // 여기서 x, y는 좌표값인데 저 첫번째 디렉션이
    // 주석처리해놓은 가장 첫번째 [1, 0]
    // 요거임
    const x = block[0] + left; // 여기는 1이 들어가는거고
    const y = block[1] + top; // 여기는 0이 들어가는 거임
    // 여기에 left 와 top을 더하는 이유는 가운데에서 생성되게 하려고 더하는거임

    // childNodes를 사용할 것인데 얘는 배열처럼
    // 사용할 수 있어서 이것을 사용할 거임
    // ul > li > ul > li 요게 짱많으니까
    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null;
    // playground.childNodes[y] 여기는 ul > li
    // playground.childNodes[y].childNodes[0] 여기는 ul > li > ul
    // 그럼 target은 ul > li > ul > li 임
    // 예를 든 모양이 tree 모양이니까 그 트리모양의 마지막 li들이 잡히는 거임
    // 근데 보면 이 gameboard에 최 하단이나 양쪽 옆이 넘어버리면 ul > li가 없으니까
    // 그때는 null값을 넘겨야됌

    const isAvailable = checkEmpty(target);
    // 이건 현재 블럭이 최하단으로 떨어지고 새로운 블럭이
    // 최하단 블럭 위에 떨어질때 있는지 없는지 확인하기 위해 만듬

    // 저게 가능 할 때만 색칠을 해주면 된다.
    if (isAvailable) {
      target.classList.add(type, "moving");
      // 거기다가 css 설정한 클래스를 넣어주면 색칠이 됨
      // type명과 css class명이 같게 설정해놨기 때문에 type을 넣으면 됨
      // moving도 같이 줄건데 이건 움직이게 되면 색칠이 거기까지 되기 때문에
      // 이동을하면서 그 전에 있던 위치에는 색을 빼주기 위함임
    } else {
      tempMovingItem = { ...movingItem };
      // 저게 안되면 원본으로 다시 돌려주면 됨

      // 만약에 moveType이 재시작이면
      if (moveType === "retry") {
        // 떨어지는거 멈추고
        clearInterval(downInterval);
        // 게임오버화면을 보여줄 함수 호출
        showGameoverText();
      }

      // 그리고 renderBlocks()를 다시 호출한다.(재귀함수)
      // 재귀함수는 함수가 자신을 다시 호출하는 건데
      // 꼭 종료조건이 있어야 하고 설정하지 않으면 무한 반복한다.

      setTimeout(() => {
        renderBlocks("retry"); // retry는 재시작을 위해 넘김

        // 최하단으로 가서 더이상 내려갈 곳이 없는데 내리게 되면
        if (moveType === "top") {
          // 블럭을 고정시키는 함수 실행
          seizeBlocks();
        }
      }, 0);

      // 재귀함수 쓸 때 조심해야되는게
      // RangeError: Maximum call stack size exceeded 에러가
      // 발생할 수 있다고 한다. 그걸 방지하기 위해서 이벤트 루프안에
      // 넣지 않고 외부로 뺐다가 루프가 실행된 후에 다시 실행할 수 있도록
      // setTimeout으로 만든다.

      // 만약 빈값이 있게 되면
      return true;
      // 걸리면 새롭게 렌더블럭을 사용하게 끔 한다.
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
  // 이걸 적는 이유는 아예 밖으로 빠지게되면 처음 시작되는 가운데로
  // 시작이 되는데 빠지기 직전 위치로 다시 설정하기 위해서 작성
}

function seizeBlocks() {
  const movingBlocks = document.querySelectorAll(".moving");

  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  });
  // 이제 바닥에 도달하면 움직이면 안되니까
  // moving 클래스를 지워주고 seized를 추가해준다.

  // 한줄 다 차면 없애줄 함수
  checkMatch();
}

function checkMatch() {
  const childNodes = playground.childNodes;
  // 우선 전체를 불러오고 걔네를 반복해서 돌린다.
  childNodes.forEach((child) => {
    let matched = true;
    child.children[0].childNodes.forEach((li) => {
      // 하나하나에 seized가 없으면
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    });
    // 한줄이 다 차있으면 true니까
    if (matched) {
      child.remove();
      // 그러면 그 줄은 지워버리고
      board();
      // 쌔거 한줄을 추가한다.
      score += 10;
      // 점수도 10점 올림

      if (score % 10 === 0) {
        // 만약에 점수가 100으로 나눴을 때 나머지가 0이면
        // console.log(duration);
        if (duration > 150) {
          // 속도가 150 초과이면
          duration -= 50;
          // 속도를 50씩 감소
          switch (duration) {
            case 650:
              speed.innerText = "speed : 1.5";
              break;
            case 600:
              speed.innerText = "speed : 2";
              break;
            case 550:
              speed.innerText = "speed : 2.5";
              break;
            case 500:
              speed.innerText = "speed : 3";
              break;
            case 450:
              speed.innerText = "speed : 3.5";
              break;
            case 400:
              speed.innerText = "speed : 4";
              break;
            case 350:
              speed.innerText = "speed : 4.5";
              break;
            case 300:
              speed.innerText = "speed : 5";
              break;
            case 250:
              speed.innerText = "speed : 5.5";
              break;
            case 200:
              speed.innerText = "speed : 6";
              break;
            case 150:
              speed.innerText = "최고속도입니다.";
              break;
          }
        } else if (duration === 150) {
          // 근데 150과 같으면
          duration = 150;
          // 150 고정
        }
      }

      // 그 점수 적어주고
      scoreDisplay.innerText = score;
    }
  });

  generateNewBlock();
}

// 땅에 닿으면 쌔블럭 생성하는 함수
function generateNewBlock() {
  // 자동으로 떨어지게끔 하기위해 작성
  clearInterval(downInterval); // 일단 진행중인게 있을 수도 있으니까
  // 위에서 1씩 더해지면 아래로 내려가니까 이케 작성
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  // 랜덤한 쌔블럭 생성
  // Object.entries는 객체가 가지고 있는 모든 프로퍼티를
  // 키와 값 쌍으로 배열 형태로 반환해준다.
  const blockArray = Object.entries(blocks);
  // 그래서 이 배열을 blockArray에 담고
  const randomIndex = Math.floor(Math.random() * blockArray.length);
  // 이 배열만큼의 랜덤한 숫자를 담고

  movingItem.type = blockArray[randomIndex][0];
  // 랜덤한 쌔블럭이 나오게끔 그 배열의 키값을 타입에 넣는다.

  // 쌔블럭 위치값 설정
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;

  // 다시 얕은 복사로 담음
  tempMovingItem = { ...movingItem };

  // 함수 실행
  renderBlocks();
}

function checkEmpty(target) {
  // 만약 타겟이 없거나 seized를 가지고있으면
  if (!target || target.classList.contains("seized")) {
    return false;
  }

  // 가능하다.
  return true;
}

// 이 함수는 밑에 이벤트에서 이용하는데 인자로 moveType과 amount를 받는다.
const moveBlock = (moveType, amount) => {
  tempMovingItem[moveType] += amount;
  // 보면 tempMovingItem에 left가 들어오면 거기에 1또는 -1만큼 더한다.
  // 그럼 이동을 하게됨
  renderBlocks(moveType);
};

// 모양을 바꾸는 함수
function changeDirection() {
  const direction = tempMovingItem.direction;

  direction === 3
    ? (tempMovingItem.direction = 0)
    : (tempMovingItem.direction += 1);
  // 모양을 계속 바꿔주기 위해 조건을 삼항연산자로 작성
  renderBlocks();
}

// 스페이스바 누르면 확 떨어지게 하는 함수
function dropBlock() {
  // 우선 진행되는거 꺼주고
  clearInterval(downInterval);

  // 0.01초만에 확 떨어지게 만들어줌
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 10);
}

// 게임 종료화면 출력 함수
function showGameoverText() {
  // none으로 되어있는걸 flex로 바꿈
  gameText.style.display = "flex";
  // 최종점수를 출력
  total.innerText = score;
}

// event
// 키를 누르면 이동하게끔 만들 이벤트
document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      changeDirection();
      break;
    case 32:
      dropBlock();
      break;
    default:
      break;
  }
});

// 재시작버튼 클릭
restartButton.addEventListener("click", () => {
  // 게임화면 초기화
  playground.innerHTML = "";
  // 재시작을 눌렀으니까 재시작화면 없애줌
  gameText.style.display = "none";

  // 속도를 다시 원래대로 함
  duration = 700;
  // 점수를 다시 0점으로 바꾸고
  score = 0;
  // 초기화된 점수를 다시 작성
  scoreDisplay.innerText = score;

  // 속도를 알려주는 멘트도 다시 수정
  speed.innerText = "speed : 1";

  // 그리고 시작
  start();
});

// 각 맞는 버튼들에 맞게 함수를 이벤트 작성
spaceBtn.addEventListener("click", () => dropBlock());
changeBtn.addEventListener("click", () => changeDirection());
leftBtn.addEventListener("click", () => moveBlock("left", -1));
rightBtn.addEventListener("click", () => moveBlock("left", 1));
bottomBtn.addEventListener("click", () => moveBlock("top", 1));
