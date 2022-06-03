class Tooltip {
  static #instance = null;
  element = null;

  constructor() {
    if (!Tooltip.#instance) {
      Tooltip.#instance = this;
    } else {
      return Tooltip.#instance;
    }
  }

  initialize () {
    document.addEventListener('pointermove', this.show);
    document.addEventListener('pointerover', this.show);
    document.addEventListener('pointerout', this.hide);
  }

  _setToolTipPosition(x, y) {
    this.element.style.top = `${ y + 10 }px`;
    this.element.style.left = `${ x + 5 }px`;
  }

  _setToolTipContent(content = '') {
    this.element.innerHTML = content;
  }

  render(content = '', { x, y } = {}) {
    this.element = document.createElement('div');
    this.element.classList.add('tooltip');
    this.element.insertAdjacentHTML('afterbegin', content);
    this._setToolTipPosition(x, y);
    this._setToolTipContent(content);

    document.body.insertAdjacentElement('beforeend', this.element);
  }

  show = (event) => {
    const toolTipData = event.target.dataset.tooltip;

    if (toolTipData !== undefined) {
      if (!this.element) {
        this.render(toolTipData, {
          x: event.x,
          y: event.y,
        });
      } else {
        this._setToolTipContent(toolTipData);
        this._setToolTipPosition(event.x, event.y);
      }
    }
  }

  hide = (event) => {
    const toolTipData = event.target.dataset.tooltip;

    if (toolTipData !== undefined) {
      this.remove();
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();

    document.removeEventListener('pointermove', this.show);
    document.removeEventListener('pointerover', this.show);
    document.removeEventListener('pointerout', this.hide);
  }
}

export default Tooltip;
