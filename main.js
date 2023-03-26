const imageIndexLogic = () => {
	let index = 0;
	const getIndex = () => index;
	const setIndex = (val) => {
		index = val;
	};

	return {
		getIndex,
		setIndex,
	};
};

const imageIndex = imageIndexLogic();

const imageAddresses = (() => {
	const a = "./Pictures/a.jpg";
	const b = "./Pictures/b.png";
	const c = "./Pictures/c.jpg";
	const d = "./Pictures/d.jpg";
	const e = "./Pictures/e.jpg";
	const f = "./Pictures/f.jpg";
	return {
		a,
		b,
		c,
		d,
		e,
		f,
	};
})();

const imageArray = [
	imageAddresses.a,
	imageAddresses.b,
	imageAddresses.c,
	imageAddresses.d,
	imageAddresses.e,
	imageAddresses.f,
];

const controlIndex = (instruction) => {
	let index = imageIndex.getIndex();

	if (index < 5 && index > 0) {
		if (instruction == "slide-right") {
			index += 1;
		} else if (instruction == "slide-left") {
			index -= 1;
		}
	} else if (index == 5) {
		if (instruction == "slide-right") {
			index = 0;
		} else if (instruction == "slide-left") {
			index -= 1;
		}
	} else if (index == 0) {
		if (instruction == "slide-right") {
			index += 1;
		} else if (instruction == "slide-left") {
			index = 5;
		}
	}

	return index;
};

const updateIndex = (index) => {
	imageIndex.setIndex(index);
};

const slideImageRight = () => {
	const presentImage = document.querySelector(".image");
	pubSub.publish("load-next", "slide-right");
	presentImage.classList.add("move-right");
};

const slideImageLeft = () => {
	const presentImage = document.querySelector(".image");
	presentImage.classList.add("move-left");
	pubSub.publish("load-next", "slide-left");
};

const loadNextImage = (instruction) => {
	let index = controlIndex(instruction);
	const nextImage = document.querySelector(".next-image");
	nextImage.setAttribute("src", imageArray[index]);
	pubSub.publish("updated-index", index);
};

const prepareNewState = (instruction) => {
	const frame = document.querySelector(".frame");
	const presentImage = document.querySelector(".image");
	const nextImage = document.querySelector(".next-image");

	if (instruction == "slide-right") {
		nextImage.classList.add("animate-in-right");
	} else if (instruction == "slide-left") {
		nextImage.classList.add("animate-in-left");
	}

	setTimeout(() => {
		presentImage.remove();
		nextImage.classList.add("image");
		nextImage.classList.remove(
			"animate-in-left",
			"animate-in-right",
			"next-image"
		);
	}, 500);

	const newImagePlaceholder = document.createElement("img");
	newImagePlaceholder.classList.add("next-image");
	frame.append(newImagePlaceholder);
};

const pubSubLogic = () => {
	const eventStore = {};

	const subscribe = (event, func) => {
		if (eventStore[event] && Array.isArray(eventStore[event])) {
			eventStore[event].push(func);
		} else {
			eventStore[event] = [func];
		}
	};

	const publish = (event, ...args) => {
		if (eventStore[event] && Array.isArray(eventStore[event])) {
			eventStore[event].forEach((func) => {
				func.apply(null, args);
			});
		}
	};

	return {
		subscribe,
		publish,
	};
};

const scrollIntervalLogic = () => {
	let intervalName;
	const autoScroll = () => {
		intervalName = setInterval(slideImageRight, 4000);
	};
	const stopAutoScroll = () => clearInterval(intervalName);
	return {
		intervalName,
		autoScroll,
		stopAutoScroll,
	};
};

const scrollInterval = scrollIntervalLogic();

const pubSub = pubSubLogic();
pubSub.subscribe("updated-index", updateIndex);
pubSub.subscribe("load-next", loadNextImage);
pubSub.subscribe("load-next", prepareNewState);

const domEvents = (() => {
	const nextButton = document.querySelector(".right-arrow");
	const previousButton = document.querySelector(".left-arrow");
	const frameContainer = document.querySelector(".frame-container");

	window.addEventListener("load", scrollInterval.autoScroll);
	frameContainer.addEventListener("mouseenter", scrollInterval.stopAutoScroll);
	frameContainer.addEventListener("mouseleave", scrollInterval.autoScroll);

	nextButton.addEventListener("click", slideImageRight);
	previousButton.addEventListener("click", slideImageLeft);
})();
