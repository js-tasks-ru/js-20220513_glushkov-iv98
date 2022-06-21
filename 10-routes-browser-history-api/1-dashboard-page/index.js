import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import Tooltip from "./components/tooltip/src";
import header from './bestsellers-header.js';

export default class Page {
  components = {}
  subElements = {}
  element = document.createElement('div');

  constructor() {
    this.components.rangePicker = new RangePicker({
      from: new Date('2022-05-22'),
      to: new Date('2022-06-23'),
    });

    this.components.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from: new Date('2022-05-22'),
        to: new Date('2022-06-23'),
      },
      label: 'Заказы',
      link: 'orders',
      classList: ['dashboard__chart_orders'],
    });
    this.components.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from: new Date('2022-05-22'),
        to: new Date('2022-06-23'),
      },
      label: 'Продажи',
      formatHeading: data => `$${data}`,
      classList: ['dashboard__chart_sales'],
    });
    this.components.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from: new Date('2022-05-22'),
        to: new Date('2022-06-23'),
      },
      label: 'Клиенты',
      classList: ['dashboard__chart_customers'],
    });

    this.components.sortableTable = new SortableTable(header, {
      from: new Date('2022-05-22'),
      to: new Date('2022-06-23'),
      link: 'api/dashboard/bestsellers',
    });

    this.components.toolTip = new Tooltip();

    this.subElements = this.getSubElements();

    this.initEventListeners();
  }

  getSubElements() {
    const subElements = {};

    for (const [name, value] of Object.entries(this.components)) {
      subElements[name] = value.element;
    }

    return subElements;
  }

  getTopPanel(title = '') {
    const element = document.createElement('div');

    element.classList.add('content__top-panel');
    element.innerHTML = `<h2 class="page-title">${ title }</h2>`;
    element.append(this.subElements.rangePicker);

    return element;
  }

  getCharts() {
    const element = document.createElement('div');
    const { ordersChart, salesChart, customersChart } = this.subElements;

    element.classList.add('dashboard__charts');
    element.append(ordersChart);
    element.append(salesChart);
    element.append(customersChart);

    return element;
  }

  getTopSalesTable(title = '') {
    const element = document.createElement('div');
    const tableHeader = document.createElement('h3');

    tableHeader.className = 'block-title';
    tableHeader.innerText = title;
    element.append(tableHeader);
    element.append(this.subElements.sortableTable);

    return element;
  }

  async render() {
    this.element.classList.add('dashboard', 'full-height', 'flex-column');

    this.element.append(this.getTopPanel('Панель управления'));
    this.element.append(this.getCharts());
    this.element.append(this.getTopSalesTable('Лидеры продаж'));

    this.components.toolTip.initialize();

    return this.element;
  }

  onDateSelect = (event) => {
    const { sortableTable, ordersChart, salesChart, customersChart } = this.components;
    const { from, to } = event.detail;

    ordersChart.update(from, to);
    salesChart.update(from, to);
    customersChart.update(from, to);
    sortableTable.update(from, to);
  }

  initEventListeners() {
    document.addEventListener('date-select', this.onDateSelect);
  }

  removeEventListeners() {
    document.removeEventListener('date-select', this.onDateSelect);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    const { rangePicker, ordersChart, salesChart, customersChart, sortableTable } = this.components;

    rangePicker.destroy();
    ordersChart.destroy();
    salesChart.destroy();
    customersChart.destroy();
    sortableTable.destroy();

    this.remove();
    this.removeEventListeners();
  }
}
