const fetchDocument = async href => {
  const res = await fetch(href);
  const document = new DOMParser().parseFromString(
    await res.text(),
    "text/html"
  );
  return document;
};

const route = async (target, targets) => {
  const { pathname, href } = target;
  document.querySelector("site-nav").setAttribute("current-route", pathname);

  document.documentElement.classList.add("navigating");
  document.querySelector("site-nav").classList.add("navigating");

  const destinationDocument = await fetchDocument(href);

  const sourceElement = document.body.querySelector("main");
  const destinationElement = destinationDocument.body.querySelector("main");

  sourceElement.parentElement.appendChild(destinationElement);

  // transition - - - - - - -
  const pageTransitionDuration = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--page-transition-duration")
      .replace("ms", "")
  );

  document.documentElement.style.setProperty("--transition-direction", `${1}`);

  let transitionAxis = true;

  sourceElement.classList.add(
    transitionAxis ? "transitionOutY" : "transitionOutX"
  );
  destinationElement.classList.add(
    transitionAxis ? "transitionInY" : "transitionInX"
  );

  document.documentElement.classList.add("transitioning");

  document.documentElement.classList.remove("navigating");
  if (targets) {
    targets.forEach(target => target.classList.remove("navigatingTo"));
  } else {
    target.classList.remove("navigatingTo");
  }
  document.querySelector("site-nav").classList.remove("navigating");
  setTimeout(() => {
    // remove source styles
    sourceElement.remove();

    setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
      document.documentElement.style.removeProperty("--transition-direction");
      destinationElement.classList.remove("transitionInY");
      destinationElement.classList.remove("transitionInX");
    }, pageTransitionDuration);
  }, pageTransitionDuration);
};

addEventListener("click", e => {
  const target = e.composedPath()[0];
  if (target.tagName === "A" && target.origin === location.origin) {
    e.preventDefault();
    if (target.pathname !== location.pathname) {
      history.pushState(null, null, target.pathname);
      target.classList.add("navigatingTo");
      route(target);
    } else {
      target.classList.add("err");
      setTimeout(() => {
        target.classList.remove("err");
      }, 125);
    }
  }
});

onpopstate = e => {
  const targets = document.querySelectorAll(`a[href="${location.pathname}"]`);
  targets.forEach(a => a.classList.add("navigatingTo"));

  route(location, targets);
};
