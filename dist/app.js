

const defaultDatapack = 'enhanced_datapack';

function getAnswerStore() {
    return JSON.parse(sessionStorage.getItem('answerStore'));
}
function updateAnswerStore(store) {
    sessionStorage.setItem('answerStore', JSON.stringify(store));
}

async function App(datapack) {
    const pdatapack = processJSONPath(datapack);
	const answers = await fetch(pdatapack);
	const ans_object = await answers.json();
    const answeredStore = getAnswerStore() || {};
    let gameScore = getGameScore();

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
                gameScore = addGameScore(gameScore, input.value.trim().length);
				feedback.textContent = noCorrect + '/' + answers.length;

				if (noCorrect === answers.length) {
					feedback.textContent = 'Complete!';
				}
				answered.push(input.value);
                answeredStore[id] = answered;

                updateAnswerStore(answeredStore);
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

function initRuntime(e, useInputFPVal) {
    e.preventDefault();
    let fp = qs('.datapack-select').value;

    if(fp.trim() === '') qs('.datapack-select').value = defaultDatapack;
    fp = defaultDatapack;

    let dpsel = localStorage.getItem('datapack_sel')
    if(dpsel && !useInputFPVal){
        fp = dpsel;
    } else {
        localStorage.setItem('datapack_sel', fp);
    }
    
    if(validPath(fp.trim())) {
        qs('.loader').classList.remove('collapse');
        localStorage.setItem('datapack_sel', fp);
        setTimeout(() => {
            AppRuntime(fp.trim(), 700)
        },850)
    } else if (fp.trim() === '') {
        AppRuntime(defaultDatapack, 700)
    }
}

ael(dps, 'submit', (e) => {
    initRuntime(e, true);
});

ael('.restart', 'click', (e) => {
    newLeaderboardEntry(getGameScore());
    sessionStorage.clear();
    initRuntime(e);
});

AppRuntime(defaultDatapack);

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
    qs('.score-item').textContent = getGameScore();
    qs('input#main').value = 'Select a topic to begin!';
    qs('input#main').disabled = true;
    qs('p').textContent = '';
    qs('.datapack-choice').innerHTML = '';
    qs('.loader').classList.remove('collapse');
    qs('.loader-item').classList.remove('noview');
    qs('.datapack-select').value = dpack;
    populateLeaderboard(JSON.parse(localStorage.getItem('leaderboard')) || []);
    currentLeaderboardEntry(getGameScore());
}

function processJSONPath(path) {
    return path.endsWith('.json') ? path : path + '.json';
}

function getGameScore() {
    if (!sessionStorage.getItem('gameScore')) {
        sessionStorage.setItem('gameScore', 0);
    }
    return parseInt(sessionStorage.getItem('gameScore'));
}

function addGameScore(currentScore, length) {
    // calculate number of points to add based on length of answer
    let gameScore = currentScore + 9*length;
    sessionStorage.setItem('gameScore', gameScore);
    // add score to the leaderboard
    currentLeaderboardEntry(gameScore);
    return gameScore;
}

function populateLeaderboard(scores) {
    // scores is an unsorted array of numbers representing scores
    // sort through them, then loop through them, making a .entry-lb div with a .place and .score value, then append to .leaderboard-list

    const leaderboard = qs('.leaderboard-list');
    leaderboard.innerHTML = '';
    scores.sort((a,b) => b - a);
    scores.forEach((score, i) => {
        const entry = document.createElement('div');
        entry.classList.add('entry-lb');
        const place = document.createElement('div');
        place.classList.add('place');
        place.textContent = i + 1;
        const scoreDiv = document.createElement('div');
        scoreDiv.classList.add('score');
        // if score is current score, add a "current-score" class
        if (score === getGameScore()) {
            entry.classList.add('current-score');
        }
        scoreDiv.textContent = score;
        entry.appendChild(place);
        entry.appendChild(scoreDiv);
        leaderboard.appendChild(entry);
    });
}

function newLeaderboardEntry(score) {
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    // do not add score if it already exists
    if (scores.includes(score)) return;
    scores.push(score);
    localStorage.setItem('leaderboard', JSON.stringify(scores));
    populateLeaderboard(scores);
}

function currentLeaderboardEntry(score) {
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    // do not add score if it already exists
    if (scores.includes(score)) return;
    scores.push(score);
    populateLeaderboard(scores);
}

// Menu toggle

const infomenu = qs('.info-fmenu');
const infotoggle = qs('.info');

ael(infotoggle, 'click', () => {
    infomenu.classList.add('view');
})
ael(qs('.close-info'), 'click', () => {
    infomenu.classList.remove('view');
})


const leaderboardmenu = qs('.leaderboard-fmenu');
const leaderboardtoggle = qs('.leaderboard');

ael(leaderboardtoggle, 'click', () => {
    leaderboardmenu.classList.add('view');
})
ael(qs('.close-leaderboard'), 'click', () => {
    leaderboardmenu.classList.remove('view');
})


