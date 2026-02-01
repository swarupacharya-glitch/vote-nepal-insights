import { X } from "lucide-react";
import { FilterState } from "@/types/election";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { DISTRICT_MAP_EN_NP, PARTY_MAP_EN_NP, PROVINCE_MAP_EN_NP } from "@/data/mappings";

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  options: {
    provinces: string[];
    districts: string[];
    constituencies: number[];
    parties: string[];
    qualifications: string[];
    genders: string[];
  };
  className?: string;
}

export function FilterPanel({
  filters,
  onFilterChange,
  options,
  className,
}: FilterPanelProps) {
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== null
  ).length;

  const clearFilters = () => {
    onFilterChange({
      province: null,
      district: null,
      constituency: null,
      party: null,
      qualification: null,
      gender: null,
      ageMin: null,
      ageMax: null,
    });
  };

  const updateFilter = (key: keyof FilterState, value: string | number | null) => {
    onFilterChange({
      ...filters,
      [key]: value === "all" ? null : value,
    });
  };

  // Helper to reverse map for search keywords
  const getKeywords = (value: string, map: Record<string, string>) => {
    return Object.entries(map)
      .filter(([_, v]) => v === value)
      .map(([k]) => k);
  };

  const provinceOptions = options.provinces.map(p => ({ 
    label: p, 
    value: p,
    keywords: getKeywords(p, PROVINCE_MAP_EN_NP)
  }));
  
  const districtOptions = options.districts.map(d => ({ 
    label: d, 
    value: d,
    keywords: getKeywords(d, DISTRICT_MAP_EN_NP)
  }));
  
  const partyOptions = options.parties.map(p => ({ 
    label: p, 
    value: p,
    keywords: getKeywords(p, PARTY_MAP_EN_NP)
  }));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">फिल्टर</h3>
          <span className="text-sm text-muted-foreground">(Filters)</span>
          {activeFiltersCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Province Filter */}
        <Combobox
          options={provinceOptions}
          value={filters.province}
          onSelect={(v) => updateFilter("province", v)}
          placeholder="प्रदेश (Province)"
          searchPlaceholder="Search province..."
          emptyText="No province found."
        />

        {/* District Filter */}
        <Combobox
          options={districtOptions}
          value={filters.district}
          onSelect={(v) => updateFilter("district", v)}
          placeholder="जिल्ला (District)"
          searchPlaceholder="Search district..."
          emptyText="No district found."
        />

        {/* Constituency Filter */}
        <Select
          value={filters.constituency?.toString() || "all"}
          onValueChange={(v) => updateFilter("constituency", v === "all" ? "all" : parseInt(v))}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="क्षेत्र (Area)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">सबै क्षेत्र</SelectItem>
            {options.constituencies.map((constituency) => (
              <SelectItem key={constituency} value={constituency.toString()}>
                Area {constituency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Party Filter */}
        <Combobox
          options={partyOptions}
          value={filters.party}
          onSelect={(v) => updateFilter("party", v)}
          placeholder="पार्टी (Party)"
          searchPlaceholder="Search party..."
          emptyText="No party found."
        />

        {/* Qualification Filter */}
        <Select
          value={filters.qualification || "all"}
          onValueChange={(v) => updateFilter("qualification", v)}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="योग्यता (Qualification)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">सबै योग्यता</SelectItem>
            {options.qualifications.map((qual) => (
              <SelectItem key={qual} value={qual}>
                {qual}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Gender Filter */}
        <Select
          value={filters.gender || "all"}
          onValueChange={(v) => updateFilter("gender", v)}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="लिङ्ग (Gender)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">सबै लिङ्ग</SelectItem>
            {options.genders.map((gender) => (
              <SelectItem key={gender} value={gender}>
                {gender}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Age Range Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>उमेर: {filters.ageMin || 25} - {filters.ageMax || 70}</span>
          </div>
          <Slider
            min={25}
            max={70}
            step={5}
            value={[filters.ageMin || 25, filters.ageMax || 70]}
            onValueChange={([min, max]) => {
              onFilterChange({
                ...filters,
                ageMin: min === 25 ? null : min,
                ageMax: max === 70 ? null : max,
              });
            }}
            className="py-2"
          />
        </div>
      </div>
    </div>
  );
}
