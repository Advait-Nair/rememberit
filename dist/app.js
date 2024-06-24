async function App(datapack) {
    const pdatapack = processJSONPath(datapack);
	const answers = await fetch(pdatapack);
	const ans_object = await answers.json();
    const answeredStore = {};
    let gameScore = 0;

    resetEnv(datapack);

    // populate datapack-choice with all objects in ans_object
    const choice = qs('.datapack-choice');
    for (const key in ans_object) {
        const button = document.createElement('button');
        button.textContent = ans_object[key].title;
        button.dataset['ans'] = key;
        choice.appendChild(button);
    }

	// listen to button clicks
	const buttons = qsa('button');
	buttons.forEach(button => {
		ael(button, 'click', () => {
			const ans = button.dataset['ans'];
            const input = qs('input#main');
            buttons.forEach(b => {b.classList.remove('selected'); b.style.background = ''; b.style.color = ''});
            button.classList.add('selected');
            button.style.background = ans_object[ans].colour;
            button.style.color = ans_object[ans].text_colour;
            input.disabled = false;
            input.focus();
            input.value = '';
			game(ans_object[ans].set, ans);
		});
	});




	function game(answers,id) {
		const input = qs('input#main');
		const feedback = qs('p');
		let noCorrect = answeredStore[id] ? answeredStore[id].length : 0;
		const answered = answeredStore[id] || [];

		feedback.textContent = noCorrect + '/' + answers.length;

		ael(input, 'keyup', () => {
			if (
				exists(answers, input.value, true) &&
				!exists(answered, input.value, true)
			) {
				noCorrect++;
                gameScore += 50;
				feedback.textContent = noCorrect + '/' + answers.length;

				if (noCorrect === answers.length) {
					feedback.textContent = 'Complete!';
				}
				answered.push(input.value);
                answeredStore[id] = answered;
				input.value = '';

                qs('.score-item').textContent = gameScore;

				feedback.classList.add('correct');
				setTimeout(() => {
					feedback.classList.remove('correct');
				}, 1000);
			}
		});
	}

	function exists(arr, check, nullCase) {
		// check if check exists in arr
		// if nullCase is true, make all entries lowercase and do not compare based on capitalisation
		if (nullCase) {
			return arr
				.map(e => e.toLowerCase())
				.includes(check.trim().toLowerCase());
		}
		return arr.includes(check.trim());
	}
}


const dps = qs('.get_datapack');
ael(dps, 'submit', (e) => {
    e.preventDefault();
    const fp = qs('.datapack-select').value;
    if(validPath(fp.trim())) {
        qs('.loader').classList.remove('collapse');
        setTimeout(() => {
            AppRuntime(fp.trim(), 700)
        },850)
    } else if (fp.trim() === '') {
        AppRuntime('enhanced_datapack', 700)
    }
});

AppRuntime('enhanced_datapack');

function AppRuntime(datapack, delay) {
    App(datapack).then(() => {
        setTimeout(() => {
            qs('.loader').classList.add('collapse')
        }, 400 + (delay || 0))
        // qs('.loader-item').classList.add('noview')
    });
}


function validPath(path) {
    try {
        fetch(processJSONPath(path));
        return true;
    } catch {
        return false;
    }
}

function resetEnv(dpack) {
    qs('.score-item').textContent = 0;
    qs('input#main').value = 'Select a topic to begin!';
    qs('input#main').disabled = true;
    qs('p').textContent = '';
    qs('.datapack-choice').innerHTML = '';
    qs('.loader').classList.remove('collapse');
    qs('.loader-item').classList.remove('noview');
    qs('.datapack-select').value = dpack;
}

function processJSONPath(path) {
    return path.endsWith('.json') ? path : path + '.json';
}