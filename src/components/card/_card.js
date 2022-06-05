customElements.define('site-card',
    class siteCard extends HTMLElement {
        static get observedAttributes() { return []; }
        constructor() {
            super()
            this.attachShadow({ mode: 'open' })
            this.shadowRoot.innerHTML = HTML
        }
        connectedCallback() { }
        diconnectedCallback() { }
        attributeChangedCallback(name, oldValue, newValue) { 
        
        }
    })