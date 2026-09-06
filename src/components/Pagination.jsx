const DELTA = 1

const getPageNumbers = (current, total) => {
	const pages = []

	for (let i = 1; i <= total; i++) {
		if (i === 1 || i === total || (i >= current - DELTA && i <= current + DELTA)) {
			pages.push(i)
		}
	}

	const withDots = []
	let prevPage = 0

	for (const page of pages) {
		if (prevPage && page - prevPage > 1) {
			withDots.push(`dots-${prevPage}`)
		}
		withDots.push(page)
		prevPage = page
	}

	return withDots
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	if (totalPages <= 1) return null

	const pages = getPageNumbers(currentPage, totalPages)

	return (
		<div className="pagination">
			<button
				className="btn"
				disabled={currentPage === 1}
				onClick={() => onPageChange(currentPage - 1)}
			>
				Previous
			</button>

			<div className="pagination-numbers">
				{pages.map((page) =>
					typeof page === "number" ? (
						<button
							key={page}
							className={`pagination-number${
								page === currentPage ? " is-active" : ""
							}`}
							aria-current={page === currentPage ? "page" : undefined}
							onClick={() => onPageChange(page)}
						>
							{page}
						</button>
					) : (
						<span key={page} className="pagination-dots">
							…
						</span>
					),
				)}
			</div>

			<button
				className="btn"
				disabled={currentPage === totalPages}
				onClick={() => onPageChange(currentPage + 1)}
			>
				Next
			</button>
		</div>
	)
}

export default Pagination
