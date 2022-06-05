customElements.define(
  "site-nav",
  class siteNav extends HTMLElement {
    static get observedAttributes() {
      return ["current-route"];
    }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = HTML;
    }
    set currentRoute(route) {
      this.shadowRoot.querySelectorAll("a").forEach(a => {
        if (a.pathname === route) {
          a.setAttribute("aria-current", "page");
        } else {
          a.removeAttribute("aria-current");
        }
      });
    }
    connectedCallback() {}
    diconnectedCallback() {}
    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case "current-route":
          this.currentRoute = newValue;
      }
    }
  }
);
