var files = [
	'avatars.js',
	'avatar-upgrades.js',
	'buried-treasures.js',
	'cannons.js',
	'dungeons.js',
	'feats.js',
	'heroes.js',
	'incidents.js',
	'lieutenants.js',
	'locations.js',
	'monsters.js',
	'overlord-decks.js',
	'party-upgrades.js',
	'plots.js',
	'relics.js',
	'rumors.js',
	'ship-upgrades.js',
	'shop-items.js',
	'skills.js',
	'tamalir-upgrades.js',
	'treasures.js',
];

var expansion_conversion = {
	"bg": "base game",
	"wod": "well of darkness",
	"aod": "altar of despair",
	"rtl": "road to legend",
	"toi": "tomb of ice",
	"sob": "sea of blood",
	"pr": "promos",
	"ee": "enduring evil",
};

var expansion_card_type = {}

const repoBaseUrl = 'https://raw.githubusercontent.com/any2cards/d1e/master';
//const repoBaseUrl = '';
const imgUrl = `${repoBaseUrl}/images/`;
const dataUrl = `${repoBaseUrl}/data/`;

var iconUrl = ``;
if (chrome.extension != undefined) {
	iconUrl = chrome.runtime.getURL('icon-32.png');
} else {
	iconUrl = 'icon-32.png';
}

const ignoredNodes = ['TEXTAREA', 'INPUT'];
const xwcRed = '#e81e25';
const offset = 5;
const imagePadding = 4;
const classname = '__xwc-container';

// Put longer names first, so "Bane Spider Nest" matches before "Bane Spider"
const sortData = (a, b) => (a.length > b.length ? -1 : 1);

const escapeRegExp = string => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const tooltip = document.createElement('div');

const hideTooltip = () => {
	tooltip.classList.add('__xwc-tooltip-hidden');
};

const showTooltip = () => {
	tooltip.classList.remove('__xwc-tooltip-hidden');
};

const hide = el => {
	el.classList.add('__xwc-hidden');
};

const show = el => {
	el.classList.remove('__xwc-hidden');
};

const fetchDataFile = fileName =>
	{
		return fetch(dataUrl + fileName, { mode: 'cors' })
		.then(res => res.json());
	};

