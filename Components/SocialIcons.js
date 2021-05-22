import Link from 'next/link';

export function SocialIcons(){
	return(
		<div className="social-icons-container">
			<Link href="https://facebook.com/#"><a>
				<i className="fab fa-facebook-square facebook"></i>
			</a></Link>
			<Link href="https://instagram.com/#"><a>
				<i className="fab fa-instagram instagram"></i>
			</a></Link>
			<Link href="https://linkedin.com/#"><a>
				<i className="fab fa-linkedin linkedin"></i>
			</a></Link>
			<Link href="https://twitch.com/#"><a>
				<i className="fab fa-twitch twitch"></i>
			</a></Link>
			<Link href="https://twitter.com/#"><a>
				<i className="fab fa-twitter-square twitter"></i>
			</a></Link>
			<Link href="https://youtube.com/#"><a>
				<i className="fab fa-youtube youtube"></i>
			</a></Link>
		</div>
	)
}