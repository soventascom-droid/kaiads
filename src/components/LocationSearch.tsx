import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  name: string;
  type: 'country' | 'city' | 'region';
  parent?: string;
}

interface LocationSearchProps {
  selectedLocations: Location[];
  onLocationsChange: (locations: Location[]) => void;
  placeholder?: string;
}

// Extended mock data with countries, cities and regions
const mockLocations: Location[] = [
  // Countries
  { id: 'co', name: 'Colombia', type: 'country' },
  { id: 'mx', name: 'México', type: 'country' },
  { id: 'ar', name: 'Argentina', type: 'country' },
  { id: 'es', name: 'España', type: 'country' },
  { id: 'us', name: 'Estados Unidos', type: 'country' },
  { id: 'pe', name: 'Perú', type: 'country' },
  { id: 'cl', name: 'Chile', type: 'country' },
  { id: 'br', name: 'Brasil', type: 'country' },
  { id: 'ec', name: 'Ecuador', type: 'country' },
  { id: 've', name: 'Venezuela', type: 'country' },
  { id: 'pa', name: 'Panamá', type: 'country' },
  { id: 'cr', name: 'Costa Rica', type: 'country' },
  { id: 'gt', name: 'Guatemala', type: 'country' },
  { id: 'bo', name: 'Bolivia', type: 'country' },
  { id: 'py', name: 'Paraguay', type: 'country' },
  { id: 'uy', name: 'Uruguay', type: 'country' },
  { id: 'do', name: 'República Dominicana', type: 'country' },
  { id: 'hn', name: 'Honduras', type: 'country' },
  { id: 'sv', name: 'El Salvador', type: 'country' },
  { id: 'ni', name: 'Nicaragua', type: 'country' },
  
  // Colombian cities
  { id: 'bogota', name: 'Bogotá', type: 'city', parent: 'Colombia' },
  { id: 'medellin', name: 'Medellín', type: 'city', parent: 'Colombia' },
  { id: 'cali', name: 'Cali', type: 'city', parent: 'Colombia' },
  { id: 'barranquilla', name: 'Barranquilla', type: 'city', parent: 'Colombia' },
  { id: 'cartagena', name: 'Cartagena', type: 'city', parent: 'Colombia' },
  { id: 'bucaramanga', name: 'Bucaramanga', type: 'city', parent: 'Colombia' },
  { id: 'pereira', name: 'Pereira', type: 'city', parent: 'Colombia' },
  
  // Mexican cities
  { id: 'cdmx', name: 'Ciudad de México', type: 'city', parent: 'México' },
  { id: 'guadalajara', name: 'Guadalajara', type: 'city', parent: 'México' },
  { id: 'monterrey', name: 'Monterrey', type: 'city', parent: 'México' },
  { id: 'puebla', name: 'Puebla', type: 'city', parent: 'México' },
  { id: 'tijuana', name: 'Tijuana', type: 'city', parent: 'México' },
  { id: 'cancun', name: 'Cancún', type: 'city', parent: 'México' },
  
  // Argentine cities
  { id: 'bsas', name: 'Buenos Aires', type: 'city', parent: 'Argentina' },
  { id: 'cordoba', name: 'Córdoba', type: 'city', parent: 'Argentina' },
  { id: 'rosario', name: 'Rosario', type: 'city', parent: 'Argentina' },
  { id: 'mendoza', name: 'Mendoza', type: 'city', parent: 'Argentina' },
  
  // Spanish cities
  { id: 'madrid', name: 'Madrid', type: 'city', parent: 'España' },
  { id: 'barcelona', name: 'Barcelona', type: 'city', parent: 'España' },
  { id: 'valencia', name: 'Valencia', type: 'city', parent: 'España' },
  { id: 'sevilla', name: 'Sevilla', type: 'city', parent: 'España' },
  { id: 'bilbao', name: 'Bilbao', type: 'city', parent: 'España' },
  
  // US cities
  { id: 'miami', name: 'Miami', type: 'city', parent: 'Estados Unidos' },
  { id: 'nyc', name: 'Nueva York', type: 'city', parent: 'Estados Unidos' },
  { id: 'la', name: 'Los Angeles', type: 'city', parent: 'Estados Unidos' },
  { id: 'houston', name: 'Houston', type: 'city', parent: 'Estados Unidos' },
  { id: 'chicago', name: 'Chicago', type: 'city', parent: 'Estados Unidos' },
  
  // Peruvian cities
  { id: 'lima', name: 'Lima', type: 'city', parent: 'Perú' },
  { id: 'arequipa', name: 'Arequipa', type: 'city', parent: 'Perú' },
  { id: 'cusco', name: 'Cusco', type: 'city', parent: 'Perú' },
  
  // Chilean cities
  { id: 'santiago', name: 'Santiago', type: 'city', parent: 'Chile' },
  { id: 'valparaiso', name: 'Valparaíso', type: 'city', parent: 'Chile' },
  
  // Brazilian cities
  { id: 'saopaulo', name: 'São Paulo', type: 'city', parent: 'Brasil' },
  { id: 'rio', name: 'Río de Janeiro', type: 'city', parent: 'Brasil' },
  
  // Regions
  { id: 'latam', name: 'Latinoamérica', type: 'region' },
  { id: 'europa', name: 'Europa', type: 'region' },
  { id: 'norteamerica', name: 'Norteamérica', type: 'region' },
  { id: 'centroamerica', name: 'Centroamérica', type: 'region' },
  { id: 'caribe', name: 'Caribe', type: 'region' },
];

const LocationSearch = ({ 
  selectedLocations, 
  onLocationsChange, 
  placeholder = "Buscar lugares (países, ciudades, regiones)..." 
}: LocationSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter locations based on query
  useEffect(() => {
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      const filtered = mockLocations
        .filter(loc => 
          !selectedLocations.some(sel => sel.id === loc.id) &&
          (loc.name.toLowerCase().includes(lowerQuery) ||
           (loc.parent?.toLowerCase().includes(lowerQuery)))
        )
        .slice(0, 10);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [query, selectedLocations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = useCallback((location: Location) => {
    onLocationsChange([...selectedLocations, location]);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, [selectedLocations, onLocationsChange]);

  const handleRemoveLocation = useCallback((locationId: string) => {
    onLocationsChange(selectedLocations.filter(loc => loc.id !== locationId));
  }, [selectedLocations, onLocationsChange]);

  const getTypeLabel = (type: Location['type']) => {
    switch (type) {
      case 'country': return 'País';
      case 'city': return 'Ciudad';
      case 'region': return 'Región';
    }
  };

  const getTypeColor = (type: Location['type']) => {
    switch (type) {
      case 'country': return 'bg-blue-500/20 text-blue-400';
      case 'city': return 'bg-green-500/20 text-green-400';
      case 'region': return 'bg-purple-500/20 text-purple-400';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-12 pl-11 pr-4 w-full border-primary/30 focus:border-primary bg-background"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {filteredLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => handleSelectLocation(location)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left"
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {location.name}
                  {location.parent && (
                    <span className="text-muted-foreground font-normal">, {location.parent}</span>
                  )}
                </p>
              </div>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                getTypeColor(location.type)
              )}>
                {getTypeLabel(location.type)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && filteredLocations.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl p-4">
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron resultados para "{query}"
          </p>
        </div>
      )}

      {/* Selected Location Tags */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedLocations.map((location) => (
            <div
              key={location.id}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                getTypeColor(location.type)
              )}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {location.name}
                {location.parent && <span className="opacity-70">, {location.parent}</span>}
              </span>
              <button
                onClick={() => handleRemoveLocation(location.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
