import { useMemo } from "react";
import { Candidate, AggregatedStats, FilterState, AGE_GROUPS } from "@/types/election";
import { educationGroups } from "@/data/mockCandidates";

// Helper to normalized qualification
export function getEducationGroup(qualification: string): string {
  if (!qualification) return "Other";
  
  const qual = qualification.trim();
  
  if (educationGroups.phd_mphil.includes(qual)) return "Ph.D / M.Phil";
  if (educationGroups.masters.includes(qual)) return "Masters";
  if (educationGroups.bachelors.includes(qual)) return "Bachelors";
  if (educationGroups.intermediate_plus2_diploma.includes(qual)) return "+2 / Diploma";
  if (educationGroups.slc_see_class10.includes(qual)) return "SLC / SEE";
  if (educationGroups.below_slc.includes(qual)) return "Below SLC";
  if (educationGroups.literacy_status.includes(qual)) return "Literate";
  
  return "Other";
}

// Compute aggregated statistics from candidates
export function useAggregatedStats(candidates: Candidate[]): AggregatedStats {
  return useMemo(() => {
    const stats: AggregatedStats = {
      totalCandidates: candidates.length,
      byParty: {},
      byProvince: {},
      byDistrict: {},
      byGender: {},
      byQualification: {}, // Now stores grouped qualifications
      byAgeGroup: {},
    };

    // Initialize age groups
    AGE_GROUPS.forEach(group => {
      stats.byAgeGroup[group.label] = 0;
    });

    candidates.forEach(candidate => {
      // By Party
      stats.byParty[candidate.PoliticalPartyName] = 
        (stats.byParty[candidate.PoliticalPartyName] || 0) + 1;

      // By Province
      stats.byProvince[candidate.StateName] = 
        (stats.byProvince[candidate.StateName] || 0) + 1;

      // By District
      stats.byDistrict[candidate.DistrictName] = 
        (stats.byDistrict[candidate.DistrictName] || 0) + 1;

      // By Gender
      stats.byGender[candidate.Gender] = 
        (stats.byGender[candidate.Gender] || 0) + 1;

      // By Qualification (Grouped)
      const eduGroup = getEducationGroup(candidate.QUALIFICATION);
      stats.byQualification[eduGroup] = 
        (stats.byQualification[eduGroup] || 0) + 1;

      // By Age Group
      const ageGroup = AGE_GROUPS.find(
        g => candidate.AGE_YR >= g.min && candidate.AGE_YR <= g.max
      );
      if (ageGroup) {
        stats.byAgeGroup[ageGroup.label]++;
      }
    });

    return stats;
  }, [candidates]);
}

// Filter candidates based on filter state
export function useFilteredCandidates(
  candidates: Candidate[],
  filters: FilterState
): Candidate[] {
  return useMemo(() => {
    return candidates.filter(candidate => {
      if (filters.province && candidate.StateName !== filters.province) {
        return false;
      }
      if (filters.district && candidate.DistrictName !== filters.district) {
        return false;
      }
      if (filters.constituency && candidate.SCConstID !== filters.constituency) {
        return false;
      }
      if (filters.party && candidate.PoliticalPartyName !== filters.party) {
        return false;
      }
      // Filter by Grouped Qualification
      if (filters.qualification && getEducationGroup(candidate.QUALIFICATION) !== filters.qualification) {
        return false;
      }
      if (filters.gender && candidate.Gender !== filters.gender) {
        return false;
      }
      if (filters.ageMin && candidate.AGE_YR < filters.ageMin) {
        return false;
      }
      if (filters.ageMax && candidate.AGE_YR > filters.ageMax) {
        return false;
      }
      return true;
    });
  }, [candidates, filters]);
}

