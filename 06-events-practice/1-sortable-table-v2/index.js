export default class SortableTable {
  element = document.createElement('div');
  subElements = {
    root: document.createElement('div'),
    header: {
      root: document.createElement('div'),
      children: [],
    },
    body: document.createElement('div'),
  }
  isSortLocally = true;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.columItems = this.headersConfig.map((item) => {
      return {
        id: item.id,
        sortOrder: 'asc',
        sortable: item.sortable,
        template: item.template ? item.template : null,
      };
    });
    this.currentSortFieldID = sorted.id;
    this.currentSortDirection = sorted.order;
    this.sort(this.sorted.id, this.sorted.order);
    this.render();
  }

  _addHeaderEventListeners() {
    for (const elem of this.subElements.header.children) {
      elem.addEventListener('pointerdown', this._sortHandle);
    }
  }

  _sortHandle = (event) => {
    const column = event.target.closest('[data-id]');
    const { id, order } = column.dataset;
    const columnConfig = this.headersConfig[this._getColumnIndexByID(id)];

    if (columnConfig && !columnConfig.sortable) {
      return;
    }

    this._deleteHeaderEventListeners();
    if (order === 'asc') {
      this.sort(id, 'desc');
    } else if (order === 'desc') {
      this.sort(id, 'asc');
    }
  }

  _deleteHeaderEventListeners() {
    for (const elem of this.subElements.header.children) {
      elem.removeEventListener('pointerdown', this._sortHandle);
    }
  }

  _getColumnIndexByID = (id = '') => {
    for (let i = 0; i < this.headersConfig.length; i++) {
      if (id === this.headersConfig[i].id) {
        return i;
      }
    }

    return -1;
  }

  _getHeaderColumnTemplate = ({id = '', title = '', sortable = false}) => {
    const column = document.createElement('div');
    const columnLabel = document.createElement('span');
    const columnIndex = this._getColumnIndexByID(id);
    const dataAttributes = {
      id: this.columItems[columnIndex].id,
      order: this.currentSortDirection,
      sortable: this.columItems[columnIndex].sortable,
    };

    column.classList.add('sortable-table__cell');
    for (const attr in dataAttributes) {
      if (attr) {
        column.setAttribute(`data-${ attr }`, dataAttributes[attr]);
      }
    }
    columnLabel.textContent = `${ title }`;
    column.appendChild(columnLabel);
    return column;
  }

  _getProductTemplate = (props) => {
    const product = document.createElement('a');
    const content = Object.keys(props).map((prop, index) => {
      const column = this.columItems[index];

      if (column) {
        const columnName = column.id;

        if (column.template) {
          return column.template(prop);
        } else {
          return `<div class="sortable-table__cell">${ props[columnName] }</div>`;
        }
      }
    }).join('');

    product.href = '/products/';
    product.classList.add('sortable-table__row');
    product.insertAdjacentHTML('beforeend', content);

    return product;
  }

  _generateSubElement({ data, renderTemplate }) {
    return renderTemplate(data);
  }

  _renderTableHeader() {
    const { header } = this.subElements;

    header.root.dataset.element = 'header';
    header.root.classList.add('sortable-table__header', 'sortable-table__row');
    header.root.innerHTML = '';

    this.headersConfig.map((item, index) => {
      let elem = document.createElement('div');

      elem.appendChild(this._generateSubElement({
        data: this.headersConfig[index],
        renderTemplate: this._getHeaderColumnTemplate,
      }));
      elem = elem.firstElementChild;
      header.children[index] = elem;
    });

    header.children.map((column) => {
      header.root.insertAdjacentElement('beforeend', column);
    });
  }

  _renderTableBody() {
    const { body } = this.subElements;

    body.dataset.element = 'body';
    body.classList.add('sortable-table__body');
    body.innerHTML = '';

    const bodyChildren = this.data.map((item) => {
      let elem = document.createElement('div');

      elem.appendChild(this._generateSubElement({
        data: item,
        renderTemplate: this._getProductTemplate,
      }));
      elem = elem.firstElementChild;

      return elem;
    });

    bodyChildren.map((row) => {
      body.insertAdjacentElement('beforeend', row);
    });
  }

  _setSortArrow() {
    const sortArrow = `
                      <span data-element="arrow" class="sortable-table__sort-arrow">
                        <span class="sort-arrow"></span>
                      </span>
                      `;
    const { children: columns } = this.subElements.header;

    for (const column of columns) {
      const dataID = column.getAttribute('data-id');

      if (dataID === this.currentSortFieldID) {
        column.insertAdjacentHTML('beforeend', sortArrow);
      }
    }
  }

  sortOnClient(sortParams) {
    const {
      fieldValue,
      orderValue,
      sortType,
      sortDirection,
    } = sortParams;

    const sortOptions = {
      caseFirst: 'upper',
    };
    const sortLocales = ['ru', 'en'];

    switch (sortType) {
    case 'string':
      this.data.sort((a, b) => {
        return sortDirection[orderValue] * a[fieldValue].localeCompare(b[fieldValue], sortLocales, sortOptions);
      });
      break;
    case 'number':
      this.data.sort((a, b) => {
        return sortDirection[orderValue] * (a[fieldValue] - b[fieldValue]);
      });
    }
  }

  sortOnServer() {
    //sort on Server
  }

  sort(fieldValue = 'title', orderValue = 'asc') {
    const sortDirection = {
      'asc': 1,
      'desc': -1,
    };
    const getSortType = (fieldValue) => {
      for (const item of this.headersConfig) {
        if (item.id === fieldValue) {
          return item.sortType;
        }
      }
    };

    if (this.isSortLocally) {
      this.sortOnClient({
        fieldValue,
        orderValue,
        sortType: getSortType(fieldValue),
        sortDirection,
      });
    } else {
      this.sortOnServer();
    }
    this.currentSortFieldID = fieldValue;
    this.currentSortDirection = orderValue;
    this.render();
  }

  render() {
    let { root, header, body } = this.subElements;

    this._renderTableBody();
    this._renderTableHeader();

    root.classList.add('sortable-table');
    root.appendChild(header.root);
    root.appendChild(body);

    this.element.classList.add('products-list__container');
    this.element.dataset.element = 'productsContainer';
    this.element.appendChild(this.subElements.root);
    this._setSortArrow();

    this._addHeaderEventListeners();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this._deleteHeaderEventListeners();
  }
}
