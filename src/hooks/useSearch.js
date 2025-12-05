import { useState, useEffect, useRef } from 'react';
import { buscarProductos, obtenerSugerenciasBusqueda } from '../data/products';
import { formatearCategoria } from '../utils/formatters';

// Custom hook para búsqueda de productos
export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.length > 1) {
      setIsSearching(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const newSuggestions = await obtenerSugerenciasBusqueda(searchTerm);
          
          const sugerenciasFormateadas = newSuggestions.map(product => ({
            ...product,
            categoria: formatearCategoria(product.categoria)
          }));
          
          setSuggestions(sugerenciasFormateadas);
        } catch (error) {
          console.error('Error obteniendo sugerencias:', error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
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

  // Realizar búsqueda completa
  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const results = await buscarProductos(query);
      
      const resultsFormateados = results.map(product => ({
        ...product,
        categoria: formatearCategoria(product.categoriaNombre || product.categoriaInfo?.nombre || product.categoria || '')
      }));
      
      setSearchResults(resultsFormateados);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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