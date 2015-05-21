const EXCLUDED_TAGS = /\b(?:file|submit|image|reset|button)\b/;

type FormValue = { [ key: string ]: any };

/**
 * Fills in a DOM form using values from a JavaScript object. Note that fields not specified in the value object will be
 * cleared.
 */
export function fromObject(form: HTMLFormElement, object: FormValue): void {
	const elements = form.elements;
	for (let i = 0; i < elements.length; i++) {
		const element = <HTMLInputElement> elements[i];
		const type = element.type;
		const name = element.name;

		if (!name || EXCLUDED_TAGS.test(type) || element.disabled) {
			continue;
		}

		switch (type) {
			case 'checkbox':
				element.checked = false;
				if (name in object) {
					const checkValue = Array.isArray(object[name]) ? object[name] : [ object[name] ];
					element.checked = checkValue.indexOf(element.value) !== -1;
				}
				break;

			case 'radio':
				element.checked = (name in object) && object[name] === element.value;
				break;

			case 'select-multiple':
				const multiSelectElement: HTMLSelectElement = <any> element;
				// A multi-select has no selection by default
				multiSelectElement.selectedIndex = -1;
				if (name in object) {
					const selectValue = Array.isArray(object[name]) ? object[name] : [ object[name] ];
					for (let i = 0; i < multiSelectElement.options.length; i++) {
						const option = multiSelectElement.options[i];
						option.selected = selectValue.indexOf(option.value) !== -1;
					}
				}
				break;

			case 'select-one':
				const selectElement: HTMLSelectElement = <any> element;
				// A single-select selects the first item by default
				selectElement.selectedIndex = 0;
				if (name in object) {
					const selectValue = object[name];
					for (let i = 0; i < selectElement.options.length; i++) {
						const option = selectElement.options[i];
						option.selected = selectValue.indexOf(selectValue) !== -1;
					}
				}
				break;

			case 'hidden':
			case 'text':
			case 'textarea':
			case 'password':
				// A text input value is the empty string by default
				element.value = object[name] || '';
				break;
		}
	}
}

/**
 * Gets the value of a form field.
 */
function getValue(field: HTMLInputElement): string | string[] {
	const type = field.type;
	let value: string | string[];

	if (type === 'radio' || type === 'checkbox') {
		if (field.checked) {
			value = field.value;
		}
	}
	else if (field.multiple) {
		// For fields with the 'multiple' attribute set, gather the values of all descendant <option> elements that are
		// selected.
		const values = <string[]> [];
		const elements = [ field.firstElementChild ];
		while (elements.length > 0) {
			for (let element = elements.pop(); element; element = element.nextElementSibling) {
				// tagName in HTML will always contain the canonical uppercase form
				if (element.tagName === 'OPTION') {
					const optionElement = <HTMLOptionElement> element;
					if (optionElement.selected) {
						values.push(optionElement.value);
					}
				}
				else {
					if (element.nextElementSibling) {
						elements.push(element.nextElementSibling);
					}
					if (element.firstElementChild) {
						elements.push(element.firstElementChild);
					}
					break;
				}
			}
		}
		if (values.length > 0) {
			value = values;
		}
	}
	else {
		value = field.value;
	}

	return value;
}

/**
 * Stores the value of a form field in a value object.
 */
function storeFieldValue(object: FormValue, field: HTMLInputElement) {
	const value = getValue(field);

	// Ignore null or undefined values
	if (value == null) {
		return;
	}

	const name = field.name;
	const current = object[name];

	if (typeof current === 'string') {
		object[name] = [ current, value ];
	}
	else if (Array.isArray(current)) {
		current.push(value);
	}
	else {
		object[name] = value;
	}
}

/**
 * Serializes a form node to a JavaScript object.
 */
export function toObject(form: HTMLFormElement): FormValue {
	const value: FormValue = {};
	const elements = form.elements;

	for (let i = 0; i < elements.length; i++) {
		const element = <HTMLInputElement> elements[i];
		if (element.name && !EXCLUDED_TAGS.test(element.type) && !element.disabled) {
			storeFieldValue(value, element);
		}
	}

	return value;
}
