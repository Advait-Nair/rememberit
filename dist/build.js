const add = qs('.add');
const removebtn = qs('.remove');

const title = qs('.title');
const entries = qs('.entries');
const text_col = qs('.text-col');
const bg_col = qs('.bg-col');

const data_entries = {};

ael(add, 'click', () => {
    data_entries[snakify(title.value)] = {
        "title": title.value,
        "set": listify(entries.value),
        "colour": bg_col.value,
        "text_colour": text_col.value
    };
    title.value = '';
    entries.value = '';
    text_col.value = '#ffffff';
    bg_col.value = '#000000';

    qs('.output').textContent = JSON.stringify(data_entries, null, 4);
});

ael(removebtn, 'click', () => {
	const key = snakify(title.value);
	delete data_entries[key];
	title.value = '';
	entries.value = '';
	text_col.value = '';
	bg_col.value = '';

	qs('.output').textContent = JSON.stringify(data_entries, null, 4);
});


function snakify(str) {
    return str.toLowerCase().replaceAll(' ', '_');
}

function listify(str) {
    // accept csv, newline
    // identify which is which and execute accordingly
    let list;
    if (str.includes(',')) {
        list = str.split(',')
    } else if (str.includes('\n')) {
        list = str.split('\n')
    }
    list = list.filter(e => {
		if (e.trim() != '') return e.trim();
	});

    return list;
}