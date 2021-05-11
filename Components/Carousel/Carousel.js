import { useEffect, useState } from 'react';
import { Slide } from './Slide';
import { Dot } from './Dot';
import slideContent from '../../data/slides.json';

export function Carousel(){
	const [currentSlide, setCurrentSlide] = useState(0);
	const maxSlides = 3;

	useEffect(() => {
		showSlides(currentSlide);
	}, []);

	function showSlides(slideIndex){
		const slides = document.getElementsByClassName('slide');
		const dots = document.getElementsByClassName('dot');

		if (slides.length > 0){
			for (let i = 0; i < slides.length; i++) {
				slides[i].classList.remove('active');
				dots[i].classList.remove('active');
			}

			slides[slideIndex].classList.add('active');
			dots[slideIndex].classList.add('active');
		}
	}

	function handleNextClick(){
		const next = currentSlide + 1;
		setCurrentSlide(next === maxSlides ? 0 : next);
		showSlides(currentSlide);
	}

	function handlePreviousClick(){
		const previous = currentSlide - 1;
		setCurrentSlide(previous < 0 ? maxSlides : previous);
		showSlides(currentSlide);
	}
	
	function handleDotClick(n) {
		setCurrentSlide(n);
		showSlides(currentSlide);
	}

	return(
		<section className="carousel-container">
			<div className="product-carousel">
				{
					slideContent.map(({ productName, slideText, slideMemeText, slideImage }) => {
						return(
							<Slide 
								key={ productName }
								productName={ productName }
								slideText={ slideText }
								slideMemeText={ slideMemeText }
								slideImage={ slideImage }
							/>
						);
					})
				}
				<button className="prev"
					onClick={ () => handlePreviousClick() }
				>
					<i className="fas fa-chevron-circle-left"></i>
				</button>
				<button className="next"
					onClick={ () => handleNextClick() }
				>
					<i className="fas fa-chevron-circle-right"></i>
				</button>
			</div>
			<div className="dots-container">
				{
					slideContent.map((slide, index) => {
						return(
							<Dot
								key={ index }
								onClick={ () => handleDotClick(index) }
							/>
						);
					})
				}
			</div>
		</section>
	)
}