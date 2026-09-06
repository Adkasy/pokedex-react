const SkeletonCard = () => {
	return (
		<li className="pokemon-card skeleton-card">
			<div className="skeleton-favorite" />

			<div className="pokemon-card-body">
				<div className="skeleton-line skeleton-id" />
				<div className="skeleton-line skeleton-name" />
				<div className="skeleton-line skeleton-badge" />
			</div>

			<div className="skeleton-play" />
			<div className="skeleton-circle" />
		</li>
	)
}

export default SkeletonCard
