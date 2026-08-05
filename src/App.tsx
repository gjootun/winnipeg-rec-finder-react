/******************
    Assignment 5 - React
    Name: Gyanee Jootun
    Description: Assignment 5 
*******************/

import React, { useState, useEffect, useCallback } from "react";

// build the <select> dropdown in the search form
const AMENITY_OPTIONS = [
  { value: "", label: "Any amenity" },
  { value: "arena", label: "Arena" },
  { value: "indoor_pool", label: "Indoor Pool" },
  { value: "outdoor_pool", label: "Outdoor Pool" },
  { value: "community_centre", label: "Community Centre" },
  { value: "fitness_leisure_centre", label: "Fitness Centre" },
  { value: "indoor_soccer", label: "Indoor Soccer" },
  { value: "skate_park", label: "Skate Park" },
  { value: "spray_pad", label: "Spray Pad" },
  { value: "wading_pool", label: "Wading Pool" },
  { value: "library", label: "Library" },
];

// Each key here is a real field returned by the Winnipeg dataset
const AMENITY_LABELS = {
  arena: "🏒 Arena",
  community_centre: "🏠 Community Centre",
  indoor_pool: "🏊 Indoor Pool",
  outdoor_pool: "🌊 Outdoor Pool",
  indoor_soccer: "⚽ Indoor Soccer",
  fitness_leisure_centre: "💪 Fitness Centre",
  library: "📚 Library",
  skate_park: "🛹 Skate Park",
  spray_pad: "💦 Spray Pad",
  wading_pool: "🐥 Wading Pool",
};

/**
 * Looks at one complex record from the API and returns an array of
 *  amenity labels for whichever amenities that complex has.
 */
function getAmenityLabels(complex) {
  return Object.entries(AMENITY_LABELS)
    .filter(([field]) => complex[field] === "true" || complex[field] === true)
    .map(([, label]) => label);
}

/* The Winnipeg Open Data endpoint uses "SoQL"  */

const BASE_URL = "https://data.winnipeg.ca/resource/bmi4-vvs2.json?";

/**
 * Takes the current filter values (amenity, nameSearch, orderBy, limit)
 * and turns them into a full request URL with the right SoQL parameters.
 */
function buildUrl({ amenity, nameSearch, orderBy, limit }) {
  // clauses will hold each condition that goes 
  const clauses = [];

  // Only add an amenity condition if the user picked one

  // Only add a name condition if the user actually typed something
  if (nameSearch.trim().length > 0) {
    // lower
    clauses.push(`lower(complex_name) LIKE lower('%${nameSearch.trim()}%')`);
  }

  // Join every clause with AND
  // If there are no clauses at all, skip the $where parameter entirely.
  const where = clauses.length > 0 ? `$where=${clauses.join(" AND ")}&` : "";

  // Sort ascending or descending by complex name depending on the dropdown
  const order = orderBy === "nameDesc" ? "complex_name DESC" : "complex_name ASC";

  // Stitch the full URL together and encode it so spaces or special characters
  const url = `${BASE_URL}${where}$order=${order}&$limit=${limit}`;
  return encodeURI(url);
}

/*
   COMPONENT: FilterForm -search form at the top of the page.
   It just keeps track of what the user has
   typed */

