import "./style.css";
import { createAnimation } from "./counter";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Test animation</h1>
    <div class="card">
      <button id="counter" type="button">Click to animate</button>
    </div>
  </div>
`;

const scene = createAnimation(
    document.querySelector<HTMLButtonElement>("#counter")
);

document
    .querySelector<HTMLButtonElement>("#counter")
    .addEventListener("click", function () {
        scene.play({ shouldCommit: false });
    });

document.addEventListener("keydown", function (event) {
    if (event.key === "r") {
        scene.resume();
    } else if (event.key === "s") {
        scene.pause();
    } else if (event.key === "g") {
        console.log(scene);
    } else if (event.key === "t") {
        createAnimation(
            document.querySelector<HTMLButtonElement>("#counter")
        ).play();
    }
});
