export default class NotificationMessage {
  element = null;
  outerElement = null;
  notificationTypes = {
    success: {
      classList: ['success']
    },
    error: {
      classList: ['error']
    }
  }
  timerID = null;

  constructor(message = null, props = {}) {
    const {
      duration = 0,
      type = 'success'
    } = props;

    this.duration = duration;
    this.type = type;
    this.message = message;

    this._removeAllNotifications();
    this.render();
  }

  _removeAllNotifications() {
    const elements = document.querySelectorAll('[data-element="notification"]');

    for (const element of elements) {
      element.remove();
    }
  }

  _getNotificationClasslist() {
    const type = this.notificationTypes[this.type];

    if (type.classList) {
      return type.classList.join(' ');
    }
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this._getTemplate();
    this.element = this.element.firstElementChild;
    this.element.style.cssText += `--value:${ this.duration / 1000 }s`;
  }

  show(element = null) {
    if (element) {
      this.outerElement = element;
      this.outerElement.innerHTML = this.element.outerHTML;
      console.log(this.outerElement);
      document.body.append(this.outerElement);
    } else {
      document.body.append(this.element);
    }
    this.timerID = setTimeout(() => { this.remove(); }, this.duration);
  }

  remove() {
    if (this.outerElement) {
      this.outerElement.remove();
    } else {
      this.element.remove();
    }
    clearTimeout(this.timerID);
  }

  destroy() {
    this.remove();
  }

  _getTemplate() {
    return (
      `
      <div data-element="notification" class="notification ${ this._getNotificationClasslist() }">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${ this.type }</div>
          <div class="notification-body">
           ${ this.message }
          </div>
        </div>
      </div>
      `
    );
  }
}
