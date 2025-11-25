// src/hooks/useSearch.js
import { useState, useEffect, useRef } from 'react';
import { buscarProductos, obtenerSugerenciasBusqueda } from '../data/products';
import { formatearCategoria } from '../utils/formatters';

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
      debounceRef.current = setTimeout(async () => {
        try {
          const nuevasSugerencias = await obtenerSugerenciasBusqueda(searchTerm);
          
          // Formatear categorías en las sugerencias
          const suggestionsFormateadas = nuevasSugerencias.map(product => ({
            ...product,
            // Usar campo en español y formatear
            categoria: formatearCategoria(product.categoria || product.category || '')
          }));
          
          setSuggestions(suggestionsFormateadas);
        } catch (error) {
          console.error('❌ Error obteniendo sugerencias:', error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
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
  const performSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const resultados = await buscarProductos(query);
      
      // ✅ FORMATEAR CATEGORÍAS EN LOS RESULTADOS
      const resultsFormateados = resultados.map(product => ({
        ...product,
        // Usar campo en español y formatear
        categoria: formatearCategoria(product.categoria || product.category || '')
      }));
      
      setSearchResults(resultsFormateados);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Limpiar resultados
  const clearSearch = () => {
    setSearchResults([]);
    setSearchTerm('');
    setSuggestions([]);
  };

  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    searchResults,
    isSearching,
    performSearch,
    clearSearch
  };
};