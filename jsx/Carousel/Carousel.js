import { createElement } from "./createElement";
import { Timeline, Animation } from "./animation";
import { ease, linear } from "./cubicBezier";

export class Carousel {
  constructor() {
    this.children = [];
  }

  setAttribute(name, value) {
    this[name] = value; // attribute == property
  }

  appendChild(child) {
    this.children.push(child);
  }

  mountTo(parent) {
    this.render().mountTo(parent);
  }

  render() {
    let timeline = new Timeline();
    window.xtimeline = timeline;
    timeline.start();

    let position = 0;

    let nextPicStopHandler = null;

    let children = this.data.map((url, currentPosition) => {
      let prevPosition = (this.data.length + currentPosition - 1) % this.data.length;
      let nextPosition = (currentPosition + 1) % this.data.length;

      let offset = 0;

      let onStart = () => {
        timeline.pause();
        clearTimeout(nextPicStopHandler);

        let currentElement = children[currentPosition];
        let currentTransformValue = Number(
          currentElement.style.transform.match(/translateX\(([\s\S]+)px\)/)[1]
        );
        offset = currentTransformValue + 500 * currentPosition;
      };

      let onPanMove = (event) => {
        let { clientX, startX } = event.detail;
        let prevElement = children[prevPosition];
        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];

        let dx = clientX - startX;
        let prevTransformValue = -500 - 500 * prevPosition + offset + dx;
        let currentTransformValue = -500 * currentPosition + offset + dx;
        let nextTransformValue = 500 - 500 * nextPosition + offset + dx;

        prevElement.style.transform = `translateX(${prevTransformValue}px)`;
        currentElement.style.transform = `translateX(${currentTransformValue}px)`;
        nextElement.style.transform = `translateX(${nextTransformValue}px)`;
      };

      let onPanEnd = (event) => {
        let direction = 0;
        let { clientX, startX } = event.detail;
        let dx = clientX - startX;
        let prevElement = children[prevPosition];
        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];

        if (dx + offset > 250 || (dx > 0 && event.isFlick)) {
          direction = 1;
        } else if (dx + offset < -250 || (dx < 0 && event.isFlick)) {
          direction = -1;
        }

        timeline.reset();
        timeline.start();

        let prevAnimation = new Animation({
          object: prevElement.style,
          property: "transform",
          template: (v) => `translateX(${v}px)`,
          start: -500 - 500 * prevPosition + offset + dx,
          end: -500 - 500 * prevPosition + direction * 500,
          duration: 500,
          timingFunction: ease,
        });
        let currentAnimation = new Animation({
          object: currentElement.style,
          property: "transform",
          template: (v) => `translateX(${v}px)`,
          start: -500 * currentPosition + offset + dx,
          end: -500 * currentPosition + direction * 500,
          duration: 500,
          timingFunction: ease,
        });
        let nextAnimation = new Animation({
          object: nextElement.style,
          property: "transform",
          template: (v) => `translateX(${v}px)`,
          start: 500 - 500 * nextPosition + offset + dx,
          end: 500 - 500 * nextPosition + direction * 500,
          duration: 500,
          timingFunction: ease,
        });
        timeline.add(prevAnimation);
        timeline.add(currentAnimation);
        timeline.add(nextAnimation);

        position = (position - direction + this.data.length) % this.data.length;
        console.log(position);
        nextPicStopHandler = setTimeout(nextPic, 3000);
      };

      let element = (
        <img
          src={url}
          enableGesture={true}
          onStart={onStart}
          onPanMove={onPanMove}
          onPanEnd={onPanEnd}
        />
      );
      element.style.transform = "translateX(0px)";
      element.addEventListener("dragstart", (event) => event.preventDefault());
      return element;
    });
    let root = <div class="carousel">{children}</div>;

    // 轮播功能
    let nextPic = () => {
      // 一定不能用 DOM 操作
      let nextPosition = (position + 1) % this.data.length;

      let current = children[position];
      let next = children[nextPosition];

      let currentAnimation = new Animation({
        object: current.style,
        property: "transform",
        template: (v) => `translateX(${5 * v}px)`,
        start: -100 * position,
        end: -100 - 100 * position,
        duration: 500,
        timingFunction: ease,
      });
      let nextAnimation = new Animation({
        object: next.style,
        property: "transform",
        template: (v) => `translateX(${5 * v}px)`,
        start: 100 - 100 * nextPosition,
        end: -100 * nextPosition,
        duration: 500,
        timingFunction: ease,
      });
      timeline.add(currentAnimation);
      timeline.add(nextAnimation);

      position = nextPosition;

      nextPicStopHandler = setTimeout(nextPic, 3000);
    };
    nextPicStopHandler = setTimeout(nextPic, 3000);

    return root;
  }
}

void (function test() {
  setTimeout(() => console.log("setTimeout"), 0);

  Promise.resolve().then(() => {
    console.log("Promise1");
    Promise.resolve().then(() => {
      console.log("Promise2");
    });
  });
})();
