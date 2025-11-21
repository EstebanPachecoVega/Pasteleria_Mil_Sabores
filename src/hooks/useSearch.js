// src/hooks/useSearch.js
import { useState, useEffect, useRef } from 'react';
import { searchProducts, getSearchSuggestions } from '../data/products';
import { formatearCategoria } from '../utils/formatters'; // ✅ Importar la función

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  // Buscar sugerencias en tiempo real
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.length > 1) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        const newSuggestions = getSearchSuggestions(searchTerm);
        
        // ✅ FORMATEAR CATEGORÍAS EN LAS SUGERENCIAS
        const suggestionsFormateadas = newSuggestions.map(product => ({
          ...product,
          category: formatearCategoria(product.category) // Formatear categoría
        }));
        
        setSuggestions(suggestionsFormateadas);
        setIsSearching(false);
      }, 200);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Buscar productos completos
  const performSearch = (query) => {
    setIsSearching(true);
    setTimeout(() => {
      const results = searchProducts(query);
      
      // ✅ FORMATEAR CATEGORÍAS EN LOS RESULTADOS
      const resultsFormateados = results.map(product => ({
        ...product,
        category: formatearCategoria(product.category) // Formatear categoría
      }));
      
      setSearchResults(resultsFormateados);
      setIsSearching(false);
    }, 300);
  };

  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    searchResults,
    isSearching,
    performSearch
  };
};