// Get unique values for filter options with dependent logic
export function useFilterOptions(candidates: Candidate[], filters?: FilterState) {
  return useMemo(() => {
    // Helper to get unique values from a filtered list of candidates
    const getUniqueValues = (
      field: keyof Candidate | 'EDUCATION_GROUP', // Virtual field
      currentFilters: FilterState,
      excludeField: keyof FilterState
    ) => {
      // Create a filter object excluding the current field to allow changing selection
      // while respecting other filters
      const effectiveFilters = { ...currentFilters };
      
      if (excludeField) {
        // Use type assertion to allow setting null on a key that might strict typed
        (effectiveFilters as Record<string, unknown>)[excludeField] = null;
      }

      const filtered = candidates.filter(candidate => {
        if (effectiveFilters.province && candidate.StateName !== effectiveFilters.province) return false;
        if (effectiveFilters.district && candidate.DistrictName !== effectiveFilters.district) return false;
        if (effectiveFilters.constituency && candidate.SCConstID !== effectiveFilters.constituency) return false;
        if (effectiveFilters.party && candidate.PoliticalPartyName !== effectiveFilters.party) return false;
        // Filter check for qualification uses the group
        if (effectiveFilters.qualification && getEducationGroup(candidate.QUALIFICATION) !== effectiveFilters.qualification) return false;
        
        if (effectiveFilters.gender && candidate.Gender !== effectiveFilters.gender) return false;
        if (effectiveFilters.ageMin && candidate.AGE_YR < effectiveFilters.ageMin) return false;
        if (effectiveFilters.ageMax && candidate.AGE_YR > effectiveFilters.ageMax) return false;
        return true;
      });

      if (field === 'EDUCATION_GROUP') {
        const groups = new Set(filtered.map(c => getEducationGroup(c.QUALIFICATION)));
        // Return sorted by education level if possible, otherwise alphabetical
        // We can define a hierarchy for sorting
        const hierarchy = ["Ph.D / M.Phil", "Masters", "Bachelors", "+2 / Diploma", "SLC / SEE", "Below SLC", "Literate", "Other"];
        return [...groups].sort((a, b) => hierarchy.indexOf(a) - hierarchy.indexOf(b));
      }

      if (field === 'PoliticalPartyName') {
         const uniqueParties = [...new Set(filtered.map(c => c.PoliticalPartyName))];
         const PRIORITY_PARTIES = [
          "राष्ट्रिय स्वतन्त्र पार्टी",
          "नेपाली काँग्रेस",
          "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)",
          "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)",
          "राष्ट्रिय प्रजातन्त्र पार्टी",
          "जनता समाजवादी पार्टी, नेपाल",
          "जनमत पार्टी",
          "स्वतन्त्र"
        ];
        
        return uniqueParties.sort((a, b) => {
          const idxA = PRIORITY_PARTIES.indexOf(a);
          const idxB = PRIORITY_PARTIES.indexOf(b);
          
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          
          return a.localeCompare(b);
        });
      }

      return [...new Set(filtered.map(c => c[field] as string | number))].sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });
    };

    if (!filters) {
        const provinces = [...new Set(candidates.map(c => c.StateName))].sort();
        const districts = [...new Set(candidates.map(c => c.DistrictName))].sort();
        const constituencies = [...new Set(candidates.map(c => c.SCConstID))].sort((a, b) => (a || 0) - (b || 0));
        
        const PRIORITY_PARTIES = [
          "नेपाली काँग्रेस",
          "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)",
          "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)",
          "राष्ट्रिय स्वतन्त्र पार्टी",
          "राष्ट्रिय प्रजातन्त्र पार्टी",
          "जनता समाजवादी पार्टी, नेपाल",
          "जनमत पार्टी",
          "स्वतन्त्र"
        ];
        
        const parties = [...new Set(candidates.map(c => c.PoliticalPartyName))].sort((a, b) => {
          const idxA = PRIORITY_PARTIES.indexOf(a);
          const idxB = PRIORITY_PARTIES.indexOf(b);
          
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          
          return a.localeCompare(b);
        });
        // Initial qualifications are just all available groups
        const hierarchy = ["Ph.D / M.Phil", "Masters", "Bachelors", "+2 / Diploma", "SLC / SEE", "Below SLC", "Literate", "Other"];
        const qualifications = [...new Set(candidates.map(c => getEducationGroup(c.QUALIFICATION)))].sort((a, b) => hierarchy.indexOf(a) - hierarchy.indexOf(b));
        
        const genders = [...new Set(candidates.map(c => c.Gender))];
        return { provinces, districts, constituencies, parties, qualifications, genders };
    }

    return {
      provinces: getUniqueValues("StateName", filters, "province") as string[],
      districts: getUniqueValues("DistrictName", filters, "district") as string[],
      constituencies: getUniqueValues("SCConstID", filters, "constituency") as number[],
      parties: getUniqueValues("PoliticalPartyName", filters, "party") as string[],
      qualifications: getUniqueValues("EDUCATION_GROUP", filters, "qualification") as string[],
      genders: getUniqueValues("Gender", filters, "gender") as string[],
    };
  }, [candidates, filters]);
}

// Convert record to chart data
export function recordToChartData(
  record: Record<string, number>,
  limit?: number
): { name: string; value: number }[] {
  const entries = Object.entries(record)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  return limit ? entries.slice(0, limit) : entries;
}

// Short party name for display
export function getShortPartyName(fullName: string): string {
  const shortNames: Record<string, string> = {
    "नेपाली काँग्रेस": "काँग्रेस",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "एमाले",
    "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "माओवादी",
    "राष्ट्रिय स्वतन्त्र पार्टी": "रास्वपा",
    "राष्ट्रिय प्रजातन्त्र पार्टी": "राप्रपा",
    "जनता समाजवादी पार्टी, नेपाल": "जसपा",
    "स्वतन्त्र": "स्वतन्त्र",
  };
  return shortNames[fullName] || fullName.slice(0, 15);
}
