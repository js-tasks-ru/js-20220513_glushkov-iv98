export default class ColumnChart {
  classList = ['column-chart'];
  chartHeight = 50;
  element = null;

  constructor(props = {}) {
    const {
      data = [],
      value = 0,
      label = '',
      link = '',
      formatHeading = value => value
    } = props;

    this.data = data;
    this.value = value;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this._setClassList();
    this.render();
  }

  _generateColumnsChart() {
    const maxValue = Math.max(...this.data);

    return this.data.map((value) => {
      const normalizedValue = Math.floor(this.chartHeight * (value / maxValue));
      const percentValue = (normalizedValue / this.chartHeight * 100).toFixed(0);

      return `<div style="--value: ${ normalizedValue }" data-tooltip="${ percentValue }%"></div>`;
    }).join('');
  }

  _setClassList() {
    if (!this.data.length) {
      this.classList.push('column-chart_loading');
    }
  }

  update(newData) {
    this.data = newData;
    this._generateColumnsChart();
    this.render();
  }

  destroy() {
    this.element = null;
  }

  remove() {
    this.element = null;
  }

  render() {
    const container = document.createElement('div');

    container.classList.add(...this.classList);
    container.innerHTML = this.getTemplate();
    container.style.cssText += '--chart-height: 50';

    this.element = container;
  }

  getTemplate() {
    const viewLink = this.link ? `<a href="/sales" class="column-chart__link">View all</a>` : '';

    return (`<div class="column-chart__title">
            ${ this.label }
            ${ viewLink }
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
              ${ this.formatHeading(this.value) }
            </div>
            <div data-element="body" class="column-chart__chart">
              ${ this._generateColumnsChart() }
            </div>
          </div>`);
  }
}
