window.onload = function () {
	let prev = document.querySelector('.btn-slider-prev');
	let next = document.querySelector('.btn-slider-next');
	let slider = document.querySelector('.slider');
	

	// clone one slider
	function cloneSlider() {
		let firstSlider = slider.firstElementChild.cloneNode(true);
		slider.appendChild(firstSlider);
	}
	cloneSlider();

	// inline style widght for all wrap slider
	function addStyleWidght() {

		[].forEach.call(slider.children, (slide)=> {
			slide.style.width = slider.clientWidth + 'px';
		})
	} 
	addStyleWidght();

	if(next) {
		next.addEventListener('click', nextSlider);
	}
	if(prev) {
		prev.addEventListener('click', prevSlider);
	}

	// basic
	let widthOnePhoto = slider.clientWidth;
	let allWidthSlider = slider.children.length * widthOnePhoto;
	slider.style.width = allWidthSlider + "px";
	let offset = 0;
	let pos = 0;
	let loop;
	let step = 10; // adjustment speed move slide

	function nextSlider() {
		pos -= step;
		offset += step;

		slider.style.transform = "translate3d(" + pos + "px, 0, 0)";
		loop = window.requestAnimationFrame(nextSlider);

		if (offset == widthOnePhoto) {
			window.cancelAnimationFrame(loop);
			offset = 0;
			widthOne = widthOnePhoto;
		}

		if (pos < -(allWidthSlider - widthOnePhoto)) {
			slider.style.transform = "translate3d(0, 0, 0)";
			pos = 0;
			offset = 0;
		}
	}

	function prevSlider() {
		pos += step;
		offset += step;

		slider.style.transform = "translate3d(" + pos + "px, 0, 0)";
		loop = window.requestAnimationFrame(prevSlider);

		checkoutWidthOneSleder();

		if (pos == step) {
			slider.style.transform = "translate3d(" + -(allWidthSlider - widthOnePhoto) + "px, 0, 0)";
			pos = -(allWidthSlider - widthOnePhoto);
			offset = 0;
		}
	}

	function checkoutWidthOneSleder() {
		if (offset == widthOnePhoto) {
			window.cancelAnimationFrame(loop);
			offset = 0;
			widthOne = widthOnePhoto;
		}
	}

}