function FilterForm({ filters, onFilterChange, onSearch, isLoading }) {
  // Destructure the individual filter values out of the filters object
  const { amenity, nameSearch, orderBy, limit } = filters;

  // Runs when the form is submitted
  // preventDefault() stops the browser from doing a full page reload.
  function handleSubmit(e) {
    e.preventDefault();
    onSearch();
  }

  return (
    <form className="search-card" onSubmit={handleSubmit}>
      <div className="form-row">
        {/* ---- Amenity dropdown ---- */}
        <div className="form-group">
          <label htmlFor="amenitySelect">Amenity</label>
          <select
            id="amenitySelect"
            value={amenity}
            // Spread the existing filters
            // nameSearch/orderBy/limit exactly as they are
            onChange={(e) => onFilterChange({ ...filters, amenity: e.target.value })}
          >
            {AMENITY_OPTIONS.map(({ value, label }) => (
              <option key={value || "any"} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* ---- Name search box ---- */}
        <div className="form-group">
          <label htmlFor="nameSearch">Complex Name</label>
          <input
            id="nameSearch"
            type="text"
            placeholder="e.g. Seven Oaks, Pan Am…"
            value={nameSearch}
            onChange={(e) => onFilterChange({ ...filters, nameSearch: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row">
        {/* ---- Sort order dropdown ---- */}
        <div className="form-group">
          <label htmlFor="orderBy">Sort by</label>
          <select
            id="orderBy"
            value={orderBy}
            onChange={(e) => onFilterChange({ ...filters, orderBy: e.target.value })}
          >
            <option value="nameAsc">Name A → Z</option>
            <option value="nameDesc">Name Z → A</option>
          </select>
        </div>

        {/* ---- Max results number input ---- */}
        <div className="form-group">
          <label htmlFor="limitSearch">Max results</label>
          <input
            id="limitSearch"
            type="number"
            min="1"
            max="100"
            value={limit}
            onChange={(e) => onFilterChange({ ...filters, limit: e.target.value })}
          />
        </div>
      </div>

      {}
      <button id="searchBtn" type="submit" disabled={isLoading}>
        {isLoading ? "Searching…" : "🔍 Find Complexes"}
      </button>
    </form>
  );
}

/* ComplexCard - Renders ONE recreation complex as a card: name, address,
   amenity badges toggle button */

function ComplexCard({ complex, isFavorite, onToggleFavorite }) {
  // Destructure the two fields we need straight out of the complex object.
  const { complex_name, address } = complex;

  // Fallback text in case the API ever returns a blank name/address.
  const name = complex_name || "Unnamed Complex";
  const displayAddress = address || "Address not listed";

  // Turn the raw true/false fields on "complex" into readable badge labels.
  const amenities = getAmenityLabels(complex);

  return (
    //  literal builds the className dynamically
    <article className={`rec-card ${isFavorite ? "favorited" : ""}`}>
      <button
        className="fav-btn"
        onClick={() => onToggleFavorite(name)}
        aria-label={isFavorite ? "Remove favorite" : "Save as favorite"}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <h3>{name}</h3>

      <div className="detail">
        <span className="icon">📍</span>
        <span>{displayAddress}</span>
      </div>

      <div className="amenities">
        {/* If this complex has amenities, show a badge for each one.
            Otherwise show a small placeholder message. */}
        {amenities.length > 0 ? (
          amenities.map((label) => (
            <span key={label} className="badge">
              {label}
            </span>
          ))
        ) : (
          <span className="no-amenities">No amenities listed</span>
        )}
      </div>
    </article>
  );
}

/* ResultsGrid - Takes the array of complexes and turns each one into a
   ComplexCard.  */

function ResultsGrid({ complexes, favorites, onToggleFavorite }) {
  // Empty state: nothing matched the search
  if (complexes.length === 0) {
    return (
      <div className="message">
        <span className="big-icon">🏗️</span>
        <strong>No complexes found.</strong>
        <br />
        Try a different name or amenity filter.
      </div>
    );
  }

  return (
    <div id="output">
      {}
      {complexes.map((complex) => (
        <ComplexCard
          key={complex.complex_name}
          complex={complex}
          // .includes() checks if this complex's name is in the favorites array
          isFavorite={favorites.includes(complex.complex_name)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

/* App 
   Holds all the shared state (filters, results, loading, error,
   favorites), does the actual fetching, and lays out the page
   by rendering FilterForm, ResultsGrid */

function App() {
  // filters: everything the search form controls, bundled into one object
  const [filters, setFilters] = useState({
    amenity: "",
    nameSearch: "",
    orderBy: "nameAsc",
    limit: "20",
  });

  const [complexes, setComplexes] = useState([]);     // the fetched results
  const [isLoading, setIsLoading] = useState(false);  // true while fetching
  const [error, setError] = useState(null);           // error message, if any
  const [hasSearched, setHasSearched] = useState(false); // true after first search finishes
  const [favorites, setFavorites] = useState([]);      // array of favorited complex names

  /**
   * Fetches data from the Winnipeg API using the CURRENT filters.
   * Wrapped in useCallback so this function only gets recreated 
   */
  const runSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(buildUrl(filters));

      if (!res.ok) throw new Error("Something went wrong");

      const data = await res.json();
      // Guard against the API ever returning something unexpected.
      setComplexes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setComplexes([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, [filters]);

  /**
   * useEffect with an empty dependency array ([]) runs exactly ONCE, right
   * after the component first renders
   */
  useEffect(() => {
    runSearch();
  }, []);

  /**
   * Adds or removes a complex name from the favorites array.
   */
  function toggleFavorite(name) {
    setFavorites((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name) // already a favorite → remove it
        : [...prev, name]                 // not a favorite yet → add it
    );
  }

  return (
    // <> </> is a React Fragment - lets us return multiple top-level
    // elements (header, main, footer) without wrapping them in an
    <>
      <header>
        <div className="header-icon">
          <img
            src="https://www.stanthony.ca/wp-content/uploads/2020/06/caring-clipart-care-plan-6.jpg"
            alt="Recreation icon"
          />
        </div>
        <h1>Winnipeg Rec Finder</h1>
        <p className="tagline">
          Search the City's recreation complexes - pools, arenas, gyms & more.
        </p>
      </header>

      <main>
        {/* The search form. All the filter state and handlers live up here
            in App and get passed DOWN to FilterForm as props. */}
        <FilterForm
          filters={filters}
          onFilterChange={setFilters}
          onSearch={runSearch}
          isLoading={isLoading}
        />

        {/* show the result count once a search has actually finished,
            and only if we're not currently loading or showing an error. */}
        {hasSearched && !isLoading && !error && (
          <p id="resultCount">
            Showing {complexes.length} result{complexes.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="message">
            <span className="big-icon">⏳</span>
            Searching…
          </div>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <div className="message">
            <span className="big-icon">⚠️</span>
            <strong>Something went wrong.</strong>
            <br />
            Check your connection and try again.
          </div>
        )}

        {/* The actual results grid  */}
        {!isLoading && !error && (
          <ResultsGrid
            complexes={complexes}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </main>

      <footer>
      <p>
  Data sourced from the{" "}
  <a>
    href="https://data.winnipeg.ca/Recreation/Recreation-Complex/xuqw-wemm"
    target="_blank"
    rel="noreferrer"
  >
    City of Winnipeg Open Data Portal
  </a>
</p>
      </footer>
    </>
  );
}

export default App;