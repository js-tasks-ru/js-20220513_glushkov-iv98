export default class DoubleSlider {
  element = document.createElement('div');
  currentDragElement = null;
  subElements = {
    inner: {}
  };
  subElementsConfig = {
    from: {
      selector: 'span',
      dataAttributes: {
        element: 'from',
      },
    },
    to: {
      selector: 'span',
      dataAttributes: {
        element: 'to',
      },
    },
    inner: {
      selector: 'div',
      dataAttributes: {
        element: 'inner',
      },
      classList: 'range-slider__inner',
    },
    progress: {
      selector: 'div',
      dataAttributes: {
        element: 'progress',
      },
      classList: 'range-slider__progress',
    },
    thumbLeft: {
      selector: 'div',
      dataAttributes: {
        element: 'thumbLeft',
      },
      classList: 'range-slider__thumb-left',
    },
    thumbRight: {
      selector: 'div',
      dataAttributes: {
        element: 'thumbRight',
      },
      classList: 'range-slider__thumb-right',
    }
  }

  constructor({
    min = 0, max = 0,
    selected: { from: iniFrom = min, to: initTo = max } = {},
    formatValue = (value) => value } = {}) {
    this.min = min;
    this.max = max;
    this.initFrom = min ? iniFrom : min;
    this.initTo = max ? initTo : max;
    this.formalValue = formatValue;

    this.render();
    this._updateRangeValue(this.subElements.inner.from, this.initFrom);
    this._updateRangeValue(this.subElements.inner.to, this.initTo);
    this._updateProgressBar(this.initFrom, this.initTo);
    this._initEventListeners();

  }

  _initEventListeners = () => {
    const { thumbLeft, thumbRight } = this.subElements.inner;

    thumbLeft.addEventListener('pointerdown', this.onThumbDown, true);
    thumbRight.addEventListener('pointerdown', this.onThumbDown, true);
    this.element.addEventListener('range-select', this.onRangeSelect, true);
  }

  onThumbDown = (event) => {
    this.currentDragElement = event.target;

    document.addEventListener('pointermove', this.onMove);
    document.addEventListener('pointerup', this.onThumbUp);
  }

  onThumbUp = () => {
    const { thumbLeft, thumbRight } = this.subElements.inner;

    document.removeEventListener('pointermove', this.onMove);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: {
        from: this._getValue(parseFloat(thumbLeft.style.left)),
        to: this._getValue(parseFloat(thumbRight.style.left)),
      }
    }));
  }

  onMove = (event) => {
    this._updateThumbPosition(null, event.clientX);
  }

  onRangeSelect = (event) => {
    const { from, to } = this.subElements.inner;

    this._updateRangeValue(from, event.detail.from);
    this._updateRangeValue(to, event.detail.to);
  }

  _getValueInPercent(value) {
    const range = this.max - this.min;

    return value / range * 100 - 100;
  }

  _getValue(percent) {
    return Math.round(this.min + this.min * percent / 100);
  }

  _updateRangeValue(place, newValue) {
    place.innerHTML = this.formalValue(newValue);
  }

  _updateProgressBar(min, max) {
    this.subElements.inner.progress.style.left = `${ this._getValueInPercent(min) }%`;
    this.subElements.inner.progress.style.right = `${ 100 - this._getValueInPercent(max) }%`;
  }

  _updateThumbPosition(thumb = null, xPos) {
    const { root, thumbLeft, thumbRight } = this.subElements.inner;
    const { width: rootWidth, left: rootLeftOffset } = root.getBoundingClientRect();
    let newPosition = (xPos - rootLeftOffset) / rootWidth;

    newPosition *= 100;
    if (newPosition > 100) {
      newPosition = 100;
    }
    if (newPosition < 0) {
      newPosition = 0;
    }

    if (thumb) {
      this.currentDragElement = thumb;
    }

    if (this.currentDragElement === thumbRight) {
      const leftBorder = parseFloat(thumbLeft .style.left);
      const { width: thumbWidth } = thumbRight.getBoundingClientRect();

      thumbRight.style.left = `${ newPosition }%`;
      this._updateProgressBar(this._getValue(leftBorder), this._getValue(newPosition));
      if (leftBorder + thumbWidth / rootWidth >= newPosition) {
        newPosition = leftBorder;
      }
    }

    if (this.currentDragElement === thumbLeft) {
      const rightBorder = parseFloat(thumbRight.style.left);
      const { width: thumbWidth } = thumbLeft.getBoundingClientRect();

      thumbLeft.style.left = `${ newPosition }%`;
      this._updateProgressBar(this._getValue(newPosition), this._getValue(rightBorder));
      if (rightBorder + thumbWidth / rootWidth <= newPosition) {
        newPosition = rightBorder;
      }
    }

    this.currentDragElement.style.left = `${ newPosition }%`;
  }

  _createSubElement(props = {}) {
    const {
      selector = 'div',
      dataAttributes = {},
      classList = '',
    } = props;
    const elem = document.createElement(selector);

    for (const [dataName, dataValue] of Object.entries(dataAttributes)) {
      elem.setAttribute(`data-${ dataName }`, dataValue);
    }
    if (classList) {
      elem.classList.add(classList);
    }

    return elem;
  }

  _createProgressBar() {
    const subElementsInner = this.subElements.inner;
    const inner = this._createSubElement(this.subElementsConfig.inner);
    const progress = this._createSubElement(this.subElementsConfig.progress);
    const thumbLeft = this._createSubElement(this.subElementsConfig.thumbLeft);
    const thumbRight = this._createSubElement(this.subElementsConfig.thumbRight);

    thumbLeft.style.zIndex = '99999';
    thumbRight.style.zIndex = '99999';
    thumbLeft.style.left = this.initFrom ? `${ this._getValueInPercent(this.initFrom) }%` : '0%';
    thumbRight.style.left = this.initTo ? `${ this._getValueInPercent(this.initTo) }%` : '100%';

    subElementsInner['thumbLeft'] = inner.appendChild(thumbLeft);
    subElementsInner['progress'] = inner.appendChild(progress);
    subElementsInner['thumbRight'] = inner.appendChild(thumbRight);

    return (subElementsInner['root'] = inner);
  }

  render() {
    const subElementsInner = this.subElements.inner;

    this.element.classList.add('range-slider');

    subElementsInner['from'] = this.element.appendChild(this._createSubElement(this.subElementsConfig.from));
    subElementsInner['from'].innerHTML = this.formalValue(this.min);
    this.element.appendChild(this._createProgressBar());
    subElementsInner['to'] = this.element.appendChild(this._createSubElement(this.subElementsConfig.to));
    subElementsInner['to'].innerHTML = this.formalValue(this.max);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();

    document.removeEventListener('pointermove', this.onMove);
    document.removeEventListener('pointerup', this.onThumbUp);
    document.removeEventListener('pointerdown', this.onThumbDown);
  }
}
