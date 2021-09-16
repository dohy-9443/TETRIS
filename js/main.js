// blocks 가져옴
import blocks from "./blocks.js";

// DOM
const playground = document.querySelector(".board > ul"); // 게임화면

// Setting
const gameRows = 20; // 세로 수
const gameCols = 10; // 가로 수

// 변수
let score = 0; // 점수
let duration = 700; // 떨어지는 속도
let downInterval; // 자동으로 떨어지게 만들 변수
let tempMovingItem; // 블럭을 담아놓을 변수

const movingItem = {
  type: "tree", // block타입(bar, square 등등)
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
  renderBlocks();
};

// 게임 시작
start();

// game board 끝

function renderBlocks() {
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
  blocks[type][direction].forEach((block) => {
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

    target.classList.add(type, "moving");
    // 거기다가 css 설정한 클래스를 넣어주면 색칠이 됨
    // type명과 css class명이 같게 설정해놨기 때문에 type을 넣으면 됨
    // moving도 같이 줄건데 이건 움직이게 되면 색칠이 거기까지 되기 때문에
    // 이동을하면서 그 전에 있던 위치에는 색을 빼주기 위함임
  });
}

// 이 함수는 밑에 이벤트에서 이용하는데 인자로 moveType과 amount를 받는다.
const moveBlock = (moveType, amount) => {
  tempMovingItem[moveType] += amount;
  // 보면 tempMovingItem에 left가 들어오면 거기에 1또는 -1만큼 더한다.
  // 그럼 이동을 하게됨
  renderBlocks();
};

// event
// 키를 누르면 이동하게끔 만들 이벤트
document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
    case 40:
      moveBlock("top", 1);
    default:
      break;
  }
});
