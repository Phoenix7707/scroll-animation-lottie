<script>
  gsap.registerPlugin(ScrollTrigger);

  // ✅ ADD YOUR THREE LOTTIE FILES HERE
  const lottieFiles = [
    "https://raw.githubusercontent.com/Phoenix7707/scroll-animation-lottie/refs/heads/main/assets/Jungle-Scene.json",
    "https://raw.githubusercontent.com/Phoenix7707/scroll-animation-lottie/refs/heads/main/assets/Falling-Scene.json",
    "https://raw.githubusercontent.com/Phoenix7707/scroll-animation-lottie/refs/heads/main/assets/Space-Scene.json"
  ];

  const loaderTexts = document.querySelectorAll('.loader-text');
  const loaderPercentage = document.querySelector('.loader-percentage');
  const screenLoader = document.querySelector('.screen-loader');

  // Force scroll to top on every refresh
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  
  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });

  document.body.style.overflow = "hidden";
  window.scrollTo(0, 0);

  let animations = [];
  let totalFrames = [];
  let loadedCount = 0;
  let currentAnimIndex = 0;

  // Load all animations dynamically
  lottieFiles.forEach((file, index) => {
    const container = document.getElementById(`lottie-container-${index + 1}`);
    
    animations[index] = lottie.loadAnimation({
      container: container,
      renderer: "canvas",
      loop: false,
      autoplay: false,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      },
      path: file
    });

    animations[index].addEventListener("DOMLoaded", () => {
      totalFrames[index] = animations[index].totalFrames;
      loadedCount++;
      if (loadedCount === lottieFiles.length) {
        hideLoader();
      }
    });
  });

  // Loader Animation
  let index = 0;
  function loopLoaderText() {
    const text = loaderTexts[index];
    gsap.fromTo(text, { opacity: 0 }, {
      opacity: 1,
      duration: .4,
      onComplete: () => {
        gsap.to(text, {
          opacity: 0,
          duration: .4,
          delay: .6,
          onComplete: () => {
            index++;
            if (index < loaderTexts.length) loopLoaderText();
          }
        });
      }
    });
  }

  function hideLoader() {
    gsap.to(screenLoader, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        screenLoader.style.display = "none";
        document.body.style.overflow = "auto";
        scrollAnimation();
      }
    });
  }

  function switchToAnimation(index) {
    if (currentAnimIndex === index) return;
    currentAnimIndex = index;
    
    // Hide all containers except the active one
    for (let i = 0; i < lottieFiles.length; i++) {
      const container = document.getElementById(`lottie-container-${i + 1}`);
      if (i === index) {
        container.classList.remove('hidden');
      } else {
        container.classList.add('hidden');
      }
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
        
        // Find which animation should be playing
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

  loopLoaderText();
</script>