import fetchJson from '../../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  classList = ['column-chart'];
  chartHeight = 50;
  element = document.createElement('div');
  subElements = {};
  data = {};
  isLoading = true;

  constructor(props = {}) {
    const {
      url = '',
      range = {},
      label = '',
      link = '',
      classList = [],
      formatHeading = (value) => value
    } = props;

    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.classList = classList;
    this.formatHeading = formatHeading;
    this.data = this.update(this.range.from, this.range.to);
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

  _createChartTitle() {
    const viewLink = this.link ? `<a href=/${ this.link } class="column-chart__link">Подробнее</a>` : '';

    this.subElements.title = document.createElement('div');
    this.subElements.title.classList.add('column-chart__title');
    this.subElements.title.insertAdjacentHTML('beforeend', `${ this.label }`);
    this.subElements.title.insertAdjacentHTML('beforeend', viewLink);
  }

  _createChartHeader() {
    const total = Object.values(this.data).reduce((a, b) => a + b, 0);

    this.subElements.header = document.createElement('div');
    this.subElements.header.classList.add('column-chart__header');
    this.subElements.header.dataset.element = 'header';
    this.subElements.header.insertAdjacentHTML('beforeend', `${ this.formatHeading(total) }`);
  }

  _createChartBody() {
    this.subElements.body = document.createElement('div');
    this.subElements.body.classList.add('column-chart__chart');
    this.subElements.body.dataset.element = 'body';

    const data = Object.entries(this.data);
    const dates = [];
    const values = [];
    for (const item of data) {
      dates.push(item[0]);
      values.push(item[1]);
    }
    const columnProps = this._getColumnProps(values);

    for (let i = 0; i < data.length; i++) {
      const column = document.createElement('div');

      column.style.cssText += `--value: ${ columnProps[i].value }`;
      column.dataset.tooltip = `<div><small>${ dates[i] }</small></div><strong>${ this.formatHeading(values[i]) }</strong>`;
      this.subElements.body.appendChild(column);
    }
  }

  _setLoadingClass() {
    if (this.isLoading || Object.keys(this.data).length === 0) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
    }
  }

  async _fetchData(startDate, endDate) {
    const apiUrl = `${ BACKEND_URL }/${ this.url }?from=${ startDate }&to=${ endDate }`;

    return await fetchJson(`${ apiUrl }`);
  }

  _insertElement(where, element) {
    where.innerHTML = '';
    where.appendChild(element);
  }

  _createTemplate() {
    const chartContainer = document.createElement('div');

    this._createChartTitle();
    this._createChartHeader();
    this._createChartBody();

    chartContainer.classList.add('column-chart__container');
    chartContainer.appendChild(this.subElements.body);

    this._insertElement(this.element, this.subElements.title);
    this.element.appendChild(this.subElements.header);
    this.element.appendChild(chartContainer);
  }

  _convertDate(date) {
    if (date) {
      const [year, month, day] = new Date(date.toString()).toLocaleDateString().split('.');

      return `${day}-${month}-${year}`;
    }
  }

  async update(startDate = new Date(), endDate = new Date()) {
    this.isLoading = true;
    this._setLoadingClass();

    this.data = await this._fetchData(this._convertDate(startDate), this._convertDate(endDate));

    this.isLoading = false;
    this.render();

    return this.data;
  }

  render() {
    this.element.classList.add('column-chart', ...this.classList);
    this.element.style.cssText += `--chart-height: ${ this.chartHeight }`;
    this._setLoadingClass();
    this._createTemplate();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
