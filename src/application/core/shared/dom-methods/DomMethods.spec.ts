import { DomMethods } from './DomMethods';
import SpyInstance = jest.SpyInstance;

describe('DomMethods', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('DomMethods.insertScript', () => {
    const { scriptUrl } = createFormFixture();

    it('should inject script to head and return an observable with inserted script', () => {
      DomMethods.insertScript('head', scriptUrl).subscribe(script => {
        expect(script.src).toEqual(scriptUrl.src);
        expect(document.head.innerHTML).toBe('<script src="http://example.com/test.js"></script>');
      });
    });
  });

  describe('DomMethods.insertStyle', () => {
    it('should inject style to head', () => {
      DomMethods.insertStyle(['.st-iframe-factory: {color: #fff}']);
      expect(document.head.innerHTML).toBe('<style id="insertedStyles" type="text/css"></style>');
    });
  });

  describe('DomMethods.addDataToForm', () => {
    const { parseFormObject } = createFormFixture();

    it('should add all fields if not provided', () => {
      const form = document.createElement('form');
      DomMethods.addDataToForm(form, parseFormObject);
      expect(form.querySelector('[name="stFieldName"]').getAttribute('value')).toBe('');
      expect(form.querySelector('[name="stFieldName"]').tagName).toBe('INPUT');
      expect(form.querySelector('[name="stFieldName"]').getAttribute('type')).toBe('hidden');
      expect(form.querySelector('[name="stFieldName"]').getAttribute('class')).toBe('-st-created-field');
      expect(form.querySelector('[name="stFieldName2"]').getAttribute('value')).toBe('some value');
      expect(form.querySelector('[name="stDuplicate"]').getAttribute('value')).toBe('value2');
      expect(form.querySelector('[name="stSelectName"]').getAttribute('value')).toBe('B');
    });

    it('should only add specified fields if provided', () => {
      const form = document.createElement('form');
      DomMethods.addDataToForm(form, parseFormObject, ['stFieldName', 'stFieldName2']);
      expect(form.querySelector('[name="stFieldName"]').getAttribute('value')).toBe('');
      expect(form.querySelector('[name="stFieldName2"]').getAttribute('value')).toBe('some value');
      expect(form.querySelector('[name="stDuplicate"]')).toBe(null);
      expect(form.querySelector('[name="stSelectName"]')).toBe(null);
    });

    it('should update fields value if it already exists', () => {
      const form = document.createElement('form');

      DomMethods.addDataToForm(form, { foo: 'bar' }, ['foo']);
      DomMethods.addDataToForm(form, { foo: 'baz' }, ['foo']);

      expect(form.querySelectorAll('[name=foo]').length).toBe(1);
      expect(form.querySelector('[name=foo]').getAttribute('value')).toBe('baz');
    });
  });

  describe('DomMethods.parseMerchantForm', () => {
    let spy: SpyInstance;
    const { html } = createFormFixture();

    beforeEach(() => {
      document.body.innerHTML = html;
      spy = jest.spyOn(DomMethods, 'parseForm');
    });

    it('should call parseForm()', () => {
      DomMethods.parseForm('st-form');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('DomMethods.removeAllChildren', () => {
    beforeEach(() => {
      const element = document.createElement('div');
      const child1 = document.createElement('input');
      const child2 = document.createElement('img');
      const child3 = document.createElement('div');
      element.id = 'some-id';
      document.body.appendChild(element);
      document.getElementById('some-id').appendChild(child1).appendChild(child2).appendChild(child3);
    });

    it('should remove all children of specified iframe-factory', () => {
      expect(DomMethods.removeAllChildren('some-id').childNodes.length).toEqual(0);
    });
  });

  describe('DomMethods.removeAllCreatedFields()', () => {
    it('should remove all fields added to form', () => {
      const { form } = createFormFixture();

      DomMethods.addDataToForm(form, { foo: 'bar', bar: 'baz' });
      expect(form.querySelectorAll('.-st-created-field').length).toBe(2);
      DomMethods.removeAllCreatedFields(form);
      expect(form.querySelectorAll('.-st-created-field').length).toBe(0);
    });
  });

  describe('DomMethods.getAllIframes()', () => {
    it('retrieves all iframes from the document', () => {
      const iframe1 = document.createElement('iframe');
      const iframe2 = document.createElement('iframe');
      document.body.appendChild(iframe1);
      document.body.appendChild(iframe2);

      expect(DomMethods.getAllIframes()).toEqual([iframe1, iframe2]);
    });

    it('returns an empty array if there are no iframes in document', () => {
      expect(DomMethods.getAllIframes()).toEqual([]);
    });
  });

  describe('DomMethods.removeFormFieldByName()', () => {
    const removedFieldName = 'hiddenInput';
    let testForm: HTMLFormElement;
    let otherForm: HTMLFormElement;

    const formHtml = `<input type="text" name="name">
        <input type="password" name="password">
        <input type="hidden" name="${removedFieldName}">
        <input type="radio" name="radioButton" id="radioFirstChoice" value="1">
        <input type="radio" name="radioButton" id="radioSecondChoice" value="2">
        <input type="radio" name="radioButton" id="radioThirdChoice" value="3">
    `;
    const testHtml = `
      <form id="otherForm">${formHtml}</form>
      <form id="testForm">${formHtml}</form>
    `;

    beforeEach(() => {
      document.body.innerHTML = testHtml;
      testForm = document.forms['testForm'];
      otherForm = document.forms['otherForm'];
    });

    it('should remove elements with given name only from given form', function () {
      DomMethods.removeFormFieldByName(testForm, removedFieldName);

      expect(testForm.elements.namedItem(removedFieldName)).toBe(null);
      expect(otherForm.elements.namedItem(removedFieldName)).toBeDefined();
    });
  });
});

function addInput(form: HTMLFormElement, name: string, value: string, stName?: string) {
  const input = document.createElement('input');
  input.name = name;
  input.value = value;
  if (stName) {
    input.setAttribute('data-st-name', stName);
  }
  form.appendChild(input);
}

function createFormFixture() {
  const html =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  const htmlForParentAndChild =
    '<form id="st-form" class="example-form"><h1 class="example-form__title" id="some-title"> Secure Trading</h1></form>';

  const form = document.createElement('form');
  addInput(form, 'myfield', '', 'stFieldName');
  addInput(form, 'myfield2', 'some value', 'stFieldName2');
  addInput(form, 'myfield3', 'ignored');
  addInput(form, 'duplicate', 'value1', 'stDuplicate');
  addInput(form, 'duplicate', 'value2', 'stDuplicate');

  const select = document.createElement('select');
  select.name = 'selectField';
  select.setAttribute('data-st-name', 'stSelectName');

  const opt1 = document.createElement('option');
  const opt2 = document.createElement('option');

  const scriptUrl = { src: 'http://example.com/test.js' };
  const parseFormObject = {
    stFieldName: '',
    stFieldName2: 'some value',
    stDuplicate: 'value2',
    stSelectName: 'B',
  };
  opt1.value = 'A';
  opt2.value = 'B';
  opt2.selected = true;
  select.appendChild(opt1);
  select.appendChild(opt2);
  form.appendChild(select);
  return { form, html, htmlForParentAndChild, parseFormObject, scriptUrl };
}
