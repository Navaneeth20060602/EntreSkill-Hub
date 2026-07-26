import "./Search.css";
import { Search as SearchIcon, X } from "lucide-react";

// Reusable search input used across listing/table pages (Mentors, Business
// Ideas, Learning Resources, Admin tables). Fully controlled - the parent
// owns the query string and does the filtering, this just renders the input.
function SearchBar({ value, onChange, placeholder = "Search...", label = "Search", autoFocus = false }) {
    return (
        <div className="search-bar">
            <SearchIcon size={16} className="search-bar-icon" aria-hidden="true" />
            <input
                type="search"
                className="search-bar-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={label}
                autoFocus={autoFocus}
            />
            {value && (
                <button
                    type="button"
                    className="search-bar-clear"
                    aria-label="Clear search"
                    onClick={() => onChange("")}
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

export default SearchBar;
