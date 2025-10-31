gsap.registerPlugin(ScrollTrigger);

const lottieFiles = [
  "https://raw.githubusercontent.com/Phoenix7707/scroll-animation-lottie/refs/heads/main/assets/Window-Space-Scene.json",
  "https://raw.githubusercontent.com/Phoenix7707/scroll-animation-lottie/refs/heads/main/assets/Tablet-Award-Scene.json",
  "https://raw.githubusercontent.com/Phoenix7707/scroll-animation-lottie/refs/heads/main/assets/Falling-Cityscape-Scene.json",
  "https://raw.githubusercontent.com/Phoenix7707/scroll-animation-lottie/refs/heads/main/assets/Closing-Scene.json"
];

const loaderPercentage = document.querySelector('.loader-percentage');
const screenLoader = document.querySelector('.screen-loader');

if (history.scrollRestoration) history.scrollRestoration = 'manual';
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
document.body.style.overflow = "hidden";

let animations = [];
let totalFrames = [];
let loadedCount = 0;
let currentAnimIndex = 0;

// Smooth percentage update function
function updatePercentageSmooth(targetPercent) {
  gsap.to(loaderPercentage, {
    innerText: targetPercent,
    duration: 0.5,
    roundProps: "innerText",
    ease: "power1.out"
  });
}

// Load Lottie animations
lottieFiles.forEach((file, index) => {
  const container = document.getElementById(`lottie-container-${index + 1}`);
  animations[index] = lottie.loadAnimation({
    container: container,
    renderer: "canvas",
    loop: false,
    autoplay: false,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    path: file
  });

  animations[index].addEventListener("DOMLoaded", () => {
    totalFrames[index] = animations[index].totalFrames;
    loadedCount++;
    updatePercentageSmooth((loadedCount / lottieFiles.length) * 100);
    if (loadedCount === lottieFiles.length) hideLoader();
  });
});

function hideLoader() {
  gsap.to(screenLoader, {
    opacity: 0,
    duration: 1,
    onComplete: () => {
      screenLoader.style.display = "none";
      keepOverlayThenRemove(); // 👈 call new function
    }
  });
}

function keepOverlayThenRemove() {
  const overlay = document.querySelector('.overlay');

  // Wait 1 seconds after loader disappears
  setTimeout(() => {
    gsap.to(overlay, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        overlay.style.display = "none";
        document.body.style.overflow = "auto";
        scrollAnimation(); // now start your Lottie + scroll animations
      }
    });
  }, 1000);
}

function switchToAnimation(index) {
  if (currentAnimIndex === index) return;
  currentAnimIndex = index;
  for (let i = 0; i < lottieFiles.length; i++) {
    const container = document.getElementById(`lottie-container-${i + 1}`);
    if (i === index) container.classList.remove('hidden');
    else container.classList.add('hidden');
  }
}

function scrollAnimation() {
  const combinedFrames = totalFrames.reduce((sum, frames) => sum + frames, 0);
  let obj = { frame: 0 };

  gsap.to(obj, {
    frame: combinedFrames - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    },
    onUpdate: () => {
      const currentFrame = Math.floor(obj.frame);
      let frameCount = 0;
      for (let i = 0; i < animations.length; i++) {
        if (currentFrame < frameCount + totalFrames[i]) {
          switchToAnimation(i);
          animations[i].goToAndStop(currentFrame - frameCount, true);
          break;
        }
        frameCount += totalFrames[i];
      }
    }
  });
}


// Custom Scrollbar
const track = document.querySelector('.scrollbar-track');
const thumb = document.querySelector('.scrollbar-thumb');
let isDragging = false;
let startY, startScrollTop;

function updateThumb() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;

  const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 25);
  const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);

  thumb.style.height = `${thumbHeight}px`;
  thumb.style.top = `${thumbTop}px`;
}

function startDrag(y) {
  isDragging = true;
  startY = y;
  startScrollTop = window.scrollY;
  document.body.style.userSelect = 'none';
}

function doDrag(y) {
  if (!isDragging) return;
  const deltaY = y - startY;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;
  const scrollableHeight = scrollHeight - clientHeight;
  const thumbHeight = thumb.offsetHeight;
  const scrollRatio = scrollableHeight / (clientHeight - thumbHeight);

  window.scrollTo(0, startScrollTop + deltaY * scrollRatio);
}

function stopDrag() {
  isDragging = false;
  document.body.style.userSelect = '';
}

// Mouse
thumb.addEventListener('mousedown', e => startDrag(e.clientY));
window.addEventListener('mousemove', e => doDrag(e.clientY));
window.addEventListener('mouseup', stopDrag);

// Touch
thumb.addEventListener('touchstart', e => startDrag(e.touches[0].clientY));
window.addEventListener('touchmove', e => doDrag(e.touches[0].clientY));
window.addEventListener('touchend', stopDrag);

// Update on scroll/resize
window.addEventListener('scroll', updateThumb);
window.addEventListener('resize', updateThumb);
updateThumb();


// Scroll Hint
gsap.to(".scroll-hint", {
  scale: 0,
  opacity: 0,
  ease: "power1.out",
  scrollTrigger: {
    trigger: "body",
    start: "top top",       // start at top
    end: "100",             // animation completes after scrolling 100px
    scrub: 1             // smooth with scroll
  }
});

window.addEventListener('scroll', () => {
  console.log(window.scrollY);
});



// Scroll Text Apperence and Disappearence
const scrollTexts = document.querySelectorAll('.scroll-text');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  scrollTexts.forEach(text => {
    const start = parseInt(text.dataset.start);
    const end = parseInt(text.dataset.end);

    if (scrollY >= start && scrollY <= end) {
      gsap.to(text, { opacity: 1, duration: 0.3 });
    } else {
      gsap.to(text, { opacity: 0, duration: 0.3 });
    }
  });
});
