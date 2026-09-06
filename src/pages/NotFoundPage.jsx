import { Link } from "react-router"
import { PokeballIcon } from "../components/TypeIcon"

const NotFoundPage = () => {
	return (
		<div className="not-found-page">
			<PokeballIcon size={160} />
			<h1 className="not-found-title">404</h1>
			<p className="status-message">Page not found.</p>
			<Link className="btn btn-primary" to="/">
				Back to Home
			</Link>
		</div>
	)
}

export default NotFoundPage
