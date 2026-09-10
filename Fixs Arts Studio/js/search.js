/**
 * FIXS.ARTS STUDIO — search.js
 * Pure, DOM-free filtering/sorting helpers.
 * Reused by catalog.js (services) and portfolio.js.
 */

const SearchEngine = (function(){

  function filterServices(services, { query, category }){
    let result = services.filter(s => s.active !== false);

    if (category && category !== "all"){
      result = result.filter(s => s.category === category);
    }

    if (query && query.trim() !== ""){
      const q = query.trim().toLowerCase();
      result = result.filter(s => {
        const haystack = [
          s.title,
          s.shortDescription,
          s.description,
          s.category,
          ...(s.tags || [])
        ].join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }

    return result;
  }

  function sortServices(services, sortKey){
    const list = services.slice(); // never mutate the original
    switch(sortKey){
      case "price-asc":
        return list.sort((a,b) => a.price - b.price);
      case "price-desc":
        return list.sort((a,b) => b.price - a.price);
      case "az":
        return list.sort((a,b) => a.title.localeCompare(b.title));
      case "newest":
        return list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "recommended":
      default:
        return list.sort((a,b) => (b.featured === true) - (a.featured === true));
    }
  }

  function filterPortfolio(portfolio, { query, category }){
    let result = portfolio.slice();
    if (category && category !== "all"){
      result = result.filter(p => p.category === category);
    }
    if (query && query.trim() !== ""){
      const q = query.trim().toLowerCase();
      result = result.filter(p => {
        const haystack = [p.title, p.description, p.category, p.client].join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }
    return result;
  }

  return { filterServices, sortServices, filterPortfolio };
})();
