import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import * as form from 'src/dom/form';

type FormValue = { [ key: string ]: any };

const form1 = document.createElement('form');
const form2 = document.createElement('form');
const form3 = document.createElement('form');
const form4 = document.createElement('form');
const form5 = document.createElement('form');
const form6 = document.createElement('form');

const value1 = {
	blah: 'blah'
};
const value1_set = <FormValue> {
	blah: 'blargh'
};
const value2 = {
	blah: 'blah',
	multi: [ 'thud', 'thonk' ],
	single: 'thud',
	textarea: 'textarea_value'
};
const value2_set = <FormValue> {
	blah: 'blargh',
	multi: [ 'blah', 'thonk' ],
	single: 'thonk',
};
const value3 = {
	spaces: 'string with spaces'
};
const value3_set = <FormValue> {
	spaces: 'fewer words'
};
const value4 = {
	action: 'Form with input named action'
};
const value5 = {
	'blåh': 'bláh'
};
const value6 = {
	cb_group: 'foo',
	radio_group: 'bam'
};
const value6_1 = {
	cb_group: 'boo',
	radio_group: 'baz'
};
const value6_2 = {
	cb_group: [ 'foo', 'boo' ],
	radio_group: 'baz'
};
const value6_set = <FormValue> {
	cb_group: [ 'boo' ],
	radio_group: 'baz'
}

registerSuite({
	name: 'dom/form',

	beforeEach() {
		form1.innerHTML = `
			<form id="f1" style="border: 1px solid black;">
				<input id="blah" type="text" name="blah" value="blah">
				<input id="no_value" type="text" name="no_value" value="blah" disabled>
				<input  id="no_value2" type="button" name="no_value2" value="blah">
			</form>
		`;
		form2.innerHTML = `
			<form id="f2" style="border: 1px solid black;">
				<input id="blah" type="text" name="blah" value="blah">
				<input id="no_value" type="text" name="no_value" value="blah" disabled>
				<input id="no_value2" type="button" name="no_value2" value="blah">
				<select id="single" type="select" name="single">
					<optgroup label="Stuff">
						<option value="blah">blah</option>
						<option value="thud" selected>thud</option>
					</optgroup>
					<optgroup label="Other Stuff">
						<option value="thonk">thonk</option>
					</optgroup>
				</select>
				<select id="multi" type="select" multiple name="multi">
					<option value="blah">blah</option>
					<option value="thud" selected>thud</option>
					<option value="thonk" selected>thonk</option>
				</select>
				<textarea id="textarea" name="textarea">textarea_value</textarea>
				<button id="button1" name="button1" value="buttonValue1">This is a button that should not be in formToObject.</button>
				<input id="fileParam1" type="file" name="fileParam1" value="fileValue1"> File input should not show up in formToObject.
			</form>
		`;
		form3.innerHTML = `
			<form id="f3" style="border: 1px solid black;">
				<input id="spaces" type="hidden" name="spaces" value="string with spaces">
			</form>
		`;
		form4.innerHTML = `
			<form id="f4" style="border: 1px solid black;" action="xhrDummyMethod.php">
				<input id="action" type="hidden" name="action" value="Form with input named action">
			</form>
		`;
		form5.innerHTML = `
			<form id="f5" style="border: 1px solid black;">
				<input id="blah" type="text" name="blåh" value="bláh">
				<input id="no_value" type="text" name="no_value" value="blah" disabled>
				<input id="no_value2" type="button" name="no_value2" value="blah">
			</form>
		`;
		form6.innerHTML = `
			<form id="f6" style="border: 1px solid black;">
				<input id="checkbox1" type="checkbox" name="cb_group" value="foo" checked>
				<input id="checkbox2" type="checkbox" name="cb_group" value="boo">
				<input id="radio1" type="radio" name="radio_group" value="baz">
				<input id="radio2" type="radio" name="radio_group" value="bam" checked>
			</form>
		`;
	},
	
	'.fromObject'() {
		form.fromObject(form1, value1_set);
		assert.strictEqual(form1['blah'].value, value1_set['blah']);

		form.fromObject(form2, value2_set);
		assert.strictEqual(form2['blah'].value, value2_set['blah']);
		assert.strictEqual(form2['multi'].options[0].selected, true);
		assert.strictEqual(form2['multi'].options[1].selected, false);
		assert.strictEqual(form2['multi'].options[2].selected, true);
		assert.strictEqual(form2['single'].options[0].selected, false);
		assert.strictEqual(form2['single'].options[1].selected, false);
		assert.strictEqual(form2['single'].options[2].selected, true);
		assert.strictEqual(form2['textarea'].value, '');

		form.fromObject(form3, value3_set);
		assert.strictEqual(form3['spaces'].value, value3_set['spaces']);

		form.fromObject(form6, value6_set);
		assert.isFalse(form6['checkbox1'].checked);
		assert.isTrue(form6['checkbox2'].checked);
		assert.isTrue(form6['radio1'].checked);
		assert.isFalse(form6['radio2'].checked);
	},

	'.toObject'() {
		assert.deepEqual(form.toObject(form1), value1);
		assert.deepEqual(form.toObject(form2), value2);
		assert.deepEqual(form.toObject(form3), value3);
		assert.deepEqual(form.toObject(form4), value4);
		assert.deepEqual(form.toObject(form5), value5);
		assert.deepEqual(form.toObject(form6), value6);

		form6['checkbox1'].checked = false;
		form6['checkbox2'].checked = true;
		form6['radio1'].checked = true;
		assert.deepEqual(form.toObject(form6), value6_1);

		form6['checkbox1'].checked = true;
		assert.deepEqual(form.toObject(form6), value6_2);
	}
});
