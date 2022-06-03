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

  _getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  _generateColumnsChart() {
    return this._getColumnProps(this.data).map((value) => {
      return `<div style="--value: ${ value.value }" data-tooltip="${ value.percent }"></div>`;
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
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

    return (
      `
      <div class="column-chart__title">
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
      </div>
      `
    );
  }
}
