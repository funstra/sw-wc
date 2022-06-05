customElements.define(
  "post-lister",
  class postLister extends HTMLElement {
    static get observedAttributes() {
      return ["filter"];
    }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = HTML;

      this.filters = [];

      const allBox = this.shadowRoot.querySelector('input[value="all"]');

      this.shadowRoot.querySelector("form").addEventListener("change", e => {
        const checkbox = e.target;
        const name = checkbox.value;
        const checked = checkbox.checked;
        if (name === "all") {
          if (!checked) {
            checkbox.checked = true;
          }
          this.shadowRoot
            .querySelectorAll('input[type="checkbox"]:not([value="all"]')
            .forEach(box => (box.checked = false));
          this.filters = [];
        } else {
          if (checked) {
            allBox.checked = false;
            this.filters.push(name);
          } else {
            this.filters = this.filters.filter(filter => filter !== name);
          }
        }
        if (!this.filters.length) {
          allBox.checked = true;
        } else {
        }
        this.filter = this.filters;
      });
    }
    set filter(v) {
      this.setAttribute("filter", v);
    }
    connectedCallback() {}
    diconnectedCallback() {}
    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case "filter":
          const lis = this.shadowRoot.querySelector("slot").assignedElements();
          const parsedFilters = newValue.split(",");
          lis.forEach(li => {
            const parsedPostTags = li.dataset.postTags.split(",");
            if (
              parsedPostTags.some(
                tag =>
                  parsedFilters.some(filter => filter === tag) ||
                  parsedFilters[0] === ""
              )
            ) {
              li.classList.remove("closed");
            } else {
              li.classList.add("closed");
            }
          });
          break;
      }
    }
  }
);
