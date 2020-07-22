import { createElement } from "./createElement";

class Carousel {
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
    let children = this.data.map((url) => {
      let element = <img src={url} />;
      element.addEventListener("dragstart", (event) => event.preventDefault());
      return element;
    });
    let root = <div class="carousel">{children}</div>;

    let position = 0;
    // 轮播功能
    let nextPic = () => {
      // 一定不能用 DOM 操作
      let nextPosition = (position + 1) % this.data.length;

      let current = children[position];
      let next = children[nextPosition];

      current.style.transition = "ease 0s";
      next.style.transition = "ease 0s";

      // 将 current 移到框框内，next 移到框框的后面
      current.style.transform = `translateX(${-100 * position}%)`;
      next.style.transform = `translateX(${100 - 100 * nextPosition}%)`;

      setTimeout(() => {
        current.style.transition = ""; // = "" means use CSS rule
        next.style.transition = "";

        // 将 current 移到框框的前面，next 移到框框内
        current.style.transform = `translateX(${-100 - 100 * position}%)`;
        next.style.transform = `translateX(${-100 * nextPosition}%)`;

        position = nextPosition;
      }, 16); // 这里 16ms 是 winter 老师的经验， 1000 / 60 = 16.66666 刚好是一帧的时间

      setTimeout(nextPic, 3000);
    };
    setTimeout(nextPic, 3000);

    // 拖拽功能
    root.addEventListener("mousedown", (event) => {
      let startX = event.clientX;

      let prevPosition = (this.data.length + position - 1) % this.data.length;
      let nextPosition = (position + 1) % this.data.length;

      let current = children[position];
      let prev = children[prevPosition];
      let next = children[nextPosition];

      current.style.transition = "ease 0s";
      prev.style.transition = "ease 0s";
      next.style.transition = "ease 0s";

      current.style.transform = `translateX(${-500 * position}px)`;
      prev.style.transform = `translateX(${-500 - 500 * prevPosition}px)`;
      next.style.transform = `translateX(${500 - 500 * nextPosition}px)`;

      let move = (event) => {
        current.style.transform = `translateX(${
          event.clientX - startX - 500 * position
        }px)`;
        prev.style.transform = `translateX(${
          event.clientX - startX - 500 - 500 * prevPosition
        }px)`;
        next.style.transform = `translateX(${
          event.clientX - startX + 500 - 500 * nextPosition
        }px)`;
      };
      let up = (event) => {
        let offset = 0;
        if (event.clientX - startX > 250) {
          offset = 1;
        } else if (event.clientX - startX < -250) {
          offset = -1;
        }

        current.style.transition = ""; // = "" means use CSS rule
        prev.style.transition = "";
        next.style.transition = "";

        current.style.transform = `translateX(${
          500 * offset - 500 * position
        }px)`;
        prev.style.transform = `translateX(${
          500 * offset - 500 - 500 * prevPosition
        }px)`;
        next.style.transform = `translateX(${
          500 * offset + 500 - 500 * nextPosition
        }px)`;

        position = (position - offset + this.data.length) % this.data.length;

        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });

    return root;
  }
}

let data = [
  "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
  "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
  "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
  "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg",
];
let component = <Carousel data={data} />;

component.mountTo(document.body);
console.log(component);
