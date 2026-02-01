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

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  options: {
    provinces: string[];
    districts: string[];
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
        <Select
          value={filters.province || "all"}
          onValueChange={(v) => updateFilter("province", v)}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="प्रदेश (Province)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">सबै प्रदेश</SelectItem>
            {options.provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* District Filter */}
        <Select
          value={filters.district || "all"}
          onValueChange={(v) => updateFilter("district", v)}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="जिल्ला (District)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">सबै जिल्ला</SelectItem>
            {options.districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Party Filter */}
        <Select
          value={filters.party || "all"}
          onValueChange={(v) => updateFilter("party", v)}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="पार्टी (Party)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">सबै पार्टी</SelectItem>
            {options.parties.map((party) => (
              <SelectItem key={party} value={party}>
                {party}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
