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
		setCurrentSlide(prevState => (prevState + 1 === maxSlides) ? 0 : prevState + 1);
		showSlides(currentSlide);
	}

	function handlePreviousClick(){
		setCurrentSlide(prevState => (prevState - 1 < 0) ? maxSlides - 1 : prevState - 1);
		showSlides(currentSlide);
	}
	
	function handleDotClick(dotIndex) {
		setCurrentSlide(dotIndex);
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