const processData = data => {
	return data.reduce((a, c) => {
		if (c.image) {
			const keys = [`${c.name} (${c.points})`, c.name];

			if (c.name.indexOf('"') > -1) {
				keys.push(c.name.replace(/"/g, ''));
			}

			keys.forEach(k => {
				const key = k.toLowerCase();
				a[key] = a[key] || [];
				a[key].push(c);
			});
		}
		return a;
	}, {});
};

const fetchAllData = async () =>
	Promise.all(files.map(file => fetchDataFile(file)))
		.then(values => [].concat.apply([], values))
		.then(processData);

const filterData = data => {
	let filtered = data;
	for (let key of Object.keys(filtered)) {
		var i = filtered[key].length
		while (i--) {
			let value = filtered[key][i];
			let expansion = value["expansion"];
			let image = value["image"];
			let card_type = image.substring(0, image.indexOf("/"));
			if (expansion in expansion_card_type) {
				if (card_type in expansion_card_type[expansion]) {
					if (expansion_card_type[expansion][card_type]) {
						continue;
					}
				}
			}
			filtered[key].splice(i, 1);
		}
		if (filtered[key].length == 0) {
			delete filtered[key];
		}
	}
	return filtered;
}

const deleteSpanNodes = () => {
	while (true) {
		const elements = Array.from(document.querySelectorAll("span." + classname));
		elements.forEach(e => {
			if (e.classList.length == 1 && e.classList[0] == classname) {
				let parent = e.parentNode;
				if (parent != null) {
					e.replaceWith(e.innerText);
					let html = parent.innerHTML;
					parent.innerHTML = html;
				}
			}
		});
		if (elements.length == 0) {
			break;
		}
	}
};

async function getData() {
	const data = await fetchAllData();
	cardsData = filterData(data);
	if (Object.keys(data).length > 0) {
		regExp = new RegExp(generateRegExpString(data), 'ig');
	}
	deleteSpanNodes();
	updateElement(document.body);
}

function updateElement(element) {
	if (regExp) {
		getTextNodes(element, (parent, node) => replaceMatchesInNode(node, regExp));
	}
}

let stopInterval;

const getExpFromInputId = (input_id) => {
	let idx = input_id.indexOf("-");
	if (idx >= 0) {
		shortExp = input_id.substring(0, input_id.indexOf("-"));
		return expansion_conversion[shortExp];
	}
	return null;
}

const getTypeFromInputId = (input_id) => {
	let idx = input_id.indexOf("-");
	if (idx >= 0) {
		return input_id.substring(input_id.indexOf("-")+1);
	}
	return null;
}

function loadFromStorage() {
	var inputArr = {};

	// Establish a default value for the extension in case storage is empty and/or this is the first time it is used
	// These values are in the Checkbox ID order for popup.html
	var extdefault = {
		"d1e": true,
		"ffg": true,
		"bg": true,
		"bg-heroes": true,
		"bg-monsters": true,
		"bg-overlord-decks": true,
		"bg-relics": true,
		"bg-shop-items": true,
		"bg-skills": true,
		"bg-treasures": true,
		"wod": true,
		"wod-heroes": true,
		"wod-monsters": true,
		"wod-overlord-decks": true,
		"wod-relics": true,
		"wod-shop-items": true,
		"wod-skills": true,
		"wod-treasures": true,
		"aod": true,
		"aod-heroes": true,
		"aod-monsters": true,
		"aod-overlord-decks": true,
		"aod-relics": true,
		"aod-shop-items": true,
		"aod-skills": true,
		"aod-treasures": true,
		"rtl": true,
		"rtl-avatars": true,
		"rtl-avatar-upgrades": true,
		"rtl-dungeons": true,
		"rtl-incidents": true,
		"rtl-lieutenants": true,
		"rtl-locations": true,
		"rtl-monsters": true,
		"rtl-party-upgrades": true,
		"rtl-plots": true,
		"rtl-relics": true,
		"rtl-rumors": true,
		"rtl-shop-items": true,
		"rtl-skills": true,
		"rtl-tamalir-upgrades": true,
		"toi": true,
		"toi-feats": true,
		"toi-heroes": true,
		"toi-monsters": true,
		"toi-overlord-decks": true,
		"toi-relics": true,
		"toi-shop-items": true,
		"toi-treasures": true,
		"sob": true,
		"sob-avatars": true,
		"sob-avatar-upgrades": true,
		"sob-buried-treasures": true,
		"sob-cannons": true,
		"sob-dungeons": true,
		"sob-heroes": true,
		"sob-incidents": true,
		"sob-lieutenants": true,
		"sob-locations": true,
		"sob-monsters": true,
		"sob-plots": true,
		"sob-rumors": true,
		"sob-ship-upgrades": true,
		"sob-shop-items": true,
		"sob-skills": true,
		"pr": true,
		"pr-heroes": true,
		"usrcom": true,
		"ee": true,
		"ee-feats": true,
		"ee-monsters": true,
		"ee-overlord-decks": true,
		"ee-relics": true,
		"ee-shop-items": true,
		"ee-skills": true,
		"ee-treasures": true
	}

	chrome.storage.sync.get({['inputArr']: extdefault}, async function(item) {
		inputArr = item.inputArr;
		for (const [input_id, checked] of Object.entries(inputArr)) {
			let exp = getExpFromInputId(input_id);
			let type = getTypeFromInputId(input_id);
			if (exp == null || type == null) {
				continue;
			}
			if (expansion_card_type[exp] == null) {
				expansion_card_type[exp] = {};
			}
			expansion_card_type[exp][type] = checked;
		}
		await getData();
	});
}

let regExp = null;
let cardsData = {};
let allMatches = {};
let tooltipImgContainer;

const tooltipLoader = document.createElement('div');
tooltipLoader.classList.add('__xwc-loading-cube-grid');
hide(tooltipLoader);
tooltipLoader.innerHTML = `
	<div class="__xwc-loading-cube __xwc-loading-cube1"></div>
	<div class="__xwc-loading-cube __xwc-loading-cube2"></div>
	<div class="__xwc-loading-cube __xwc-loading-cube3"></div>
	<div class="__xwc-loading-cube __xwc-loading-cube4"></div>
	<div class="__xwc-loading-cube __xwc-loading-cube5"></div>
	<div class="__xwc-loading-cube __xwc-loading-cube6"></div>
	<div class="__xwc-loading-cube __xwc-loading-cube7"></div>
	<div class="__xwc-loading-cube __xwc-loading-cube8"></div>
	<div class="__xwc-loading-cube __xwc-loading-cube9"></div>
`;

const createTooltip = () => {
	tooltip.classList.add(classname);
	tooltip.classList.add('__xwc-tooltip');
	hideTooltip();

	tooltip.appendChild(tooltipLoader);

	tooltipImgContainer = document.createElement('div');
	tooltipImgContainer.classList.add('__xwc-image-container');

	const tooltipLine = document.createElement('span');
	tooltipLine.innerHTML = `
		<p class="__xwc-powered-by">
			<img src="${iconUrl}" />
			Powered by D1e Asset Viewer
		</p>
		`;

	tooltip.appendChild(tooltipImgContainer);
	tooltip.appendChild(tooltipLine);

	document.body.appendChild(tooltip);
};

const getTextNodes = (root, fn) => {
	if (root.getElementsByTagName) {
		const elements = root.getElementsByTagName('*');
		Array.from(elements).forEach(e => {
			if (!e.classList?.contains(classname) && ignoredNodes.indexOf(e.nodeName) === -1) {
				Array.from(e.childNodes).forEach(c => {
					if (c.nodeType === Node.TEXT_NODE) {
						fn(e, c);
					}
				});
			}
		});
	}
};

const replaceMatchesInNode = (node, regExp) => {
	let matches;

	while ((matches = regExp.exec(node.nodeValue)) !== null) {
		const match = matches[0];
		const lastIndex = regExp.lastIndex;

		const container = document.createElement('span');
		container.classList.add(classname);
		container.appendChild(document.createTextNode(match));

		const after = node.splitText(lastIndex - match.length);
		after.nodeValue = after.nodeValue.substring(match.length);
		node.parentNode.insertBefore(container, after);

		// Set up for next iteration
		node = after;
		regExp.lastIndex = 0;
	}
};

const throttle = (fn, threshhold = 250) => {
	let last;
	let deferTimer;

	return (...args) => {
		const context = this;
		const now = Date.now();

		if (last && now < last + threshhold) {
			// hold on to it
			clearTimeout(deferTimer);
			deferTimer = setTimeout(function() {
				last = now;
				fn.apply(context, args);
			}, threshhold);
		} else {
			last = now;
			fn.apply(context, args);
		}
	};
};

var images = [];

const moveTooltip = (e) => {
	const windowRightBound = window.scrollX + window.innerWidth;
	let x = window.scrollX + e.clientX + offset;
	let y = window.scrollY + e.clientY + offset;
	var right = x + 20;
	var cardHeight = 0;
	for (let image of images) {
		right += image.width + imagePadding;
		if (image.height > cardHeight) {
			cardHeight = image.height;
		}
	}

	if (right > windowRightBound) {
		x = 0;
	}
	if (x < 0) {
		x = 0;
	}

	var poweredby = 50;
	if (y + cardHeight + poweredby > window.scrollY + window.innerHeight) {
		y = y - (y + cardHeight + poweredby - (window.scrollY + window.innerHeight)) - 20;
	}

	if (y < 0) {
		y = 0;
	}

	tooltip.style.top = y + 'px';
	tooltip.style.left = x + 'px';
};

const generateRegExpString = data => {
	const start = '(?=^|\\s|\\b)(';
	const end = ')(?=s?(\\s|\\b|$))';
	const delimiter = '----';
	const r =
		start +
		escapeRegExp(
			Object.keys(data)
				.sort(sortData)
				.join(delimiter),
		).replace(new RegExp(delimiter, 'g'), '|') +
		end;
	return r;
};

// Show the tooltip after entering the highlighted area
document.body.addEventListener(
	'mouseover',

	e => {
		const target = e.target;

		if (e.ctrlKey && e.target && target != document && target.matches('.' + classname)) {
			const match = target.textContent;

			// Set to 1 because we'll have at least 1 match, so it gets taken into account when
			// positioning the tooltip -- see moveTooltip()

			show(tooltipLoader);
			tooltipImgContainer.innerHTML = '';

			// Update tooltip position
			moveTooltip(e);

			// Update tooltip image source
			let promises = [];
			images = [];

			if (cardsData[match.toLowerCase()] == undefined) {
				return;
			}

			cardsData[match.toLowerCase()].forEach(c => {
				const promise = new Promise((resolve, reject) => {
					const image = new Image();
					image.onload = resolve;
					image.onerror = reject;
					image.src = imgUrl + c.image;
					hide(image);

					images.push(image);
					tooltipImgContainer.appendChild(image);
				});

				promises.push(promise);
			});

			// When all images are loaded; Hide loader and show images
			Promise.all(promises).then(() => {
				images.forEach(image => {
					// image.height = 'auto';
					// image.width = 'auto';
					show(image);
				});
				hide(tooltipLoader);
				// Update tooltip position
				moveTooltip(e);
			});

			// Reveal tooltip if CTRL key is pressed while hovering over card name!
			showTooltip();
		}
	},
	false,
);

// Hide the tooltip after leaving the highlighted area
document.body.addEventListener(
	'mouseleave',
	e => {
		const target = e.target;
		if (target && target != document && target.matches('.' + classname)) {
			// Hide tooltip
			hideTooltip();
		}
	},
	true,
);

// Every 200ms update the tooltip position
document.body.addEventListener(
	'mousemove',
	throttle(e => {
		const target = e.target;
		if (target && target != document && target.matches('.' + classname)) {
			// Move tooltip
			if (!tooltip.classList.contains('__xwc-tooltip-hidden')) {
				moveTooltip(e);
			}
		}
	}, 200),
	true,
);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == 'expansions_data') {
		expansion_card_type = request.expansions;
		sendResponse({ complete: true, from: "content" });
		getData();
	} else {
		sendResponse({ complete: false, from: "content" });
	} 
});

function mutationGetData(mutations) {
	// Update just the elements that were added, and their children, except the
	// ones added by WAV.
	mutations
		.filter((m) => m.type === "childList")
		.flatMap((m) => Array.from(m.addedNodes.values()))
		.filter((n) => n.getElementsByTagName && !n.classList?.contains(classname))
		.forEach((n) => updateElement(n));
}

document.body.onload = function() {
	loadFromStorage();
	createTooltip();
	const observer = new MutationObserver(mutationGetData);
	observer.observe(document.body, { childList: true, subtree: true });
}
