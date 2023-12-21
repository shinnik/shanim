import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { createAnimation, startAnimation } from "./counter";

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
        console.log(scene);
        scene.play();
    });
