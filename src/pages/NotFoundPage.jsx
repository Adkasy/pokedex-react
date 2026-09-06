import { Link } from "react-router"
import { PokeballIcon } from "../components/TypeIcon"

const NotFoundPage = () => {
	return (
		<div className="not-found-page">
			<PokeballIcon size={80} />
			<h1 className="not-found-title">404</h1>
			<p className="status-message">Halaman gak ketemu.</p>
			<Link className="btn btn-primary" to="/">
				Balik ke Home
			</Link>
		</div>
	)
}

export default NotFoundPage
