import { TYPE_COLORS, getTypeColor } from "../constants/typeColors"
import TypeIcon from "./TypeIcon"

export const TypeFilter = ({ selectedTypes, onToggleType, onReset }) => (
	<div className="type-filter">
		<div className="type-filter-header">
			<span className="type-filter-title">Filter by Type</span>
			{selectedTypes.length > 0 && (
				<button type="button" className="type-filter-reset" onClick={onReset}>
					Reset ({selectedTypes.length})
				</button>
			)}
		</div>

		<div className="type-filter-grid">
			{Object.keys(TYPE_COLORS).map((typeName) => {
				const isSelected = selectedTypes.includes(typeName)

				return (
					<label
						key={typeName}
						className={`type-filter-option${isSelected ? " is-selected" : ""}`}
					>
						<input
							type="checkbox"
							checked={isSelected}
							onChange={() => onToggleType(typeName)}
							style={{ accentColor: "white" }}
						/>
						<span
							className="type-filter-swatch"
							style={{ backgroundColor: getTypeColor(typeName) }}
						>
							<TypeIcon type={typeName} size={11} />
						</span>
						{typeName}
					</label>
				)
			})}
		</div>
	</div>
)
